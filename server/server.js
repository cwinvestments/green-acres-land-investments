const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client, Environment } = require('square');
require('dotenv').config();

const db = require('./database');

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

    res.json({
      totalProperties,
      activeLoans,
      totalCustomers
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
      coordinates
    } = req.body;
    // Validate required fields
    if (!title || !location || !state || !county || !acres || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const result = await db.pool.query(
      `INSERT INTO properties 
       (title, description, location, state, county, acres, price, acquisition_cost, apn, coordinates, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'available')
       RETURNING *`,
      [title, description, location, state, county, acres, price, acquisition_cost || null, apn || null, coordinates || null]
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
      status
    } = req.body;
    const result = await db.pool.query(
      `UPDATE properties 
       SET title = $1, description = $2, location = $3, state = $4, 
           county = $5, acres = $6, price = $7, acquisition_cost = $8,
           apn = $9, coordinates = $10, status = $11
       WHERE id = $12
       RETURNING *`,
      [title, description, location, state, county, acres, price, acquisition_cost, apn, coordinates, status, id]
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
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      JOIN users u ON l.user_id = u.id
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

// Mark loan as defaulted
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

// ==================== LOAN ROUTES ====================

// Get user's loans
app.get('/api/loans', authenticateToken, async (req, res) => {
  try {
    const result = await db.pool.query(`
      SELECT l.*, p.title as property_title, p.location
      FROM loans l
      JOIN properties p ON l.property_id = p.id
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
        amount: Math.round(financing.downPayment * 100),
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
        monthly_payment, total_amount, balance_remaining, status, next_payment_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
      firstPaymentDateStr
    ]);

    const loanId = loanResult.rows[0].id;
    console.log('Loan created:', loanId);

    // Record payment
    await db.pool.query(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      loanId,
      req.user.id,
      financing.downPayment,
      'down_payment',
      result.payment.id,
      'completed'
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
        amount: Math.round(amount * 100),
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `${Date.now()}-${req.user.id}-${loanId}`,
    });

    // Calculate principal and interest breakdown
    const monthlyInterestRate = (loan.interest_rate / 100) / 12;
    const interestAmount = loan.balance_remaining * monthlyInterestRate;
    const principalAmount = amount - interestAmount;
    
    // Calculate new balance
    const newBalance = Math.max(0, loan.balance_remaining - amount);
    const status = newBalance === 0 ? 'paid_off' : 'active';

    // Calculate next payment due date (30 days from today)
    const nextDueDate = new Date();
    nextDueDate.setDate(nextDueDate.getDate() + 30);
    
    // Update loan balance and next payment due
    await db.pool.query(
      'UPDATE loans SET balance_remaining = $1, status = $2, next_payment_date = $3 WHERE id = $4',
      [newBalance, status, nextDueDate.toISOString().split('T')[0], loanId]
    );

    // Record payment
    await db.pool.query(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status, payment_method, principal_amount, interest_amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      loanId,
      req.user.id,
      amount,
      'monthly_payment',
      result.payment.id,
      'completed',
      paymentMethod,
      principalAmount,
      interestAmount
    ]);

    res.json({
      message: 'Payment successful',
      newBalance,
      remainingPayments: Math.ceil(newBalance / loan.monthly_payment),
      paidOff: newBalance === 0
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

app.listen(PORT, () => {
  console.log('Green Acres Server running on port ' + PORT);
  console.log('Environment: ' + process.env.NODE_ENV);
  console.log('Square Environment: ' + process.env.SQUARE_ENVIRONMENT);
  console.log('Coming Soon status enabled');
});