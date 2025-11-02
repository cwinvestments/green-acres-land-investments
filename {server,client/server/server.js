const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client, Environment } = require('square');
require('dotenv').config();

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

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
    interestRate = 18; // $99 down special rate
  } else if (downPaymentPercentage === 20) {
    interestRate = 12;
  } else {
    interestRate = 8; // 25%, 35%, 50% all get 8%
  }
  
  // Calculate principal (remaining amount after down payment + processing fee)
  const principal = (price - downPayment) + processingFee;
  
  // Calculate monthly interest rate
  const monthlyRate = interestRate / 100 / 12;
  
  // Calculate monthly payment using amortization formula
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

    // Validate input
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = db.prepare(`
      INSERT INTO users (email, password, first_name, last_name, phone)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hashedPassword, firstName, lastName, phone || null);

    // Generate token
    const token = jwt.sign(
      { id: result.lastInsertRowid, email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: result.lastInsertRowid,
        email,
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
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

// Get all properties
app.get('/api/properties', (req, res) => {
  try {
    const properties = db.prepare(`
      SELECT * FROM properties 
      WHERE status = 'available'
      ORDER BY created_at DESC
    `).all();

    // Parse features JSON
    const propertiesWithFeatures = properties.map(prop => ({
      ...prop,
      features: prop.features ? JSON.parse(prop.features) : []
    }));

    res.json(propertiesWithFeatures);
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get single property
app.get('/api/properties/:id', (req, res) => {
  try {
    const property = db.prepare('SELECT * FROM properties WHERE id = ?')
      .get(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Parse features JSON
    property.features = property.features ? JSON.parse(property.features) : [];

    res.json(property);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// ==================== LOAN ROUTES ====================

// Get user's loans
app.get('/api/loans', authenticateToken, (req, res) => {
  try {
    const loans = db.prepare(`
      SELECT l.*, p.title as property_title, p.location, p.image_url
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      WHERE l.user_id = ?
      ORDER BY l.created_at DESC
    `).all(req.user.id);

    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Failed to fetch loans' });
  }
});

// Get single loan
app.get('/api/loans/:id', authenticateToken, (req, res) => {
  try {
    const loan = db.prepare(`
      SELECT l.*, p.title as property_title, p.location, p.image_url, p.description
      FROM loans l
      JOIN properties p ON l.property_id = p.id
      WHERE l.id = ? AND l.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    console.error('Get loan error:', error);
    res.status(500).json({ error: 'Failed to fetch loan' });
  }
});

// Create loan (purchase property)
app.post('/api/loans', authenticateToken, async (req, res) => {
  try {
    const { propertyId, downPaymentPercentage, termMonths, paymentNonce } = req.body;

    // Get property
    const property = db.prepare('SELECT * FROM properties WHERE id = ? AND status = ?')
      .get(propertyId, 'available');

    if (!property) {
      return res.status(404).json({ error: 'Property not available' });
    }

    // Calculate financing
    const financing = calculateFinancing(property.price, downPaymentPercentage, termMonths);

    // Process payment with Square
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: paymentNonce,
      amountMoney: {
        amount: Math.round(financing.downPayment * 100), // Convert to cents
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `${Date.now()}-${req.user.id}-${propertyId}`,
    });

    // Create loan
    const loanResult = db.prepare(`
      INSERT INTO loans (
        user_id, property_id, property_price, down_payment, down_payment_percentage,
        processing_fee, principal, interest_rate, term_months, monthly_payment,
        total_amount, balance, square_down_payment_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      propertyId,
      property.price,
      financing.downPayment,
      financing.downPaymentPercentage,
      financing.processingFee,
      financing.principal,
      financing.interestRate,
      financing.termMonths,
      financing.monthlyPayment,
      financing.totalAmount,
      financing.principal,
      result.payment.id,
      'active'
    );

    // Record payment
    db.prepare(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      loanResult.lastInsertRowid,
      req.user.id,
      financing.downPayment,
      'down_payment',
      result.payment.id,
      'completed'
    );

    // Update property status
    db.prepare('UPDATE properties SET status = ? WHERE id = ?')
      .run('sold', propertyId);

    res.status(201).json({
      message: 'Purchase successful',
      loanId: loanResult.lastInsertRowid,
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
    const loan = db.prepare('SELECT * FROM loans WHERE id = ? AND user_id = ?')
      .get(loanId, req.user.id);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    if (loan.balance <= 0) {
      return res.status(400).json({ error: 'Loan already paid off' });
    }

    // Process payment with Square
    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId: paymentNonce,
      amountMoney: {
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'USD',
      },
      locationId: process.env.SQUARE_LOCATION_ID,
      idempotencyKey: `${Date.now()}-${req.user.id}-${loanId}`,
    });

    // Calculate new balance
    const newBalance = Math.max(0, loan.balance - amount);

    // Update loan balance
    const status = newBalance === 0 ? 'paid_off' : 'active';
    db.prepare('UPDATE loans SET balance = ?, status = ? WHERE id = ?')
      .run(newBalance, status, loanId);

    // Record payment
    db.prepare(`
      INSERT INTO payments (loan_id, user_id, amount, payment_type, square_payment_id, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      loanId,
      req.user.id,
      amount,
      'monthly_payment',
      result.payment.id,
      'completed'
    );

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
app.get('/api/loans/:id/payments', authenticateToken, (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT * FROM payments
      WHERE loan_id = ? AND user_id = ?
      ORDER BY payment_date DESC
    `).all(req.params.id, req.user.id);

    res.json(payments);
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
