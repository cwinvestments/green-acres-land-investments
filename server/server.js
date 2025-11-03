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
    const { email, password, firstName, lastName, phone } = req.body;

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
      { expiresIn: '7d' }
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
      { expiresIn: '7d' }
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

// Get all properties (available only)
app.get('/api/properties', async (req, res) => {
  try {
    const result = await db.pool.query(
      "SELECT * FROM properties WHERE status = 'available' ORDER BY created_at DESC"
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
    const { propertyId, downPaymentPercentage, termMonths, paymentNonce } = req.body;

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
    const loanResult = await db.pool.query(`
      INSERT INTO loans (
        user_id, property_id, purchase_price, down_payment, 
        processing_fee, loan_amount, interest_rate, term_months, 
        monthly_payment, total_amount, balance_remaining, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
      'active'
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
    const { loanId, amount, paymentNonce } = req.body;

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

    // Calculate new balance
    const newBalance = Math.max(0, loan.balance_remaining - amount);
    const status = newBalance === 0 ? 'paid_off' : 'active';

    // Update loan balance
    await db.pool.query(
      'UPDATE loans SET balance_remaining = $1, status = $2 WHERE id = $3',
      [newBalance, status, loanId]
    );

    // Record payment
    await db.pool.query(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      loanId,
      req.user.id,
      amount,
      'monthly_payment',
      result.payment.id,
      'completed'
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

// Start server
app.listen(PORT, () => {
  console.log(`\n🌿 Green Acres Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`💳 Square Environment: ${process.env.SQUARE_ENVIRONMENT}\n`);
});