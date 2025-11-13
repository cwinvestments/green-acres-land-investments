const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client, Environment } = require('square');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const PDFDocument = require('pdfkit');
require('dotenv').config();

const db = require('./database');

// Configure Cloudinary - Railway uses different env var names
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log Cloudinary config to verify (without exposing secrets)
console.log('Cloudinary configured:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? 'Set' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'MISSING'
});

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
db.initDatabase().catch(console.error);

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment: process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox,
});

// Middleware
app.use(cors());
app.use(express.json());

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Admin authentication middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user has admin role
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.admin = user;
    next();
  });
}

// Helper function to calculate financing
function calculateFinancing(price, downPaymentPercentage, termMonths) {
  const processingFee = 99;
  
  // Calculate down payment amount
  const downPayment = downPaymentPercentage === 99 
    ? 99 
    : (price * (downPaymentPercentage / 100));
  
  // Determine interest rate based on down payment percentage
  let interestRate;
  if (downPaymentPercentage === 99) {
    interestRate = 18;
  } else if (downPaymentPercentage === 20) {
    interestRate = 12;
  } else {
    interestRate = 8;
  }
  
  // Calculate principal
  const principal = (price - downPayment) + processingFee;
  
  // Calculate monthly interest rate
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate monthly payment
  let monthlyPayment;
  if (monthlyRate === 0) {
    monthlyPayment = principal / termMonths;
  } else {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) 
      / (Math.pow(1 + monthlyRate, termMonths) - 1);
  }
  
  // Enforce minimum payment of $50
  monthlyPayment = Math.max(monthlyPayment, 50);
  
  // Calculate total amount to be paid
  const totalAmount = monthlyPayment * termMonths;
  
  return {
    downPayment: Math.round(downPayment * 100) / 100,
    downPaymentPercentage,
    processingFee,
    principal: Math.round(principal * 100) / 100,
    interestRate,
    termMonths,
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100
  };
}

// Helper function to calculate payment breakdown
async function calculatePaymentBreakdown(loanId) {
  try {
    // Get loan and property details
    const loanResult = await db.pool.query(`
      SELECT l.*, p.annual_tax_amount, p.monthly_hoa_fee
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      WHERE l.id = $1
    `, [loanId]);
    
    if (loanResult.rows.length === 0) {
      throw new Error('Loan not found');
    }
    
    const loan = loanResult.rows[0];
    
    // Base monthly payment
    const loanPayment = parseFloat(loan.monthly_payment);
    
    // Monthly tax (annual ÷ 12)
    const monthlyTax = loan.annual_tax_amount 
      ? parseFloat(loan.annual_tax_amount) / 12 
      : 0;
    
    // Monthly HOA
    const monthlyHoa = loan.monthly_hoa_fee 
      ? parseFloat(loan.monthly_hoa_fee) 
      : 0;
    
    // Check for late fee (7 day grace period)
    let lateFee = 0;
    if (loan.next_payment_date && loan.status === 'active') {
      const dueDate = new Date(loan.next_payment_date);
      const today = new Date();
      const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
      
      if (daysOverdue > 7) {
        lateFee = parseFloat(loan.late_fee_amount || 75);
      }
    }
    
    // Check for notice fees
    let noticeFee = 0;
    let postalFee = 0;
    if (loan.notice_sent_date && !loan.notice_fee_paid) {
      noticeFee = 75;
      postalFee = parseFloat(loan.notice_postal_cost || 0);
    }
    
    // Calculate subtotal
    const subtotal = loanPayment + monthlyTax + monthlyHoa + lateFee + noticeFee + postalFee;
    
    // Calculate Square processing fee (2.9% + $0.30)
    const squareFee = (subtotal * 0.029) + 0.30;
    
    // Convenience fee
    const convenienceFee = 5.00;
    
    // Total
    const total = subtotal + squareFee + convenienceFee;
    
    return {
      loanPayment: parseFloat(loanPayment.toFixed(2)),
      monthlyTax: parseFloat(monthlyTax.toFixed(2)),
      monthlyHoa: parseFloat(monthlyHoa.toFixed(2)),
      lateFee: parseFloat(lateFee.toFixed(2)),
      noticeFee: parseFloat(noticeFee.toFixed(2)),
      postalFee: parseFloat(postalFee.toFixed(2)),
      subtotal: parseFloat(subtotal.toFixed(2)),
      squareFee: parseFloat(squareFee.toFixed(2)),
      convenienceFee: parseFloat(convenienceFee.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
      daysOverdue: loan.next_payment_date ? Math.floor((new Date() - new Date(loan.next_payment_date)) / (1000 * 60 * 60 * 24)) : 0
    };
  } catch (error) {
    console.error('Calculate payment breakdown error:', error);
    throw error;
  }
}

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, recaptchaToken } = req.body;
console.log('Received recaptchaToken:', recaptchaToken ? recaptchaToken.substring(0, 50) + '...' : 'MISSING');
    console.log('Using secret key:', process.env.RECAPTCHA_SECRET_KEY ? 'Present' : 'MISSING');

    // Verify reCAPTCHA token
    if (!recaptchaToken) {
      return res.status(400).json({ error: 'reCAPTCHA verification required' });
    }

    try {
      const https = require('https');
      const querystring = require('querystring');
      
      const postData = querystring.stringify({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: recaptchaToken
      });

      const recaptchaData = await new Promise((resolve, reject) => {
        const req = https.request({
          hostname: 'www.google.com',
          port: 443,
          path: '/recaptcha/api/siteverify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
          }
        }, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      console.log('reCAPTCHA verification result:', recaptchaData);

      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        console.log('reCAPTCHA failed:', recaptchaData);
        return res.status(400).json({ error: 'reCAPTCHA verification failed' });
      }
    } catch (recaptchaError) {
      console.error('reCAPTCHA verification error:', recaptchaError);
      return res.status(500).json({ error: 'reCAPTCHA verification failed' });
    }

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await db.pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, email',
      [email, hashedPassword, firstName, lastName, phone || null]
    );

    const user = result.rows[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await db.pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== PROPERTY ROUTES ====================

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin user
    const result = await db.pool.query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token with admin flag
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.first_name,
        lastName: admin.last_name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get admin tax rate
app.get('/api/admin/tax-rate', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.pool.query(
      'SELECT tax_withholding_rate FROM admin_users WHERE id = $1',
      [req.admin.id]
    );
    res.json({ taxRate: result.rows[0].tax_withholding_rate || 30 });
  } catch (err) {
    console.error('Get tax rate error:', err);
    res.status(500).json({ error: 'Failed to get tax rate' });
  }
});

// Update admin tax rate
app.patch('/api/admin/tax-rate', authenticateAdmin, async (req, res) => {
  try {
    const { taxRate } = req.body;
    await db.pool.query(
      'UPDATE admin_users SET tax_withholding_rate = $1 WHERE id = $2',
      [taxRate, req.admin.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Update tax rate error:', err);
    res.status(500).json({ error: 'Failed to update tax rate' });
  }
});

// ==================== PROPERTY ROUTES ====================

// Get all properties (available and coming soon)
app.get('/api/properties', async (req, res) => {
  try {
    const result = await db.pool.query(
      "SELECT * FROM properties WHERE status IN ('available', 'coming_soon') ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get sold/under contract properties for showcase
app.get('/api/properties/sold', async (req, res) => {
  try {
    const result = await db.pool.query(
      "SELECT * FROM properties WHERE status IN ('pending', 'under_contract', 'sold') ORDER BY created_at DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get sold properties error:', error);
    res.status(500).json({ error: 'Failed to fetch sold properties' });
  }
});

// Get single property
app.get('/api/properties/:id', async (req, res) => {
  try {
    const result = await db.pool.query('SELECT * FROM properties WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// Get admin dashboard statistics
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    // Total properties
    const propertiesResult = await db.pool.query('SELECT COUNT(*) FROM properties');
    const totalProperties = parseInt(propertiesResult.rows[0].count);

    // Active loans
    const activeLoansResult = await db.pool.query("SELECT COUNT(*) FROM loans WHERE status = 'active'");
    const activeLoans = parseInt(activeLoansResult.rows[0].count);

    // Total customers
    const customersResult = await db.pool.query('SELECT COUNT(*) FROM users');
    const totalCustomers = parseInt(customersResult.rows[0].count);

    // Overdue loans (7+ days past due)
    const overdueResult = await db.pool.query(`
      SELECT COUNT(*) 
      FROM loans 
      WHERE status = 'active' 
        AND next_payment_date < CURRENT_DATE - INTERVAL '7 days'
    `);
    const overdueLoans = parseInt(overdueResult.rows[0].count);

    // In default (notice sent)
    const defaultResult = await db.pool.query(`
      SELECT COUNT(*) 
      FROM loans 
      WHERE status = 'active' 
        AND notice_sent_date IS NOT NULL
    `);
    const loansInDefault = parseInt(defaultResult.rows[0].count);

    // Revenue last 30 days
    const revenueResult = await db.pool.query(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE status = 'completed'
        AND payment_date >= CURRENT_DATE - INTERVAL '30 days'
    `);
    const revenueLast30Days = parseFloat(revenueResult.rows[0].revenue);

    // Revenue previous 30 days (for trend comparison)
    const prevRevenueResult = await db.pool.query(`
      SELECT COALESCE(SUM(amount), 0) as revenue
      FROM payments
      WHERE status = 'completed'
        AND payment_date >= CURRENT_DATE - INTERVAL '60 days'
        AND payment_date < CURRENT_DATE - INTERVAL '30 days'
    `);
    const revenuePrev30Days = parseFloat(prevRevenueResult.rows[0].revenue);

    // Calculate revenue trend
    let revenueTrend = 'flat';
    if (revenuePrev30Days > 0) {
      const percentChange = ((revenueLast30Days - revenuePrev30Days) / revenuePrev30Days) * 100;
      if (percentChange > 5) revenueTrend = 'up';
      else if (percentChange < -5) revenueTrend = 'down';
    } else if (revenueLast30Days > 0) {
      revenueTrend = 'up';
    }

    // Collection rate (payments on time)
    const onTimeResult = await db.pool.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN payment_date <= l.next_payment_date THEN 1 ELSE 0 END) as on_time_payments
      FROM payments p
      JOIN loans l ON p.loan_id = l.id
      WHERE p.status = 'completed'
        AND p.payment_type = 'monthly_payment'
        AND p.payment_date >= CURRENT_DATE - INTERVAL '90 days'
    `);
    
    const totalPayments = parseInt(onTimeResult.rows[0].total_payments) || 0;
    const onTimePayments = parseInt(onTimeResult.rows[0].on_time_payments) || 0;
    const collectionRate = totalPayments > 0 ? Math.round((onTimePayments / totalPayments) * 100) : 0;

    // Upcoming tax deadlines (next 60 days)
    const taxDeadlinesResult = await db.pool.query(`
      SELECT 
        p.id,
        p.title,
        p.tax_payment_1_date,
        p.tax_payment_2_date,
        p.tax_payment_1_amount,
        p.tax_payment_2_amount
      FROM properties p
      WHERE 
        (p.tax_payment_1_date IS NOT NULL AND p.tax_payment_1_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days')
        OR
        (p.tax_payment_2_date IS NOT NULL AND p.tax_payment_2_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '60 days')
      ORDER BY 
        LEAST(
          COALESCE(p.tax_payment_1_date, '9999-12-31'::date),
          COALESCE(p.tax_payment_2_date, '9999-12-31'::date)
        )
      LIMIT 5
    `);

    res.json({
      totalProperties,
      activeLoans,
      totalCustomers,
      overdueLoans,
      loansInDefault,
      revenueLast30Days,
      revenueTrend,
      collectionRate,
      taxDeadlines: taxDeadlinesResult.rows
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// ==================== ADMIN PROPERTY ROUTES ====================

// Get all properties (admin - includes all statuses)
app.get('/api/admin/properties', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.pool.query(
      'SELECT * FROM properties ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get all properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Create new property
app.post('/api/admin/properties', authenticateAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      state,
      county,
      acres,
      price,
      acquisition_cost,
      apn,
      coordinates,
      legal_description,
      annual_tax_amount,
      tax_payment_1_date,
      tax_payment_1_amount,
      tax_payment_2_date,
      tax_payment_2_amount,
      tax_notes,
      monthly_hoa_fee,
      hoa_name,
      hoa_contact,
      hoa_notes,
      property_covenants
    } = req.body;
    // Validate required fields
    if (!title || !location || !state || !county || !acres || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await db.pool.query(
      `INSERT INTO properties 
       (title, description, location, state, county, acres, price, acquisition_cost, apn, coordinates, legal_description,
        annual_tax_amount, tax_payment_1_date, tax_payment_1_amount, tax_payment_2_date, tax_payment_2_amount, tax_notes,
        monthly_hoa_fee, hoa_name, hoa_contact, hoa_notes, property_covenants, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, 'available')
       RETURNING *`,
      [title, description, location, state, county, acres, price, acquisition_cost || null, apn || null, coordinates || null, legal_description || null,
       annual_tax_amount || null, tax_payment_1_date || null, tax_payment_1_amount || null, 
       tax_payment_2_date || null, tax_payment_2_amount || null, tax_notes || null,
       monthly_hoa_fee || null, hoa_name || null, hoa_contact || null, hoa_notes || null, property_covenants || null]
    );
    res.status(201).json({
      message: 'Property created successfully',
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Create property error:', error);
    res.status(500).json({ error: 'Failed to create property' });
  }
});
// Update property
app.put('/api/admin/properties/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      location,
      state,
      county,
      acres,
      price,
      acquisition_cost,
      apn,
      coordinates,
      legal_description,
      status,
      annual_tax_amount,
      tax_payment_1_date,
      tax_payment_1_amount,
      tax_payment_2_date,
      tax_payment_2_amount,
      tax_notes,
      monthly_hoa_fee,
      hoa_name,
      hoa_contact,
      hoa_notes,
      property_covenants
    } = req.body;
    
    // Convert empty date strings to null for PostgreSQL
    const cleanTaxDate1 = tax_payment_1_date === '' ? null : tax_payment_1_date;
    const cleanTaxDate2 = tax_payment_2_date === '' ? null : tax_payment_2_date;
    
    const result = await db.pool.query(
      `UPDATE properties 
       SET title = $1, description = $2, location = $3, state = $4, 
           county = $5, acres = $6, price = $7, acquisition_cost = $8,
           apn = $9, coordinates = $10, legal_description = $11, status = $12,
           annual_tax_amount = $13, tax_payment_1_date = $14, tax_payment_1_amount = $15,
           tax_payment_2_date = $16, tax_payment_2_amount = $17, tax_notes = $18,
           monthly_hoa_fee = $19, hoa_name = $20, hoa_contact = $21, hoa_notes = $22,
           property_covenants = $23
       WHERE id = $24
       RETURNING *`,
      [title, description, location, state, county, acres, price, acquisition_cost || null, apn || null, coordinates, legal_description || null, status,
       annual_tax_amount || null, tax_payment_1_date || null, tax_payment_1_amount || null, 
       tax_payment_2_date || null, tax_payment_2_amount || null, tax_notes || null,
       monthly_hoa_fee || null, hoa_name || null, hoa_contact || null, hoa_notes || null, property_covenants || null, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({
      message: 'Property updated successfully',
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Failed to update property' });
  }
});

// Update property status only
app.patch('/api/admin/properties/:id/status', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['available', 'coming_soon', 'pending', 'under_contract', 'sold'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const result = await db.pool.query(
      'UPDATE properties SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      message: 'Property status updated',
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Delete property
app.delete('/api/admin/properties/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if property has any loans
    const loanCheck = await db.pool.query(
      'SELECT COUNT(*) FROM loans WHERE property_id = $1',
      [id]
    );

    if (parseInt(loanCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete property with existing loans' 
      });
    }

    const result = await db.pool.query(
      'DELETE FROM properties WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    res.status(500).json({ error: 'Failed to delete property' });
  }
});

// ==================== ADMIN CUSTOMER ROUTES ====================

// Get all customers with loan summaries
app.get('/api/admin/customers', authenticateAdmin, async (req, res) => {
  try {
    // Get all users
    const usersResult = await db.pool.query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users ORDER BY created_at DESC'
    );
    
    // For each user, get loan summary
    const customersWithLoans = await Promise.all(
      usersResult.rows.map(async (user) => {
        // Get loan count and total balance
        const loanStats = await db.pool.query(
          `SELECT 
            COUNT(*) as loan_count,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_loans,
            SUM(CASE WHEN status = 'active' THEN balance_remaining ELSE 0 END) as total_balance,
            SUM(CASE WHEN status = 'active' THEN monthly_payment ELSE 0 END) as total_monthly_payment
           FROM loans 
           WHERE user_id = $1`,
          [user.id]
        );
        
        return {
          ...user,
          loan_count: parseInt(loanStats.rows[0].loan_count) || 0,
          active_loans: parseInt(loanStats.rows[0].active_loans) || 0,
          total_balance: parseFloat(loanStats.rows[0].total_balance) || 0,
          total_monthly_payment: parseFloat(loanStats.rows[0].total_monthly_payment) || 0
        };
      })
    );
    
    res.json(customersWithLoans);
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get single customer details
app.get('/api/admin/customers/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get customer
    const customerResult = await db.pool.query(
      'SELECT id, email, first_name, last_name, phone, created_at FROM users WHERE id = $1',
      [id]
    );
    
    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const customer = customerResult.rows[0];
    
    // Get customer's loans
    const loansResult = await db.pool.query(
      `SELECT l.*, p.title as property_title, p.location as property_location
       FROM loans l
       JOIN properties p ON l.property_id = p.id
       WHERE l.user_id = $1
       ORDER BY l.created_at DESC`,
      [id]
    );
    
    customer.loans = loansResult.rows;
    
    res.json(customer);
  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// ==================== ADMIN LOAN ROUTES ====================

// Get all loans across all customers
app.get('/api/admin/loans', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT 
        l.*,
        p.title as property_title,
        p.location as property_location,
        p.price as property_price,
        p.acquisition_cost as property_acquisition_cost,
        p.annual_tax_amount,
        p.monthly_hoa_fee,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        c.status as contract_status,
        -- Calculate cure amount
        l.monthly_payment + 
        COALESCE(p.annual_tax_amount / 12, 0) + 
        COALESCE(p.monthly_hoa_fee, 0) +
        COALESCE(l.late_fee_amount, 0) +
        CASE WHEN l.notice_sent_date IS NOT NULL THEN 75.00 ELSE 0 END +
        COALESCE(l.notice_postal_cost, 0) as cure_amount
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      JOIN users u ON l.user_id = u.id
      LEFT JOIN contracts c ON l.id = c.loan_id
      ORDER BY l.created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get all loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Toggle alert status for a loan
app.patch('/api/admin/loans/:id/toggle-alert', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Toggle the alerts_disabled field
    const result = await db.pool.query(
      'UPDATE loans SET alerts_disabled = NOT alerts_disabled WHERE id = $1 RETURNING alerts_disabled',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    res.json({
      message: 'Alert status updated',
      alerts_disabled: result.rows[0].alerts_disabled
    });
  } catch (error) {
    console.error('Toggle alert error:', error);
    res.status(500).json({ error: 'Failed to update alert status' });
  }
});

// Update payment due day for a loan
app.patch('/api/admin/loans/:id/payment-due-day', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_due_day } = req.body;

    // Validate payment_due_day is either 1 or 15
    if (payment_due_day !== 1 && payment_due_day !== 15) {
      return res.status(400).json({ error: 'Payment due day must be 1 or 15' });
    }

    // Get current loan
    const loanResult = await db.pool.query(
      'SELECT * FROM loans WHERE id = $1',
      [id]
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = loanResult.rows[0];
    
    // Calculate new next_payment_date based on new due day
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    let newPaymentDate;
    if (payment_due_day === 1) {
      // Next occurrence of the 1st
      if (currentDay >= 1) {
        newPaymentDate = new Date(currentYear, currentMonth + 1, 1);
      } else {
        newPaymentDate = new Date(currentYear, currentMonth, 1);
      }
    } else {
      // Next occurrence of the 15th
      if (currentDay >= 15) {
        newPaymentDate = new Date(currentYear, currentMonth + 1, 15);
      } else {
        newPaymentDate = new Date(currentYear, currentMonth, 15);
      }
    }
    
    const newPaymentDateStr = newPaymentDate.toISOString().split('T')[0];

    // Update loan
    await db.pool.query(
      'UPDATE loans SET payment_due_day = $1, next_payment_date = $2 WHERE id = $3',
      [payment_due_day, newPaymentDateStr, id]
    );

    res.json({ 
      success: true, 
      message: 'Payment due day updated',
      payment_due_day,
      next_payment_date: newPaymentDateStr
    });
  } catch (error) {
    console.error('Update payment due day error:', error);
    res.status(500).json({ error: 'Failed to update payment due day' });
  }
});

// Admin - Import existing loan with payment history
app.post('/api/admin/loans/import', authenticateAdmin, async (req, res) => {
  const { loanData, payments, taxPayments } = req.body;

  try {
    // Start transaction
    await db.pool.query('BEGIN');

    // Create the loan
    const loanResult = await db.pool.query(
      `INSERT INTO loans (
        user_id, property_id, purchase_price, down_payment, processing_fee,
        loan_amount, interest_rate, term_months, monthly_payment, 
        total_amount, balance_remaining, next_payment_date, payment_due_day,
        status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        loanData.userId,
        loanData.propertyId,
        loanData.purchasePrice,
        loanData.downPayment,
        loanData.processingFee,
        loanData.loanAmount,
        loanData.interestRate,
        loanData.termMonths,
        loanData.monthlyPayment,
        parseFloat(loanData.monthlyPayment) * parseInt(loanData.termMonths),
        loanData.currentBalance,
        loanData.nextPaymentDate,
        loanData.paymentDueDay,
        'active',
        loanData.purchaseDate
      ]
    );

    const loan = loanResult.rows[0];

    // Insert payment history
    for (const payment of payments) {
      await db.pool.query(
        `INSERT INTO payments (
          loan_id, user_id, amount, payment_type, payment_method,
          status, payment_date, principal_amount, interest_amount,
          tax_amount, hoa_amount, late_fee_amount
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          loan.id,
          loanData.userId,
          payment.amount,
          'monthly_payment',
          'imported',
          'completed',
          payment.paymentDate,
          payment.principalAmount || 0,
          payment.interestAmount || 0,
          payment.taxAmount || 0,
          payment.hoaAmount || 0,
          payment.lateFeeAmount || 0
        ]
      );
    }

    // Insert tax payment history
    for (const taxPayment of taxPayments) {
      await db.pool.query(
        `INSERT INTO property_tax_payments (
          property_id, payment_date, amount, tax_year, payment_method, notes
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          loanData.propertyId,
          taxPayment.paymentDate,
          taxPayment.amount,
          taxPayment.taxYear,
          taxPayment.paymentMethod,
          taxPayment.notes || 'Imported from existing loan'
        ]
      );
    }

    // Update property status
    await db.pool.query(
      `UPDATE properties SET status = 'sold' WHERE id = $1`,
      [loanData.propertyId]
    );

    await db.pool.query('COMMIT');

    res.json({ 
      success: true, 
      loan,
      message: `Loan imported successfully with ${payments.length} payments and ${taxPayments.length} tax payments` 
    });

  } catch (error) {
    await db.pool.query('ROLLBACK');
    console.error('Loan import error:', error);
    res.status(500).json({ error: 'Failed to import loan' });
  }
});

// Admin - Create custom loan (for loyal customers, special deals)
app.post('/api/admin/loans/create-custom', authenticateAdmin, async (req, res) => {
  try {
    const { 
      userId, 
      propertyId, 
      purchasePrice,
      downPayment,
      processingFee,
      interestRate,
      termMonths,
      monthlyPayment,
      paymentDueDay,
      notes
    } = req.body;

    // Validate required fields
    if (!userId || !propertyId || !purchasePrice || !monthlyPayment || !termMonths) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get property
    const propertyResult = await db.pool.query(
      'SELECT * FROM properties WHERE id = $1',
      [propertyId]
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const property = propertyResult.rows[0];

    if (property.status !== 'available') {
      return res.status(400).json({ error: 'Property not available' });
    }

    // Calculate loan amount
    const loanAmount = parseFloat(purchasePrice) - parseFloat(downPayment || 0) + parseFloat(processingFee || 0);
    
    // Calculate total amount
    const totalAmount = parseFloat(monthlyPayment) * parseInt(termMonths);

    // Calculate first payment date
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    let firstPaymentDate;
    if (parseInt(paymentDueDay) === 1) {
      firstPaymentDate = new Date(currentYear, currentMonth + 1, 1);
    } else {
      if (currentDay < 15) {
        firstPaymentDate = new Date(currentYear, currentMonth, 15);
      } else {
        firstPaymentDate = new Date(currentYear, currentMonth + 1, 15);
      }
    }
    
    const firstPaymentDateStr = firstPaymentDate.toISOString().split('T')[0];

    // Start transaction
    await db.pool.query('BEGIN');

    // Create loan
    const loanResult = await db.pool.query(`
      INSERT INTO loans (
        user_id, property_id, purchase_price, down_payment, processing_fee,
        loan_amount, interest_rate, term_months, monthly_payment, total_amount,
        balance_remaining, status, next_payment_date, payment_due_day, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      RETURNING *
    `, [
      userId,
      propertyId,
      purchasePrice,
      downPayment || 0,
      processingFee || 0,
      loanAmount,
      interestRate,
      termMonths,
      monthlyPayment,
      totalAmount,
      loanAmount,
      'active',
      firstPaymentDateStr,
      paymentDueDay || 1
    ]);

    const loan = loanResult.rows[0];

    // Record down payment if any (no Square payment for custom loans)
    if (parseFloat(downPayment || 0) > 0) {
      await db.pool.query(`
        INSERT INTO payments (loan_id, user_id, amount, payment_type, payment_method, status, convenience_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        loan.id,
        userId,
        downPayment,
        'down_payment',
        'custom_loan',
        'completed',
        0
      ]);
    }

    // Record processing fee if any
    if (parseFloat(processingFee || 0) > 0) {
      await db.pool.query(`
        INSERT INTO payments (loan_id, user_id, amount, payment_type, payment_method, status, convenience_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        loan.id,
        userId,
        processingFee,
        'processing_fee',
        'custom_loan',
        'completed',
        0
      ]);
    }

    // Update property status
    await db.pool.query('UPDATE properties SET status = $1 WHERE id = $2', ['pending', propertyId]);

    // Add note to loan if provided
    if (notes) {
      await db.pool.query(
        'UPDATE loans SET default_notes = $1 WHERE id = $2',
        [`CUSTOM LOAN: ${notes}`, loan.id]
      );
    }

    await db.pool.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Custom loan created successfully',
      loan
    });

  } catch (error) {
    await db.pool.query('ROLLBACK');
    console.error('Create custom loan error:', error);
    res.status(500).json({ error: 'Failed to create custom loan' });
  }
});

// Delete loan (admin only)
app.delete('/api/admin/loans/:loanId', authenticateAdmin, async (req, res) => {
  const { loanId } = req.params;

  try {
    // Start transaction
    await db.pool.query('BEGIN');

    // Get loan details to find property
    const loanResult = await db.pool.query('SELECT property_id FROM loans WHERE id = $1', [loanId]);
    
    if (loanResult.rowCount === 0) {
      await db.pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Loan not found' });
    }

    const propertyId = loanResult.rows[0].property_id;

    // Delete all related records first (foreign key constraints)
    await db.pool.query('DELETE FROM loan_notices WHERE loan_id = $1', [loanId]);
    await db.pool.query('DELETE FROM payments WHERE loan_id = $1', [loanId]);
    await db.pool.query('DELETE FROM contracts WHERE loan_id = $1', [loanId]);

    // Delete the loan
    await db.pool.query('DELETE FROM loans WHERE id = $1', [loanId]);

    // Set property back to available
    await db.pool.query('UPDATE properties SET status = $1 WHERE id = $2', ['available', propertyId]);

    await db.pool.query('COMMIT');
    res.json({ message: 'Loan deleted successfully' });
  } catch (err) {
    await db.pool.query('ROLLBACK');
    console.error('Delete loan error:', err);
    res.status(500).json({ error: 'Failed to delete loan' });
  }
});

// Admin - Mark loan as defaulted
app.patch('/api/admin/loans/:id/default', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { default_date, recovery_costs, default_notes } = req.body;

    // Get loan details first
    const loanResult = await db.pool.query(
      'SELECT * FROM loans WHERE id = $1',
      [id]
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = loanResult.rows[0];

    // Calculate net recovery: total paid - recovery costs
    const paymentsResult = await db.pool.query(
      'SELECT COALESCE(SUM(amount), 0) as total_paid FROM payments WHERE loan_id = $1',
      [id]
    );
    const totalPaid = parseFloat(paymentsResult.rows[0].total_paid);
    const netRecovery = totalPaid - (parseFloat(recovery_costs) || 0);

    // Update loan to defaulted status
    await db.pool.query(
      `UPDATE loans 
       SET status = 'defaulted',
           default_date = $1,
           recovery_costs = $2,
           net_recovery = $3,
           default_notes = $4,
           alerts_disabled = true
       WHERE id = $5`,
      [default_date, recovery_costs, netRecovery, default_notes, id]
    );

    // Set property back to available
    await db.pool.query(
      `UPDATE properties 
       SET status = 'available' 
       WHERE id = $1`,
      [loan.property_id]
    );

    res.json({ 
      success: true, 
      message: 'Loan marked as defaulted',
      netRecovery 
    });
  } catch (error) {
    console.error('Mark loan as defaulted error:', error);
    res.status(500).json({ error: 'Failed to mark loan as defaulted' });
  }
});

// Send default/cure notice
app.post('/api/admin/loans/:id/send-notice', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notice_date, postal_method, postal_cost, tracking_number, notes } = req.body;

    if (!notice_date || !postal_method || !postal_cost || !tracking_number) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Calculate cure deadline (7 days from notice date)
    const noticeDateTime = new Date(notice_date);
    const cureDeadline = new Date(noticeDateTime);
    cureDeadline.setDate(cureDeadline.getDate() + 7);
    const cureDeadlineStr = cureDeadline.toISOString().split('T')[0];

    // Update loan with notice information and cure deadline
    await db.pool.query(
      `UPDATE loans 
       SET notice_sent_date = $1,
           notice_tracking_number = $2,
           notice_postal_cost = $3,
           notice_notes = $4,
           cure_deadline_date = $5
       WHERE id = $6`,
      [notice_date, tracking_number, postal_cost, notes, cureDeadlineStr, id]
    );

    // Record in loan_notices table for history
    await db.pool.query(
      `INSERT INTO loan_notices (loan_id, notice_type, notice_date, postal_method, postal_cost, tracking_number, notice_fee, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, 'default_cure', notice_date, postal_method, postal_cost, tracking_number, 75.00, notes]
    );

    res.json({ 
      success: true, 
      message: 'Notice recorded successfully'
    });
  } catch (error) {
    console.error('Send notice error:', error);
    res.status(500).json({ error: 'Failed to record notice' });
  }
});

// Waive late fee
app.post('/api/admin/loans/:id/waive-late-fee', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // For now, we'll just record this action
    // In the future, we could add a waived_fees table or adjustment tracking
    
    res.json({ 
      success: true, 
      message: 'Late fee waived (manual adjustment - remind customer on next call)'
    });
  } catch (error) {
    console.error('Waive late fee error:', error);
    res.status(500).json({ error: 'Failed to waive late fee' });
  }
});

// Update deed type for a loan
app.patch('/api/admin/loans/:id/deed-type', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deed_type } = req.body;

    // Validate deed type
    const validDeedTypes = ['Special Warranty Deed', 'Quitclaim Deed'];
    if (!validDeedTypes.includes(deed_type)) {
      return res.status(400).json({ error: 'Invalid deed type' });
    }

    // Update loan
    await db.pool.query(
      'UPDATE loans SET deed_type = $1 WHERE id = $2',
      [deed_type, id]
    );

    res.json({ 
      success: true, 
      message: 'Deed type updated',
      deed_type
    });
  } catch (error) {
    console.error('Update deed type error:', error);
    res.status(500).json({ error: 'Failed to update deed type' });
  }
});

// ==================== LOAN ROUTES ====================

// Get user's loans
app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT l.*, p.title as property_title, p.location,
             c.status as contract_status
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      LEFT JOIN contracts c ON l.id = c.loan_id
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Get single loan
app.get('/api/loans/:id', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT l.*, p.title as property_title, p.location, p.description
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      WHERE l.id = $1 AND l.user_id = $2
    `, [req.params.id, req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

// Get payment breakdown for a loan
app.get('/api/loans/:id/payment-breakdown', authenticateToken, async (req, res) => {
  try {
    // Verify loan belongs to user
    const loanCheck = await db.pool.query(
      'SELECT id FROM loans WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (loanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const breakdown = await calculatePaymentBreakdown(req.params.id);
    res.json(breakdown);
  } catch (error) {
    console.error('Get payment breakdown error:', error);
    res.status(500).json({ error: 'Failed to calculate payment breakdown' });
  }
});

// ==================== USER ACCOUNT SETTINGS ROUTES ====================

// Get user profile/settings
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query(
      'SELECT id, email, first_name, last_name, phone, mailing_address, mailing_city, mailing_state, mailing_zip FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile/settings
app.patch('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const { phone, mailing_address, mailing_city, mailing_state, mailing_zip } = req.body;
    
    const result = await db.pool.query(
      `UPDATE users 
       SET phone = $1, 
           mailing_address = $2, 
           mailing_city = $3, 
           mailing_state = $4, 
           mailing_zip = $5
       WHERE id = $6
       RETURNING id, email, first_name, last_name, phone, mailing_address, mailing_city, mailing_state, mailing_zip`,
      [phone, mailing_address, mailing_city, mailing_state, mailing_zip, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get deed info for active loans
app.get('/api/user/deed-info', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query(
      `SELECT l.id as loan_id, l.deed_name, l.deed_mailing_address, p.title as property_title
       FROM loans l
       JOIN properties p ON l.property_id = p.id
       WHERE l.user_id = $1 AND l.status = 'active'
       ORDER BY l.created_at DESC`,
      [req.user.id]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get deed info error:', error);
    res.status(500).json({ error: 'Failed to fetch deed info' });
  }
});

// Update deed info for a specific loan
app.patch('/api/user/loans/:loanId/deed-info', authenticateToken, async (req, res) => {
  try {
    const { loanId } = req.params;
    const { deed_name, deed_mailing_address } = req.body;
    
    // Verify loan belongs to user
    const loanCheck = await db.pool.query(
      'SELECT id FROM loans WHERE id = $1 AND user_id = $2',
      [loanId, req.user.id]
    );
    
    if (loanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }
    
    const result = await db.pool.query(
      `UPDATE loans 
       SET deed_name = $1, deed_mailing_address = $2
       WHERE id = $3 AND user_id = $4
       RETURNING id, deed_name, deed_mailing_address`,
      [deed_name, deed_mailing_address, loanId, req.user.id]
    );
    
    res.json({
      message: 'Deed information updated successfully',
      loan: result.rows[0]
    });
  } catch (error) {
    console.error('Update deed info error:', error);
    res.status(500).json({ error: 'Failed to update deed information' });
  }
});

// Create loan (purchase property)
app.post('/api/loans', authenticateToken, async (req, res) => {
  try {
    const { propertyId, downPaymentPercentage, termMonths, paymentNonce, phone, paymentDueDay } = req.body;

    console.log('Purchase request:', { propertyId, downPaymentPercentage, termMonths });

    // Get property
    const propertyResult = await db.pool.query(
      'SELECT * FROM properties WHERE id = $1 AND status = $2',
      [propertyId, 'available']
    );

    if (propertyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Property not available' });
    }

    const property = propertyResult.rows[0];
    console.log('Property found:', property.title, 'Price:', property.price);

    // Calculate financing
    const financing = calculateFinancing(property.price, downPaymentPercentage, termMonths);
    console.log('Financing calculated:', financing);

    // Process payment with Square
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: paymentNonce,
      amountMoney: {
        amount: Math.round((financing.downPayment + financing.processingFee) * 100),
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `${Date.now()}-${req.user.id}-${propertyId}`,
    });

    console.log('Square payment successful:', result.payment.id);

    // Create loan
    // Update user's phone number if provided
    if (req.body.phone) {
      await db.pool.query(
        'UPDATE users SET phone = $1 WHERE id = $2',
        [req.body.phone, req.user.userId]
      );
    }
    
    // Calculate first payment due date based on customer's choice
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();
    
    let firstPaymentDate;
    if (paymentDueDay === 1) {
      // Payment due on 1st of next month
      firstPaymentDate = new Date(currentYear, currentMonth + 1, 1);
    } else {
      // Payment due on 15th
      if (currentDay < 15) {
        // This month's 15th
        firstPaymentDate = new Date(currentYear, currentMonth, 15);
      } else {
        // Next month's 15th
        firstPaymentDate = new Date(currentYear, currentMonth + 1, 15);
      }
    }
    
    const firstPaymentDateStr = firstPaymentDate.toISOString().split('T')[0];
    
    const loanResult = await db.pool.query(`
      INSERT INTO loans (
        user_id, property_id, purchase_price, down_payment, 
        processing_fee, loan_amount, interest_rate, term_months, 
        monthly_payment, total_amount, balance_remaining, status, next_payment_date,
        deed_name, deed_mailing_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id
    `, [
      req.user.id,
      propertyId,
      property.price,
      financing.downPayment,
      financing.processingFee,
      financing.principal,
      financing.interestRate,
      financing.termMonths,
      financing.monthlyPayment,
      financing.totalAmount,
      financing.principal,
      'active',
      firstPaymentDateStr,
      req.body.deedName || null,
      req.body.deedMailingAddress || null
    ]);

    const loanId = loanResult.rows[0].id;
    console.log('Loan created:', loanId);

    // Record down payment (with convenience fee since this is the main transaction record)
    await db.pool.query(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status, convenience_fee)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      loanId,
      req.user.id,
      financing.downPayment,
      'down_payment',
      result.payment.id,
      'completed',
      5.00
    ]);

    // Record processing fee (no convenience fee - already recorded above)
    await db.pool.query(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status, convenience_fee)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      loanId,
      req.user.id,
      financing.processingFee,
      'processing_fee',
      result.payment.id,
      'completed',
      0.00
    ]);

    // Update property status
    await db.pool.query('UPDATE properties SET status = $1 WHERE id = $2', ['pending', propertyId]);

    res.status(201).json({
      message: 'Purchase successful',
      loanId: loanId,
      loan: {
        ...financing,
        propertyId,
        propertyPrice: property.price
      }
    });
  } catch (error) {
    console.error('Create loan error:', error);
    res.status(500).json({ 
      error: 'Purchase failed', 
      details: error.message 
    });
  }
});

// ==================== PAYMENT ROUTES ====================

// Make a payment
app.post('/api/payments', authenticateToken, async (req, res) => {
  try {
    const { loanId, amount, paymentNonce, paymentMethod = 'square' } = req.body;

    // Get payment breakdown
    const breakdown = await calculatePaymentBreakdown(loanId);
    
    // Verify the payment amount matches expected total
    if (Math.abs(parseFloat(amount) - breakdown.total) > 0.50) {
      return res.status(400).json({ 
        error: 'Payment amount does not match expected total',
        expected: breakdown.total,
        received: amount
      });
    }

    // Get loan
    const loanResult = await db.pool.query(
      'SELECT * FROM loans WHERE id = $1 AND user_id = $2',
      [loanId, req.user.id]
    );

    if (loanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = loanResult.rows[0];

    if (loan.balance_remaining <= 0) {
      return res.status(400).json({ error: 'Loan already paid off' });
    }

    // Process payment with Square
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: paymentNonce,
      amountMoney: {
        amount: Math.round(breakdown.total * 100),
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `${Date.now()}-${req.user.id}-${loanId}`,
    });

    // Calculate principal and interest breakdown (only from loan payment portion)
    const monthlyInterestRate = (loan.interest_rate / 100) / 12;
    const interestAmount = loan.balance_remaining * monthlyInterestRate;
    const principalAmount = breakdown.loanPayment - interestAmount;
    
    // Calculate new balance (only loan payment reduces balance, not tax/HOA/fees)
    const newBalance = Math.max(0, loan.balance_remaining - breakdown.loanPayment);
    const status = newBalance === 0 ? 'paid_off' : 'active';

    // Calculate next payment due date (30 days from today)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);
    
    // Update loan balance, status, and clear notice fees if paid
    await db.pool.query(
      `UPDATE loans 
       SET balance_remaining = $1, 
           status = $2, 
           next_payment_date = $3,
           notice_sent_date = NULL,
           notice_tracking_number = NULL,
           notice_postal_cost = NULL,
           notice_notes = NULL
       WHERE id = $4`,
      [newBalance, status, nextDueDate.toISOString().split('T')[0], loanId]
    );

    // Record payment with complete breakdown
    await db.pool.query(`
      INSERT INTO payments (
        loan_id, user_id, amount, payment_type, square_payment_id, status, payment_method,
        loan_payment_amount, tax_amount, hoa_amount, late_fee_amount, 
        notice_fee_amount, postal_fee_amount, square_processing_fee, convenience_fee,
        principal_amount, interest_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
    `, [
      loanId,
      req.user.id,
      breakdown.total,
      'monthly_payment',
      result.payment.id,
      'completed',
      paymentMethod,
      breakdown.loanPayment,
      breakdown.monthlyTax,
      breakdown.monthlyHoa,
      breakdown.lateFee,
      breakdown.noticeFee,
      breakdown.postalFee,
      breakdown.squareFee,
      breakdown.convenienceFee,
      principalAmount,
      interestAmount
    ]);

    res.json({
      message: 'Payment successful',
      newBalance,
      remainingPayments: Math.ceil(newBalance / loan.monthly_payment),
      paidOff: newBalance === 0,
      breakdown: breakdown
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      error: 'Payment failed', 
      details: error.message 
    });
  }
});

// Get payment history for a loan
app.get('/api/loans/:id/payments', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT * FROM payments
      WHERE loan_id = $1 AND user_id = $2
      ORDER BY payment_date DESC
    `, [req.params.id, req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Green Acres API is running' });
});

// ==================== SELLING EXPENSES ROUTES ====================

// Get all expenses for a property (admin only)
app.get('/api/admin/properties/:propertyId/expenses', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const result = await db.pool.query(
      'SELECT * FROM selling_expenses WHERE property_id = $1 ORDER BY expense_date DESC',
      [propertyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

// Add expense to property
app.post('/api/admin/properties/:propertyId/expenses', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { expense_date, category, description, amount } = req.body;
    
    if (!expense_date || !category || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await db.pool.query(
      `INSERT INTO selling_expenses (property_id, expense_date, category, description, amount)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [propertyId, expense_date, category, description || null, amount]
    );
    
    res.status(201).json({
      message: 'Expense added successfully',
      expense: result.rows[0]
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Delete expense
app.delete('/api/admin/expenses/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.pool.query(
      'DELETE FROM selling_expenses WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// ==================== PROPERTY TAX PAYMENT ROUTES ====================

// Record tax payment to county
app.post('/api/admin/properties/:propertyId/pay-taxes', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { payment_date, amount, tax_year, payment_method, check_number, notes } = req.body;
    
    if (!payment_date || !amount || !tax_year) {
      return res.status(400).json({ error: 'Payment date, amount, and tax year are required' });
    }
    
    const result = await db.pool.query(
      `INSERT INTO property_tax_payments (property_id, payment_date, amount, tax_year, payment_method, check_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [propertyId, payment_date, amount, tax_year, payment_method || null, check_number || null, notes || null]
    );
    
    res.status(201).json({
      message: 'Tax payment recorded successfully',
      payment: result.rows[0]
    });
  } catch (error) {
    console.error('Record tax payment error:', error);
    res.status(500).json({ error: 'Failed to record tax payment' });
  }
});

// Get tax payments for a property
app.get('/api/admin/properties/:propertyId/tax-payments', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const result = await db.pool.query(
      'SELECT * FROM property_tax_payments WHERE property_id = $1 ORDER BY payment_date DESC',
      [propertyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get tax payments error:', error);
    res.status(500).json({ error: 'Failed to fetch tax payments' });
  }
});

// Delete tax payment
app.delete('/api/admin/tax-payments/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.pool.query(
      'DELETE FROM property_tax_payments WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tax payment not found' });
    }
    
    res.json({ message: 'Tax payment deleted successfully' });
  } catch (error) {
    console.error('Delete tax payment error:', error);
    res.status(500).json({ error: 'Failed to delete tax payment' });
  }
});

// ==================== PROPERTY IMAGES ROUTES ====================

// Upload property image to Cloudinary
app.post('/api/admin/properties/:id/images/upload', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { caption } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check how many images this property already has
    const countResult = await db.pool.query(
      'SELECT COUNT(*) FROM property_images WHERE property_id = $1',
      [id]
    );
    
    if (parseInt(countResult.rows[0].count) >= 10) {
      return res.status(400).json({ error: 'Maximum of 10 images per property reached' });
    }

    // Upload to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'green-acres-properties',
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const cloudinaryResult = await uploadPromise;

    // Get next display order
    const orderResult = await db.pool.query(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM property_images WHERE property_id = $1',
      [id]
    );
    const nextOrder = orderResult.rows[0].next_order;

    // Save to database
    const result = await db.pool.query(
      `INSERT INTO property_images (property_id, cloudinary_public_id, url, caption, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, cloudinaryResult.public_id, cloudinaryResult.secure_url, caption || null, nextOrder]
    );

    res.status(201).json({
      message: 'Image uploaded successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Get all images for a property
app.get('/api/properties/:propertyId/images', async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const result = await db.pool.query(
      'SELECT * FROM property_images WHERE property_id = $1 ORDER BY display_order ASC',
      [propertyId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get images error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// Reorder images - MUST come before /:imageId route
app.patch('/api/admin/properties/:id/images/reorder', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageOrders } = req.body; // Array of { id, display_order }
    
    // Update each image's display order
    for (const item of imageOrders) {
      await db.pool.query(
        'UPDATE property_images SET display_order = $1 WHERE id = $2 AND property_id = $3',
        [item.display_order, item.id, id]
      );
    }
    
    res.json({ message: 'Images reordered successfully' });
  } catch (error) {
    console.error('Reorder images error:', error);
    res.status(500).json({ error: 'Failed to reorder images' });
  }
});

// Update image (caption, order, featured status)
app.patch('/api/admin/properties/:propertyId/images/:imageId', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;
    const { caption, display_order, is_featured } = req.body;
    
    // If setting as featured, unset all other featured images for this property
    if (is_featured === true) {
      await db.pool.query(
        'UPDATE property_images SET is_featured = FALSE WHERE property_id = $1',
        [propertyId]
      );
    }
    
    const result = await db.pool.query(
      `UPDATE property_images 
       SET caption = COALESCE($1, caption),
           display_order = COALESCE($2, display_order),
           is_featured = COALESCE($3, is_featured)
       WHERE id = $4 AND property_id = $5
       RETURNING *`,
      [caption, display_order, is_featured, imageId, propertyId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({
      message: 'Image updated successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Update image error:', error);
    res.status(500).json({ error: 'Failed to update image' });
  }
});

// Delete image from Cloudinary and database
app.delete('/api/admin/properties/:propertyId/images/:imageId', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId, imageId } = req.params;
    
    // Get image info
    const imageResult = await db.pool.query(
      'SELECT * FROM property_images WHERE id = $1 AND property_id = $2',
      [imageId, propertyId]
    );
    
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const image = imageResult.rows[0];
    
    // Delete from Cloudinary if it has a cloudinary_public_id
    if (image.cloudinary_public_id) {
      await cloudinary.uploader.destroy(image.cloudinary_public_id);
    }
    
    // Delete from database
    await db.pool.query(
      'DELETE FROM property_images WHERE id = $1',
      [imageId]
    );
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Add image to property (admin only) - OLD URL-BASED METHOD
app.post('/api/admin/properties/:propertyId/images', authenticateAdmin, async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { image_url, caption, display_order } = req.body;
    
    if (!image_url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }
    
    // Check current image count
    const countResult = await db.pool.query(
      'SELECT COUNT(*) FROM property_images WHERE property_id = $1',
      [propertyId]
    );
    
    const currentCount = parseInt(countResult.rows[0].count);
    if (currentCount >= 10) {
      return res.status(400).json({ error: 'Maximum 10 images per property' });
    }
    
    const result = await db.pool.query(
      `INSERT INTO property_images (property_id, image_url, caption, display_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [propertyId, image_url, caption || null, display_order || currentCount + 1]
    );
    
    res.status(201).json({
      message: 'Image added successfully',
      image: result.rows[0]
    });
  } catch (error) {
    console.error('Add image error:', error);
    res.status(500).json({ error: 'Failed to add image' });
  }
});

// Update image order (admin only)
app.patch('/api/admin/images/:id/order', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { display_order } = req.body;
    
    await db.pool.query(
      'UPDATE property_images SET display_order = $1 WHERE id = $2',
      [display_order, id]
    );
    
    res.json({ message: 'Display order updated' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// Delete image (admin only)
app.delete('/api/admin/images/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.pool.query(
      'DELETE FROM property_images WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==================== PAYMENT TRACKING ROUTES ====================

// Get all payments (admin only)
app.get('/api/admin/payments', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT 
        p.id,
        p.amount,
        p.payment_type,
        p.square_payment_id,
        p.status,
        p.payment_date,
        u.first_name || ' ' || u.last_name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        prop.title as property_title,
        prop.id as property_id,
        l.id as loan_id
      FROM payments p
      LEFT JOIN users u ON p.user_id = u.id
      LEFT JOIN loans l ON p.loan_id = l.id
      LEFT JOIN properties prop ON l.property_id = prop.id
      ORDER BY p.payment_date DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// ==================== REPORTING ROUTES ====================

// Get comprehensive financial reports
app.get('/api/admin/reports/financial', authenticateAdmin, async (req, res) => {
  try {
    // Total revenue breakdown
    const revenueResult = await db.pool.query(`
      SELECT 
        SUM(amount) as total_revenue,
        SUM(CASE WHEN payment_type = 'down_payment' THEN amount ELSE 0 END) as down_payments,
        SUM(CASE WHEN payment_type = 'processing_fee' THEN amount ELSE 0 END) as processing_fees,
        SUM(loan_payment_amount) as loan_payments,
        SUM(tax_amount) as tax_collected,
        SUM(hoa_amount) as hoa_collected,
        SUM(late_fee_amount) as late_fees,
        SUM(notice_fee_amount) as notice_fees,
        SUM(postal_fee_amount) as postal_fees,
        SUM(convenience_fee) as convenience_fees,
        SUM(square_processing_fee) as square_fees,
        COUNT(*) as total_payments
      FROM payments
      WHERE status = 'completed'
    `);

    // Tax escrow by property
    const taxEscrowResult = await db.pool.query(`
      SELECT 
        p.id as property_id,
        p.title,
        p.annual_tax_amount,
        COALESCE(SUM(pay.tax_amount), 0) as tax_collected,
        COALESCE(SUM(tp.amount), 0) as taxes_paid,
        COALESCE(SUM(pay.tax_amount), 0) - COALESCE(SUM(tp.amount), 0) as tax_balance
      FROM properties p
      LEFT JOIN loans l ON p.id = l.property_id
      LEFT JOIN payments pay ON l.id = pay.loan_id AND pay.status = 'completed'
      LEFT JOIN property_tax_payments tp ON p.id = tp.property_id
      WHERE p.annual_tax_amount IS NOT NULL AND p.annual_tax_amount > 0
      GROUP BY p.id, p.title, p.annual_tax_amount
      ORDER BY p.title
    `);

    // HOA tracking by property
    const hoaResult = await db.pool.query(`
      SELECT 
        p.id as property_id,
        p.title,
        p.monthly_hoa_fee,
        COALESCE(SUM(pay.hoa_amount), 0) as hoa_collected,
        COUNT(pay.id) as payments_count
      FROM properties p
      LEFT JOIN loans l ON p.id = l.property_id
      LEFT JOIN payments pay ON l.id = pay.loan_id AND pay.status = 'completed'
      WHERE p.monthly_hoa_fee IS NOT NULL AND p.monthly_hoa_fee > 0
      GROUP BY p.id, p.title, p.monthly_hoa_fee
      ORDER BY p.title
    `);

    // Monthly revenue trends (last 12 months)
    const trendsResult = await db.pool.query(`
      SELECT 
        DATE_TRUNC('month', payment_date) as month,
        SUM(amount) as total_revenue,
        SUM(loan_payment_amount) as loan_revenue,
        SUM(late_fee_amount + notice_fee_amount + convenience_fee) as fee_revenue,
        COUNT(*) as payment_count
      FROM payments
      WHERE status = 'completed' 
        AND payment_date >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', payment_date)
      ORDER BY month DESC
    `);

    res.json({
      revenue: revenueResult.rows[0],
      taxEscrow: taxEscrowResult.rows,
      hoaTracking: hoaResult.rows,
      monthlyTrends: trendsResult.rows
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get outstanding balances report
app.get('/api/admin/reports/outstanding', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT 
        l.id as loan_id,
        u.first_name || ' ' || u.last_name as customer_name,
        u.email,
        u.phone,
        p.title as property_title,
        l.balance_remaining,
        l.monthly_payment,
        l.next_payment_date,
        CASE 
          WHEN l.next_payment_date < CURRENT_DATE THEN 
            CURRENT_DATE - l.next_payment_date
          ELSE 0
        END as days_overdue,
        l.notice_sent_date,
        l.cure_deadline_date
      FROM loans l
      JOIN users u ON l.user_id = u.id
      JOIN properties p ON l.property_id = p.id
      WHERE l.status = 'active'
      ORDER BY 
        CASE WHEN l.next_payment_date < CURRENT_DATE THEN 0 ELSE 1 END,
        l.next_payment_date
    `);

    const summary = {
      total_outstanding: result.rows.reduce((sum, row) => sum + parseFloat(row.balance_remaining), 0),
      total_loans: result.rows.length,
      overdue_loans: result.rows.filter(r => r.days_overdue > 0).length,
      in_default: result.rows.filter(r => r.notice_sent_date).length
    };

    res.json({
      summary,
      loans: result.rows
    });
  } catch (error) {
    console.error('Get outstanding report error:', error);
    res.status(500).json({ error: 'Failed to fetch outstanding balances' });
  }
});

// Get tax summary report for CPA
app.get('/api/admin/reports/tax-summary', authenticateAdmin, async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();

    // REVENUE: All completed payments
    const revenueResult = await db.pool.query(`
      SELECT 
        EXTRACT(MONTH FROM payment_date) as month,
        EXTRACT(QUARTER FROM payment_date) as quarter,
        -- Revenue streams
        SUM(CASE WHEN payment_type = 'down_payment' THEN amount ELSE 0 END) as down_payments,
        SUM(CASE WHEN payment_type = 'processing_fee' THEN amount ELSE 0 END) as processing_fees,
        SUM(loan_payment_amount) as loan_payments,
        SUM(late_fee_amount) as late_fees,
        SUM(notice_fee_amount) as notice_fees,
        SUM(convenience_fee) as convenience_fees,
        SUM(postal_fee_amount) as postal_reimbursements,
        -- Total revenue (includes down payments and processing fees)
        SUM(
          COALESCE(loan_payment_amount, 0) + 
          COALESCE(late_fee_amount, 0) + 
          COALESCE(notice_fee_amount, 0) + 
          COALESCE(convenience_fee, 0) + 
          COALESCE(postal_fee_amount, 0) +
          CASE WHEN payment_type IN ('down_payment', 'processing_fee') THEN COALESCE(amount, 0) ELSE 0 END
        ) as total_revenue
      FROM payments
      WHERE status = 'completed'
        AND EXTRACT(YEAR FROM payment_date) = $1
      GROUP BY EXTRACT(MONTH FROM payment_date), EXTRACT(QUARTER FROM payment_date)
      ORDER BY month
    `, [targetYear]);

    // EXPENSES: Square fees from payments
    const squareFeesResult = await db.pool.query(`
      SELECT 
        EXTRACT(MONTH FROM payment_date) as month,
        SUM(square_processing_fee) as square_fees
      FROM payments
      WHERE status = 'completed'
        AND EXTRACT(YEAR FROM payment_date) = $1
      GROUP BY EXTRACT(MONTH FROM payment_date)
      ORDER BY month
    `, [targetYear]);

    // EXPENSES: Property acquisition costs (when properties were purchased in this year)
    const acquisitionResult = await db.pool.query(`
      SELECT 
        EXTRACT(MONTH FROM created_at) as month,
        SUM(acquisition_cost) as acquisition_costs
      FROM properties
      WHERE acquisition_cost IS NOT NULL
        AND EXTRACT(YEAR FROM created_at) = $1
      GROUP BY EXTRACT(MONTH FROM created_at)
      ORDER BY month
    `, [targetYear]);

    // EXPENSES: Selling expenses
    const sellingExpensesResult = await db.pool.query(`
      SELECT 
        EXTRACT(MONTH FROM expense_date) as month,
        SUM(amount) as selling_expenses
      FROM selling_expenses
      WHERE EXTRACT(YEAR FROM expense_date) = $1
      GROUP BY EXTRACT(MONTH FROM expense_date)
      ORDER BY month
    `, [targetYear]);

    // EXPENSES: Recovery costs from defaults
    const recoveryResult = await db.pool.query(`
      SELECT 
        EXTRACT(MONTH FROM default_date) as month,
        SUM(recovery_costs) as recovery_costs
      FROM loans
      WHERE status = 'defaulted'
        AND recovery_costs IS NOT NULL
        AND EXTRACT(YEAR FROM default_date) = $1
      GROUP BY EXTRACT(MONTH FROM default_date)
      ORDER BY month
    `, [targetYear]);

    // Combine all data by month
    const monthlyData = {};
    for (let i = 1; i <= 12; i++) {
      monthlyData[i] = {
        month: i,
        revenue: {
          loan_payments: 0,
          late_fees: 0,
          notice_fees: 0,
          convenience_fees: 0,
          postal_reimbursements: 0,
          total: 0
        },
        expenses: {
          square_fees: 0,
          acquisition_costs: 0,
          selling_expenses: 0,
          recovery_costs: 0,
          total: 0
        },
        net_profit: 0
      };
    }

    // Fill in revenue
    revenueResult.rows.forEach(row => {
      const month = parseInt(row.month);
      monthlyData[month].revenue = {
        loan_payments: parseFloat(row.loan_payments) || 0,
        late_fees: parseFloat(row.late_fees) || 0,
        notice_fees: parseFloat(row.notice_fees) || 0,
        convenience_fees: parseFloat(row.convenience_fees) || 0,
        postal_reimbursements: parseFloat(row.postal_reimbursements) || 0,
        total: parseFloat(row.total_revenue) || 0
      };
    });

    // Fill in Square fees
    squareFeesResult.rows.forEach(row => {
      const month = parseInt(row.month);
      monthlyData[month].expenses.square_fees = parseFloat(row.square_fees) || 0;
    });

    // Fill in acquisition costs
    acquisitionResult.rows.forEach(row => {
      const month = parseInt(row.month);
      monthlyData[month].expenses.acquisition_costs = parseFloat(row.acquisition_costs) || 0;
    });

    // Fill in selling expenses
    sellingExpensesResult.rows.forEach(row => {
      const month = parseInt(row.month);
      monthlyData[month].expenses.selling_expenses = parseFloat(row.selling_expenses) || 0;
    });

    // Fill in recovery costs
    recoveryResult.rows.forEach(row => {
      const month = parseInt(row.month);
      monthlyData[month].expenses.recovery_costs = parseFloat(row.recovery_costs) || 0;
    });

    // Calculate totals and net profit for each month
    Object.keys(monthlyData).forEach(month => {
      const data = monthlyData[month];
      data.expenses.total = 
        data.expenses.square_fees +
        data.expenses.acquisition_costs +
        data.expenses.selling_expenses +
        data.expenses.recovery_costs;
      data.net_profit = data.revenue.total - data.expenses.total;
    });

    // Calculate quarterly summaries
    const quarterly = {
      Q1: { revenue: 0, expenses: 0, net_profit: 0 },
      Q2: { revenue: 0, expenses: 0, net_profit: 0 },
      Q3: { revenue: 0, expenses: 0, net_profit: 0 },
      Q4: { revenue: 0, expenses: 0, net_profit: 0 }
    };

    [1,2,3].forEach(m => {
      quarterly.Q1.revenue += monthlyData[m].revenue.total;
      quarterly.Q1.expenses += monthlyData[m].expenses.total;
      quarterly.Q1.net_profit += monthlyData[m].net_profit;
    });
    [4,5,6].forEach(m => {
      quarterly.Q2.revenue += monthlyData[m].revenue.total;
      quarterly.Q2.expenses += monthlyData[m].expenses.total;
      quarterly.Q2.net_profit += monthlyData[m].net_profit;
    });
    [7,8,9].forEach(m => {
      quarterly.Q3.revenue += monthlyData[m].revenue.total;
      quarterly.Q3.expenses += monthlyData[m].expenses.total;
      quarterly.Q3.net_profit += monthlyData[m].net_profit;
    });
    [10,11,12].forEach(m => {
      quarterly.Q4.revenue += monthlyData[m].revenue.total;
      quarterly.Q4.expenses += monthlyData[m].expenses.total;
      quarterly.Q4.net_profit += monthlyData[m].net_profit;
    });

    // Calculate annual totals
    const annual = {
      revenue: Object.values(monthlyData).reduce((sum, m) => sum + m.revenue.total, 0),
      expenses: Object.values(monthlyData).reduce((sum, m) => sum + m.expenses.total, 0),
      net_profit: 0
    };
    annual.net_profit = annual.revenue - annual.expenses;

    res.json({
      year: targetYear,
      annual,
      quarterly,
      monthly: Object.values(monthlyData)
    });
  } catch (error) {
    console.error('Get tax summary error:', error);
    res.status(500).json({ error: 'Failed to fetch tax summary' });
  }
});

// ==================== PDF EXPORT ROUTE ====================

// Export financial report as PDF
app.get('/api/admin/reports/export', authenticateAdmin, async (req, res) => {
  try {
    const { reportType, startDate, endDate, properties, propertyIds } = req.query;

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'LETTER' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=financial-report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Add header
    doc.fontSize(20).text('Green Acres Land Investments, LLC', { align: 'center' });
    doc.fontSize(16).text('Financial Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, { align: 'center' });
    if (startDate) doc.text(`Date Range: ${startDate} to ${endDate}`, { align: 'center' });
    doc.text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Build query based on filters
    let whereClause = "WHERE p.status = 'completed'";
    const queryParams = [];
    
    if (startDate) {
      queryParams.push(startDate);
      whereClause += ` AND p.payment_date >= $${queryParams.length}`;
    }
    if (endDate) {
      queryParams.push(endDate);
      whereClause += ` AND p.payment_date <= $${queryParams.length}`;
    }

    // Get report data based on type
    if (reportType === 'overview') {
      // Portfolio Summary
      const portfolioResult = await db.pool.query(`
        SELECT 
          COUNT(*) as total_properties,
          SUM(price) as total_value,
          SUM(CASE WHEN acquisition_cost IS NOT NULL THEN price - acquisition_cost ELSE 0 END) as total_profit
        FROM properties
      `);
      
      const activeLoansResult = await db.pool.query(`
        SELECT COUNT(*) as active_loans
        FROM loans
        WHERE status = 'active'
      `);

      // Revenue Summary
      const revenueResult = await db.pool.query(`
        SELECT 
          SUM(amount) as total_revenue,
          SUM(loan_payment_amount) as loan_payments,
          SUM(late_fee_amount) as late_fees,
          SUM(notice_fee_amount) as notice_fees,
          SUM(convenience_fee) as convenience_fees
        FROM payments p
        ${whereClause}
      `, queryParams);

      // Property-level revenue
      const propertyRevenueResult = await db.pool.query(`
        SELECT 
          prop.id,
          prop.title,
          prop.state,
          prop.county,
          prop.acres,
          prop.price,
          prop.acquisition_cost,
          COALESCE(SUM(pay.amount), 0) as revenue_generated
        FROM properties prop
        LEFT JOIN loans l ON prop.id = l.property_id
        LEFT JOIN payments pay ON l.id = pay.loan_id AND pay.status = 'completed'
        GROUP BY prop.id
        ORDER BY revenue_generated DESC
      `);

      const portfolio = portfolioResult.rows[0];
      const activeLoans = activeLoansResult.rows[0];
      const revenue = revenueResult.rows[0];
      
      // Portfolio Summary
      doc.fontSize(14).text('Portfolio Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Total Properties: ${portfolio.total_properties}`);
      doc.text(`Active Loans: ${activeLoans.active_loans}`);
      doc.text(`Total Portfolio Value: $${parseFloat(portfolio.total_value || 0).toLocaleString()}`);
      doc.text(`Total Profit: $${parseFloat(portfolio.total_profit || 0).toFixed(2)}`);
      doc.moveDown(1.5);
      
      // Revenue Summary
      doc.fontSize(14).text('Revenue Summary', { underline: true });
      doc.moveDown();
      doc.fontSize(11);
      doc.text(`Total Revenue: $${parseFloat(revenue.total_revenue || 0).toFixed(2)}`);
      doc.text(`Loan Payments: $${parseFloat(revenue.loan_payments || 0).toFixed(2)}`);
      doc.text(`Late Fees: $${parseFloat(revenue.late_fees || 0).toFixed(2)}`);
      doc.text(`Notice Fees: $${parseFloat(revenue.notice_fees || 0).toFixed(2)}`);
      doc.text(`Convenience Fees: $${parseFloat(revenue.convenience_fees || 0).toFixed(2)}`);
      doc.moveDown(1.5);
      
      // Property Revenue Breakdown
      doc.fontSize(14).text('Property Revenue Breakdown', { underline: true });
      doc.moveDown();
      doc.fontSize(10);
      
      propertyRevenueResult.rows.forEach(prop => {
        const profit = prop.acquisition_cost ? parseFloat(prop.price) - parseFloat(prop.acquisition_cost) : 0;
        doc.text(`${prop.title} (ID: ${prop.id})`, { continued: false });
        doc.fontSize(9);
        doc.text(`  Location: ${prop.county}, ${prop.state} | Acres: ${parseFloat(prop.acres).toFixed(1)}`);
        doc.text(`  Price: $${parseFloat(prop.price).toLocaleString()} | Profit: $${profit.toFixed(2)}`);
        doc.text(`  Revenue Generated: $${parseFloat(prop.revenue_generated).toFixed(2)}`);
        doc.fontSize(10);
        doc.moveDown(0.5);
      });
      
    } else if (reportType === 'tax') {
      // Tax Escrow Report
      doc.fontSize(14).text('Tax Escrow Summary', { underline: true });
      doc.moveDown();
      
      const taxResult = await db.pool.query(`
        SELECT 
          p.id,
          p.title,
          p.state,
          p.county,
          p.acres,
          p.annual_tax_amount,
          p.tax_payment_1_date,
          p.tax_payment_1_amount,
          p.tax_payment_2_date,
          p.tax_payment_2_amount,
          COALESCE(SUM(pay.tax_amount), 0) as tax_collected,
          COALESCE(SUM(tp.amount), 0) as taxes_paid,
          MAX(tp.payment_date) as last_payment_date
        FROM properties p
        LEFT JOIN loans l ON p.id = l.property_id
        LEFT JOIN payments pay ON l.id = pay.loan_id AND pay.status = 'completed'
        LEFT JOIN property_tax_payments tp ON p.id = tp.property_id
        WHERE p.annual_tax_amount IS NOT NULL AND p.annual_tax_amount > 0
        GROUP BY p.id, p.title, p.state, p.county, p.acres, p.annual_tax_amount, 
                 p.tax_payment_1_date, p.tax_payment_1_amount, p.tax_payment_2_date, p.tax_payment_2_amount
        ORDER BY p.title
      `);

      // Summary totals
      const totalCollected = taxResult.rows.reduce((sum, p) => sum + parseFloat(p.tax_collected || 0), 0);
      const totalPaid = taxResult.rows.reduce((sum, p) => sum + parseFloat(p.taxes_paid || 0), 0);
      const totalBalance = totalCollected - totalPaid;
      
      doc.fontSize(11);
      doc.text(`Total Tax Collected: $${totalCollected.toFixed(2)}`);
      doc.text(`Total Tax Paid to Counties: $${totalPaid.toFixed(2)}`);
      doc.text(`Total Balance Held: $${totalBalance.toFixed(2)}`, { underline: true });
      doc.moveDown(1.5);
      
      doc.fontSize(12).text('Property Details:', { underline: true });
      doc.moveDown();

      taxResult.rows.forEach(prop => {
        const balance = parseFloat(prop.tax_collected || 0) - parseFloat(prop.taxes_paid || 0);
        const status = balance >= parseFloat(prop.annual_tax_amount || 0) ? 'FUNDED' : 'COLLECTING';
        
        doc.fontSize(10);
        doc.text(`${prop.title} (ID: ${prop.id})`, { continued: false });
        doc.fontSize(9);
        doc.text(`  Location: ${prop.county}, ${prop.state} | Acres: ${parseFloat(prop.acres).toFixed(1)}`);
        doc.text(`  Annual Tax: $${parseFloat(prop.annual_tax_amount).toFixed(2)}`);
        
        if (prop.tax_payment_1_date) {
          doc.text(`  Payment 1: $${parseFloat(prop.tax_payment_1_amount || 0).toFixed(2)} due ${new Date(prop.tax_payment_1_date).toLocaleDateString()}`);
        }
        if (prop.tax_payment_2_date) {
          doc.text(`  Payment 2: $${parseFloat(prop.tax_payment_2_amount || 0).toFixed(2)} due ${new Date(prop.tax_payment_2_date).toLocaleDateString()}`);
        }
        
        doc.text(`  Collected from Customer: $${parseFloat(prop.tax_collected || 0).toFixed(2)}`);
        doc.text(`  Paid to County: $${parseFloat(prop.taxes_paid || 0).toFixed(2)}`);
        if (prop.last_payment_date) {
          doc.text(`  Last Payment: ${new Date(prop.last_payment_date).toLocaleDateString()}`);
        }
        doc.text(`  Balance: $${balance.toFixed(2)} [${status}]`, { continued: false });
        doc.fontSize(10);
        doc.moveDown(0.8);
      });
      
    } else if (reportType === 'hoa') {
      // HOA Tracking Report
      doc.fontSize(14).text('HOA Fee Tracking', { underline: true });
      doc.moveDown();
      
      const hoaResult = await db.pool.query(`
        SELECT 
          p.id,
          p.title,
          p.state,
          p.county,
          p.acres,
          p.monthly_hoa_fee,
          p.hoa_name,
          p.hoa_contact,
          COALESCE(SUM(pay.hoa_amount), 0) as hoa_collected,
          COUNT(pay.id) as payment_count,
          MAX(pay.payment_date) as last_payment_date
        FROM properties p
        LEFT JOIN loans l ON p.id = l.property_id
        LEFT JOIN payments pay ON l.id = pay.loan_id AND pay.status = 'completed'
        WHERE p.monthly_hoa_fee IS NOT NULL AND p.monthly_hoa_fee > 0
        GROUP BY p.id, p.title, p.state, p.county, p.acres, p.monthly_hoa_fee, p.hoa_name, p.hoa_contact
        ORDER BY p.title
      `);

      // Summary totals
      const totalCollected = hoaResult.rows.reduce((sum, p) => sum + parseFloat(p.hoa_collected || 0), 0);
      const totalMonthlyFees = hoaResult.rows.reduce((sum, p) => sum + parseFloat(p.monthly_hoa_fee || 0), 0);
      
      doc.fontSize(11);
      doc.text(`Total Properties with HOA: ${hoaResult.rows.length}`);
      doc.text(`Total Monthly HOA Fees: $${totalMonthlyFees.toFixed(2)}`);
      doc.text(`Total HOA Collected: $${totalCollected.toFixed(2)}`);
      doc.moveDown(1.5);
      
      doc.fontSize(12).text('Property Details:', { underline: true });
      doc.moveDown();

      hoaResult.rows.forEach(prop => {
        const monthsCollected = parseFloat(prop.hoa_collected) / parseFloat(prop.monthly_hoa_fee);
        
        doc.fontSize(10);
        doc.text(`${prop.title} (ID: ${prop.id})`, { continued: false });
        doc.fontSize(9);
        doc.text(`  Location: ${prop.county}, ${prop.state} | Acres: ${parseFloat(prop.acres).toFixed(1)}`);
        if (prop.hoa_name) {
          doc.text(`  HOA: ${prop.hoa_name}`);
        }
        if (prop.hoa_contact) {
          doc.text(`  Contact: ${prop.hoa_contact}`);
        }
        doc.text(`  Monthly Fee: $${parseFloat(prop.monthly_hoa_fee || 0).toFixed(2)}`);
        doc.text(`  Total Collected: $${parseFloat(prop.hoa_collected || 0).toFixed(2)} (${monthsCollected.toFixed(1)} months)`);
        doc.text(`  Payments Received: ${prop.payment_count}`);
        if (prop.last_payment_date) {
          doc.text(`  Last Payment: ${new Date(prop.last_payment_date).toLocaleDateString()}`);
        }
        doc.fontSize(10);
        doc.moveDown(0.8);
      });
      
    } else if (reportType === 'outstanding') {
      // Outstanding Balances Report
      doc.fontSize(14).text('Outstanding Loan Balances', { underline: true });
      doc.moveDown();
      
      const outstandingResult = await db.pool.query(`
        SELECT 
          l.id as loan_id,
          u.first_name || ' ' || u.last_name as customer_name,
          u.email,
          u.phone,
          prop.id as property_id,
          prop.title as property_title,
          prop.state,
          prop.county,
          prop.acres,
          prop.price as property_price,
          l.purchase_price,
          l.loan_amount as original_loan_amount,
          l.balance_remaining,
          l.monthly_payment,
          l.interest_rate,
          l.term_months,
          l.created_at as loan_start_date,
          l.next_payment_date,
          CASE 
            WHEN l.next_payment_date < CURRENT_DATE THEN 
              CURRENT_DATE - l.next_payment_date
            ELSE 0
          END as days_overdue,
          l.notice_sent_date
        FROM loans l
        JOIN users u ON l.user_id = u.id
        JOIN properties prop ON l.property_id = prop.id
        WHERE l.status = 'active'
        ORDER BY days_overdue DESC, l.next_payment_date
      `);

      // Summary totals
      const totalOutstanding = outstandingResult.rows.reduce((sum, l) => sum + parseFloat(l.balance_remaining), 0);
      const totalMonthlyPayments = outstandingResult.rows.reduce((sum, l) => sum + parseFloat(l.monthly_payment), 0);
      const overdueLoans = outstandingResult.rows.filter(l => l.days_overdue > 0).length;
      const inDefault = outstandingResult.rows.filter(l => l.notice_sent_date).length;
      
      doc.fontSize(11);
      doc.text(`Total Active Loans: ${outstandingResult.rows.length}`);
      doc.text(`Total Outstanding: $${totalOutstanding.toFixed(2)}`);
      doc.text(`Total Monthly Payments: $${totalMonthlyPayments.toFixed(2)}`);
      doc.text(`Overdue Loans: ${overdueLoans}`);
      doc.text(`In Default: ${inDefault}`);
      doc.moveDown(1.5);
      
      doc.fontSize(12).text('Loan Details:', { underline: true });
      doc.moveDown();

      outstandingResult.rows.forEach(loan => {
        const paymentsRemaining = Math.ceil(parseFloat(loan.balance_remaining) / parseFloat(loan.monthly_payment));
        const percentPaid = ((parseFloat(loan.original_loan_amount) - parseFloat(loan.balance_remaining)) / parseFloat(loan.original_loan_amount) * 100).toFixed(1);
        const expectedPayoff = new Date(loan.loan_start_date);
        expectedPayoff.setMonth(expectedPayoff.getMonth() + parseInt(loan.term_months));
        
        doc.fontSize(10);
        doc.text(`Loan #${loan.loan_id} - ${loan.customer_name}`, { continued: false });
        doc.fontSize(9);
        doc.text(`  Customer: ${loan.email} | ${loan.phone || 'No phone'}`);
        doc.text(`  Property: ${loan.property_title} (ID: ${loan.property_id})`);
        doc.text(`  Location: ${loan.county}, ${loan.state} | ${parseFloat(loan.acres).toFixed(1)} acres`);
        doc.text(`  Purchase Price: $${parseFloat(loan.purchase_price).toFixed(2)}`);
        doc.text(`  Original Loan: $${parseFloat(loan.original_loan_amount).toFixed(2)} @ ${parseFloat(loan.interest_rate).toFixed(2)}%`);
        doc.text(`  Current Balance: $${parseFloat(loan.balance_remaining).toFixed(2)} (${percentPaid}% paid)`);
        doc.text(`  Monthly Payment: $${parseFloat(loan.monthly_payment).toFixed(2)}`);
        doc.text(`  Payments Remaining: ~${paymentsRemaining}`);
        doc.text(`  Loan Started: ${new Date(loan.loan_start_date).toLocaleDateString()}`);
        doc.text(`  Expected Payoff: ${expectedPayoff.toLocaleDateString()}`);
        doc.text(`  Next Due: ${new Date(loan.next_payment_date).toLocaleDateString()}`);
        
        if (loan.notice_sent_date) {
          doc.text(`  STATUS: IN DEFAULT (Notice sent ${new Date(loan.notice_sent_date).toLocaleDateString()})`, { continued: false });
        } else if (loan.days_overdue > 0) {
          doc.text(`  STATUS: OVERDUE ${loan.days_overdue} days`, { continued: false });
        } else {
          doc.text(`  STATUS: CURRENT`, { continued: false });
        }
        
        doc.fontSize(10);
        doc.moveDown(0.8);
      });
    }

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Export PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report' });
    }
  }
});

// ==================== STATE MANAGEMENT ROUTES ====================
// Get all states (public - for navigation)
app.get('/api/states', async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT s.*, 
        COUNT(p.id) as property_count
      FROM states s
      LEFT JOIN properties p ON s.name = p.state AND p.status IN ('available', 'coming_soon')
      WHERE s.is_active = true OR s.coming_soon = true
      GROUP BY s.id
      HAVING s.coming_soon = true OR COUNT(p.id) > 0
      ORDER BY s.sort_order, s.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});
// Get all states (admin - for management)
app.get('/api/admin/states', authenticateAdmin, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT s.*, 
        COUNT(p.id) as property_count
      FROM states s
      LEFT JOIN properties p ON s.name = p.state
      GROUP BY s.id
      ORDER BY s.sort_order, s.name
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get admin states error:', error);
    res.status(500).json({ error: 'Failed to fetch states' });
  }
});
// Create new state
app.post('/api/admin/states', authenticateAdmin, async (req, res) => {
  try {
    const { name, abbreviation, is_active, coming_soon, sort_order } = req.body;
    
    const result = await db.pool.query(
      `INSERT INTO states (name, abbreviation, is_active, coming_soon, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, abbreviation, is_active || false, coming_soon || false, sort_order || 0]
    );
    
    res.status(201).json({
      message: 'State created successfully',
      state: result.rows[0]
    });
  } catch (error) {
    console.error('Create state error:', error);
    res.status(500).json({ error: 'Failed to create state' });
  }
});
// Update state
app.patch('/api/admin/states/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, abbreviation, is_active, coming_soon, sort_order } = req.body;
    
    const result = await db.pool.query(
      `UPDATE states 
       SET name = $1, abbreviation = $2, is_active = $3, coming_soon = $4, sort_order = $5
       WHERE id = $6
       RETURNING *`,
      [name, abbreviation, is_active, coming_soon, sort_order, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }
    
    res.json({
      message: 'State updated successfully',
      state: result.rows[0]
    });
  } catch (error) {
    console.error('Update state error:', error);
    res.status(500).json({ error: 'Failed to update state' });
  }
});
// Delete state
app.delete('/api/admin/states/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if state has properties
    const propertyCheck = await db.pool.query(
      'SELECT COUNT(*) FROM properties WHERE state = (SELECT name FROM states WHERE id = $1)',
      [id]
    );
    
    if (parseInt(propertyCheck.rows[0].count) > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete state with existing properties' 
      });
    }
    
    const result = await db.pool.query(
      'DELETE FROM states WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'State not found' });
    }
    
    res.json({ message: 'State deleted successfully' });
  } catch (error) {
    console.error('Delete state error:', error);
    res.status(500).json({ error: 'Failed to delete state' });
  }
});

// ==================== CONTRACT GENERATION ====================

// Helper function to convert number to words
function numberToWords(num) {
  const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

  // Helper function that converts just the dollar amount (no cents)
  function convertDollars(n) {
    if (n === 0) return '';
    
    let result = '';
    
    // Handle thousands
    if (n >= 1000) {
      const thousands = Math.floor(n / 1000);
      result += convertDollars(thousands) + ' thousand';
      const remainder = n % 1000;
      if (remainder > 0) {
        result += ' ' + convertDollars(remainder);
      }
    } else if (n >= 100) {
      const hundreds = Math.floor(n / 100);
      result += ones[hundreds] + ' hundred';
      const remainder = n % 100;
      if (remainder > 0) {
        result += ' ' + convertDollars(remainder);
      }
    } else if (n >= 20) {
      const tensDigit = Math.floor(n / 10);
      const onesDigit = n % 10;
      result += tens[tensDigit];
      if (onesDigit > 0) {
        result += '-' + ones[onesDigit];
      }
    } else if (n >= 10) {
      result += teens[n - 10];
    } else {
      result += ones[n];
    }
    
    return result.trim();
  }

  if (num === 0) return 'Zero';

  // Split into dollars and cents
  const dollars = Math.floor(num);
  const cents = Math.round((num - dollars) * 100);

  let result = convertDollars(dollars);
  
  // Add cents only if there are cents
  if (cents > 0) {
    result += ' and ' + cents + '/100';
  }

  // Capitalize first letter
  return result.charAt(0).toUpperCase() + result.slice(1);
}

// Generate and save contract (admin triggers this)
app.post('/api/admin/loans/:id/generate-contract', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const fs = require('fs');
    const path = require('path');

    // Check if contract already exists
    const existingContract = await db.pool.query(
      'SELECT id, status FROM contracts WHERE loan_id = $1',
      [id]
    );

    if (existingContract.rows.length > 0) {
      return res.json({ 
        success: true, 
        message: 'Contract already exists',
        contractId: existingContract.rows[0].id,
        status: existingContract.rows[0].status
      });
    }

    // Get loan with property and user data
    const result = await db.pool.query(`
      SELECT 
        l.*,
        p.title, p.location, p.state, p.county, p.acres, p.apn, p.legal_description, p.property_covenants,
        u.first_name, u.last_name, u.email
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    const loan = result.rows[0];

    // Read contract template
    const templatePath = path.join(__dirname, 'contract-template.txt');
    let contract = fs.readFileSync(templatePath, 'utf8');

    // Format dates
    const contractDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const firstPaymentDate = new Date(loan.next_payment_date || loan.start_date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Calculate remaining payments
    const remainingPayments = Math.ceil(parseFloat(loan.balance_remaining) / parseFloat(loan.monthly_payment));

    // Parse numeric values
    const purchasePrice = parseFloat(loan.purchase_price);
    const downPayment = parseFloat(loan.down_payment);
    const loanAmount = parseFloat(loan.loan_amount);
    const interestRate = parseFloat(loan.interest_rate);
    const monthlyPayment = parseFloat(loan.monthly_payment);

    // Prepare merge data
    const mergeData = {
      CONTRACT_DATE: contractDate,
      PURCHASER_NAME: `${loan.first_name} ${loan.last_name}`,
      PURCHASER_ADDRESS: loan.billing_address || '[ADDRESS]',
      PURCHASER_CITY: loan.billing_city || '[CITY]',
      PURCHASER_STATE: loan.billing_state || '[ST]',
      PURCHASER_ZIP: loan.billing_zip || '[ZIP]',
      COUNTY: loan.county,
      STATE: loan.state,
      PROPERTY_DESCRIPTION: loan.legal_description || loan.title,
      ACRES: loan.acres,
      APN: loan.apn || 'N/A',
      PURCHASE_PRICE: purchasePrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      PURCHASE_PRICE_WORDS: numberToWords(purchasePrice) + ' dollars',
      DOWN_PAYMENT: downPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      BALANCE: loanAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      BALANCE_WORDS: numberToWords(loanAmount) + ' dollars',
      INTEREST_RATE: interestRate.toFixed(2),
      MONTHLY_PAYMENT: monthlyPayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      MONTHLY_PAYMENT_WORDS: numberToWords(monthlyPayment) + ' dollars',
      FIRST_PAYMENT_DATE: firstPaymentDate,
      NUMBER_OF_PAYMENTS: remainingPayments,
      PROPERTY_COVENANTS: loan.property_covenants || 'None',
      DEED_TYPE: loan.deed_type || 'Special Warranty Deed'
    };

    // Replace all merge fields
    Object.keys(mergeData).forEach(key => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      contract = contract.replace(regex, mergeData[key]);
    });

    // Save contract to database
    const contractResult = await db.pool.query(
      `INSERT INTO contracts (loan_id, contract_text, status)
       VALUES ($1, $2, 'pending')
       RETURNING id`,
      [id, contract]
    );

    res.json({ 
      success: true, 
      message: 'Contract generated and ready for customer signature',
      contractId: contractResult.rows[0].id
    });

  } catch (error) {
    console.error('Generate contract error:', error);
    res.status(500).json({ error: 'Failed to generate contract' });
  }
});

// Customer views their contract
app.get('/api/loans/:id/contract', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify loan belongs to user
    const loanCheck = await db.pool.query(
      'SELECT id FROM loans WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (loanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Get contract
    const result = await db.pool.query(
      'SELECT * FROM contracts WHERE loan_id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get contract error:', error);
    res.status(500).json({ error: 'Failed to fetch contract' });
  }
});

// Customer signs contract
app.post('/api/loans/:id/sign-contract', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature || signature.trim().length === 0) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    // Verify loan belongs to user
    const loanCheck = await db.pool.query(
      'SELECT id FROM loans WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (loanCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Get IP and user agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Update contract with customer signature
    await db.pool.query(
      `UPDATE contracts 
       SET customer_signature = $1,
           customer_signed_date = NOW(),
           customer_ip_address = $2,
           customer_user_agent = $3,
           status = 'customer_signed'
       WHERE loan_id = $4 AND status = 'pending'`,
      [signature, ipAddress, userAgent, id]
    );

    res.json({ 
      success: true, 
      message: 'Contract signed successfully. Awaiting admin signature.' 
    });
  } catch (error) {
    console.error('Sign contract error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
});

// Admin signs contract
app.post('/api/admin/loans/:id/sign-contract', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature || signature.trim().length === 0) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    // Get IP
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    // Update contract with admin signature
    const result = await db.pool.query(
      `UPDATE contracts 
       SET admin_signature = $1,
           admin_signed_date = NOW(),
           admin_ip_address = $2,
           status = 'fully_signed'
       WHERE loan_id = $3 AND status = 'customer_signed'
       RETURNING id`,
      [signature, ipAddress, id]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Contract must be signed by customer first' });
    }

    res.json({ 
      success: true, 
      message: 'Contract fully executed' 
    });
  } catch (error) {
    console.error('Admin sign contract error:', error);
    res.status(500).json({ error: 'Failed to sign contract' });
  }
});

// Delete contract (admin only)
app.delete('/api/admin/loans/:id/contract', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Delete contract
    const result = await db.pool.query(
      'DELETE FROM contracts WHERE loan_id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ 
      success: true, 
      message: 'Contract deleted successfully' 
    });
  } catch (error) {
    console.error('Delete contract error:', error);
    res.status(500).json({ error: 'Failed to delete contract' });
  }
});

// Download signed contract
app.get('/api/loans/:loanId/download-contract', async (req, res) => {
  try {
    const { loanId } = req.params;
    
    // Get contract
    const result = await db.pool.query(
      'SELECT * FROM contracts WHERE loan_id = $1',
      [loanId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const contract = result.rows[0];
    let contractText = contract.contract_text;

    // Add signature block at the end
    contractText += '\n\n--- SIGNATURES ---\n\n';
    
    if (contract.customer_signature) {
      contractText += `PURCHASER SIGNATURE: ${contract.customer_signature}\n`;
      contractText += `Signed: ${new Date(contract.customer_signed_date).toLocaleString()}\n`;
      contractText += `IP Address: ${contract.customer_ip_address}\n\n`;
    }

    if (contract.admin_signature) {
      contractText += `SELLER SIGNATURE: ${contract.admin_signature}\n`;
      contractText += `Signed: ${new Date(contract.admin_signed_date).toLocaleString()}\n`;
      contractText += `IP Address: ${contract.admin_ip_address}\n`;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="Signed_Contract_${Date.now()}.txt"`);
    res.send(contractText);

  } catch (error) {
    console.error('Download contract error:', error);
    res.status(500).json({ error: 'Failed to download contract' });
  }
});
  
app.listen(PORT, () => {
  console.log('Green Acres Server running on port ' + PORT);
  console.log('Environment: ' + process.env.NODE_ENV);
  console.log('Square Environment: ' + process.env.SQUARE_environment);
  console.log('Coming Soon status enabled');
});
