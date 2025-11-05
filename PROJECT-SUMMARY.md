# 🌿 Green Acres Land Investments - Complete Project Guide

**Last Updated:** November 5, 2025  
**Version:** 2.1  
**Status:** Production Deployment Complete

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Environment Setup](#environment-setup)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Frontend Components](#frontend-components)
9. [Authentication & Security](#authentication--security)
10. [Payment Processing](#payment-processing)
11. [Deployment](#deployment)
12. [Development Workflow](#development-workflow)
13. [Troubleshooting](#troubleshooting)
14. [Future Enhancements](#future-enhancements)

---

## 📖 Project Overview

### Business Model
Green Acres Land Investments, LLC is a land investment company that:
- Purchases raw land at auctions
- Resells with flexible owner financing
- Targets properties $2,000-$10,000
- Operates in Wisconsin (expanding to AZ, CO, AR)

### Tagline
**"Your Land. Your Terms."**

### Financing Options
- **$99 Down Special** - 18% APR (most popular)
- **20% Down** - 12% APR
- **25% Down** - 8% APR
- **35% Down** - 8% APR
- **50% Down** - 8% APR
- Terms: 1-5 years
- Processing Fee: $99
- Minimum Monthly Payment: $50
- Payment Due: 1st or 15th of month (customer choice)

---

## ✅ Current Status

### Version 2.1 Features (November 5, 2025)
- ✅ Customer payment due day selection
- ✅ Next payment date display
- ✅ Admin Loan Management dashboard
- ✅ Profit and ROI tracking
- ✅ Payment alert toggles
- ✅ Overdue loan highlighting

### Production Environment
- **Frontend:** Deployed on Netlify
- **Backend:** Deployed on Railway
- **Database:** PostgreSQL via Supabase
- **Payment:** Square (Sandbox mode - production ready)
- **Domains:** Ready for custom DNS

### Completed Phases
- ✅ Phase 1: Core Platform Development
- ✅ Phase 2: Payment Integration
- ✅ Phase 3: Admin Property Management
- ✅ Phase 4: Admin Customer Management
- ✅ Phase 5: Admin Loan Management
- ✅ Phase 5.5: Payment Due Day Selection

---

## 🛠️ Tech Stack

### Frontend
```
React 18.2.0
React Router 6
Axios
Square Web Payments SDK
Modern CSS with CSS Variables
```

### Backend
```
Node.js
Express 4.18
JWT (jsonwebtoken)
bcrypt
Square SDK
node-postgres (pg)
dotenv
cors
```

### Database
```
PostgreSQL 14+
Supabase (hosted)
Connection pooling enabled
```

### Development Tools
```
VS Code
Git/GitHub
Command Prompt (Windows)
Chrome DevTools
Postman (API testing)
```

---

## 📁 Project Structure
```
green-acres-land/
├── client/                    # React frontend
│   ├── public/
│   │   ├── logo/             # 20 logo variations
│   │   ├── favicon.ico
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Properties.js
│   │   │   ├── PropertyDetail.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── LoanDetail.js
│   │   │   ├── PaymentHistory.js
│   │   │   ├── SoldProperties.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── PropertyManagement.js
│   │   │   ├── CustomerManagement.js
│   │   │   └── AdminLoans.js       # NEW
│   │   ├── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── server/                    # Express backend
│   ├── database.js
│   ├── server.js
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
├── .gitignore
├── README.md
├── QUICKSTART.md
├── PROJECT-SUMMARY.md
├── UI-IMPROVEMENT-PLAN.md
└── GREEN-ACRES-PROJECT-GUIDE.md (this file)
```

---

## ⚙️ Environment Setup

### Prerequisites
- Node.js 16+ installed
- Git installed
- Square Developer account
- Supabase account (for database)
- Railway account (for backend hosting)
- Netlify account (for frontend hosting)

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/cwinvestments/green-acres-land.git
cd green-acres-land
```

#### 2. Server Setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this

# Square (Sandbox)
SQUARE_ACCESS_TOKEN=your-square-sandbox-access-token
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=your-square-location-id

# Admin Credentials
ADMIN_EMAIL=admin@greenacresland.com
ADMIN_PASSWORD=your-secure-admin-password

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key

# Server
PORT=5000
NODE_ENV=development
```

#### 3. Client Setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SQUARE_APPLICATION_ID=your-square-application-id
REACT_APP_SQUARE_LOCATION_ID=your-square-location-id
REACT_APP_SQUARE_ENVIRONMENT=sandbox
REACT_APP_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

#### 4. Start Development Servers

Terminal 1 (Server):
```bash
cd server
npm start
```

Terminal 2 (Client):
```bash
cd client
npm start
```

---

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Admin Users Table
```sql
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Properties Table
```sql
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255) NOT NULL,
  state VARCHAR(50) NOT NULL,
  county VARCHAR(100) NOT NULL,
  acres DECIMAL(10,2) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  acquisition_cost DECIMAL(10,2),        -- NEW: For profit tracking
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'available',
  apn VARCHAR(100),                       -- Assessor's Parcel Number
  coordinates TEXT,                       -- JSON: GPS coordinates
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:**
- `available` - Listed on public site
- `coming_soon` - In redemption, not purchasable yet
- `pending` - Purchase initiated
- `under_contract` - Contract signed
- `sold` - Sale complete

### Loans Table
```sql
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  property_id INTEGER REFERENCES properties(id),
  purchase_price DECIMAL(10,2) NOT NULL,
  down_payment DECIMAL(10,2) NOT NULL,
  processing_fee DECIMAL(10,2) DEFAULT 99.00,
  loan_amount DECIMAL(10,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  balance_remaining DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  next_payment_date DATE,                 -- NEW: Customer's chosen payment date
  alerts_disabled BOOLEAN DEFAULT FALSE,  -- NEW: Admin can disable alerts
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Status Values:**
- `active` - Loan in repayment
- `paid_off` - Loan completed

### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id),
  user_id INTEGER REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  square_payment_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'completed',
  payment_method VARCHAR(50) DEFAULT 'square',
  principal_amount DECIMAL(10,2),
  interest_amount DECIMAL(10,2),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Payment Types:**
- `down_payment` - Initial down payment
- `monthly_payment` - Regular installment

---

## 🔌 API Endpoints

### Public Endpoints

#### Authentication
```
POST /api/register
Body: { email, password, firstName, lastName, recaptchaToken }
Returns: { token, user }

POST /api/login
Body: { email, password }
Returns: { token, user }

POST /api/admin/login
Body: { email, password }
Returns: { token, admin }
```

#### Properties
```
GET /api/properties
Returns: Array of available properties

GET /api/properties/:id
Returns: Single property details

GET /api/properties/sold
Returns: Array of sold/under contract properties
```

### Protected Customer Endpoints
**Requires:** `Authorization: Bearer {token}`

#### Loans
```
GET /api/loans
Returns: User's loans

GET /api/loans/:id
Returns: Single loan details

POST /api/loans
Body: { 
  propertyId, 
  downPaymentPercentage, 
  termMonths, 
  paymentNonce,
  phone,
  paymentDueDay          # NEW: 1 or 15
}
Returns: Created loan
```

#### Payments
```
POST /api/payments
Body: { loanId, amount, paymentNonce }
Returns: Payment confirmation

GET /api/loans/:id/payments
Returns: Payment history for loan
```

### Protected Admin Endpoints
**Requires:** `Authorization: Bearer {adminToken}`

#### Admin Stats
```
GET /api/admin/stats
Returns: { totalProperties, activeLoans, totalCustomers }
```

#### Property Management
```
GET /api/admin/properties
Returns: All properties (all statuses)

POST /api/admin/properties
Body: { title, description, location, state, county, acres, price, acquisition_cost, apn, coordinates }
Returns: Created property

PUT /api/admin/properties/:id
Body: Property data
Returns: Updated property

PATCH /api/admin/properties/:id/status
Body: { status }
Returns: Updated property

DELETE /api/admin/properties/:id
Returns: Success message
```

#### Customer Management
```
GET /api/admin/customers
Returns: All customers with loan summaries

GET /api/admin/customers/:id
Returns: Customer details with loans
```

#### Loan Management (NEW)
```
GET /api/admin/loans
Returns: All loans with property and customer data, including:
  - property_price
  - property_acquisition_cost
  - Profit calculation ready
  - ROI calculation ready

PATCH /api/admin/loans/:id/toggle-alert
Returns: Updated alert status
```

---

## 🎨 Frontend Components

### Key Components

#### Navbar.js
- Responsive navigation
- Logo display (horizontal/icon based on screen size)
- Auth-aware menu (logged in vs logged out)
- Admin navigation when admin logged in

#### AuthContext.js
- Global authentication state
- JWT token management
- User session persistence
- Protected route logic

#### PropertyDetail.js
- Advanced financing calculator
- Payment due day selection (NEW)
- Square payment integration
- Billing information collection
- GPS coordinate display

#### Dashboard.js
- Customer loan overview
- Next payment due date display (NEW)
- Color-coded payment alerts (NEW)
- Progress bars
- Payment status warnings

#### LoanDetail.js
- Detailed loan information
- Next payment due date (NEW)
- Square payment form
- Payment history link

#### AdminLoans.js (NEW)
- Complete loan management dashboard
- Profit/ROI columns
- Filter by status (Active, Overdue, Paid Off)
- Search functionality
- Alert toggle buttons
- Overdue highlighting
- Mobile-responsive

### CSS Architecture

**Variables:**
```css
--forest-green: #2c5f2d
--dark-forest: #1e4620
--sandy-gold: #f4a460
--muted-gold: #d4873e
--light-green: #f0f8f0
```

**Key Classes:**
- `.btn`, `.btn-primary`, `.btn-secondary`
- `.card` - Standard card container
- `.status-badge` - Status indicators
- `.progress-bar` - Loan progress visualization
- `.dashboard-summary` - Summary cards grid
- `.desktop-only`, `.mobile-only` - Responsive helpers

---

## 🔒 Authentication & Security

### JWT Authentication
- **Token Expiry:** 24 hours
- **Storage:** localStorage
- **Refresh:** Manual re-login required
- **Admin Separate:** Different token for admin routes

### Password Security
- **Hashing:** bcrypt with salt rounds
- **Minimum Requirements:** None enforced (consider adding)
- **Storage:** Never stored in plain text

### reCAPTCHA v3
- **Implementation:** Registration form
- **Score Threshold:** 0.5
- **Fallback:** Server-side validation

### Environment Variables
- **Never committed:** .gitignore includes .env
- **Production:** Set in Railway/Netlify dashboards
- **Rotation:** Change periodically

### SQL Injection Prevention
- **Parameterized Queries:** All database queries use `$1, $2` syntax
- **Input Validation:** Server-side validation on all inputs

---

## 💳 Payment Processing

### Square Integration

#### Sandbox Testing
**Test Card:**
```
Card Number: 4111 1111 1111 1111
CVV: 111
Expiration: Any future date
ZIP: Any 5 digits
```

#### Payment Flow
1. Customer selects financing option and payment due day
2. Enters billing information (name, phone, address)
3. Square tokenizes card (PCI compliant)
4. Backend processes payment
5. Loan created with next_payment_date calculated
6. Property status updated

#### Production Checklist
- [ ] Switch to Production access token
- [ ] Update SQUARE_ENVIRONMENT to 'production'
- [ ] Test with small real payment
- [ ] Monitor first transactions
- [ ] Set up Square webhooks (optional)

### Payment Due Day Logic
```javascript
// Customer chooses 1 or 15
// If choosing 1st: First payment = 1st of next month
// If choosing 15th:
//   - If today < 15th: First payment = this month's 15th
//   - If today >= 15th: First payment = next month's 15th
```

---

## 🚀 Deployment

### Frontend (Netlify)

#### Build Settings
```
Build command: npm run build
Publish directory: client/build
Node version: 18
```

#### Environment Variables
```
REACT_APP_API_URL=https://your-backend.railway.app/api
REACT_APP_SQUARE_APPLICATION_ID=
REACT_APP_SQUARE_LOCATION_ID=
REACT_APP_SQUARE_ENVIRONMENT=sandbox
REACT_APP_RECAPTCHA_SITE_KEY=
```

#### Custom Domain Setup
1. Add custom domain in Netlify
2. Update DNS records:
   - A record: 75.2.60.5
   - CNAME: your-site.netlify.app
3. Enable HTTPS (automatic)
4. Force HTTPS redirect

### Backend (Railway)

#### Deployment
```
1. Connect GitHub repository
2. Select main branch
3. Auto-deploy on push enabled
4. Set environment variables
5. Deploy
```

#### Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=...
SQUARE_ACCESS_TOKEN=...
SQUARE_ENVIRONMENT=sandbox
SQUARE_LOCATION_ID=...
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
RECAPTCHA_SECRET_KEY=...
PORT=5000
NODE_ENV=production
```

#### Health Check
```
GET https://your-app.railway.app/api/health
Returns: { status: 'ok', message: 'Green Acres API is running' }
```

### Database (Supabase)

#### Connection Setup
1. Enable IPv4 address
2. Copy connection string
3. Add to Railway environment
4. Enable connection pooling
5. Set SSL mode to require

#### Backup Strategy
- Automatic daily backups (Supabase)
- Manual export before major changes
- Test restore procedure

---

## 🔧 Development Workflow

### Git Workflow
```bash
# Feature development
git checkout -b feature/feature-name
# ... make changes ...
git add .
git commit -m "feat: Description of feature"
git push origin feature/feature-name

# Production deployment
git checkout main
git merge feature/feature-name
git push origin main
# Auto-deploys to Netlify & Railway
```

### Commit Message Conventions
```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Formatting, missing semi-colons
refactor: Code restructure
test: Adding tests
chore: Maintenance
```

### Testing Checklist
- [ ] Local testing (both dev servers)
- [ ] Mobile responsive check
- [ ] Cross-browser testing
- [ ] Payment flow test (sandbox)
- [ ] Admin tools test
- [ ] Error handling test

### Code Style
- **Indentation:** 2 spaces
- **Quotes:** Single quotes for JS, double for JSX attributes
- **Semicolons:** Used consistently
- **Comments:** For complex logic only
- **Variable names:** camelCase for JS, PascalCase for components

---

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### Database Connection Failed
- Check DATABASE_URL format
- Verify Supabase IPv4 enabled
- Test connection with psql
- Check firewall settings

#### Square Payment Errors
- Verify sandbox vs production mode matches
- Check Application ID and Location ID
- Ensure card number is test card for sandbox
- Check browser console for detailed errors

#### Build Failures (Netlify)
- Check environment variables set
- Verify Node version (18)
- Check for console errors in build log
- Clear cache and retry

#### JWT Token Expired
- Tokens expire after 24 hours
- User must log in again
- Consider implementing refresh tokens

### Debugging Tips

#### Backend Debugging
```javascript
// Add console.logs
console.log('Request body:', req.body);
console.log('User:', req.user);

// Check environment variables
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Missing');
```

#### Frontend Debugging
```javascript
// Check API responses
console.log('API Response:', response.data);

// Check auth state
console.log('Is Authenticated:', isAuthenticated);
console.log('Token:', localStorage.getItem('token'));
```

#### Database Debugging
```sql
-- Check table contents
SELECT * FROM users LIMIT 5;
SELECT * FROM properties WHERE status = 'available';
SELECT * FROM loans WHERE status = 'active';

-- Check for orphaned records
SELECT * FROM loans WHERE user_id NOT IN (SELECT id FROM users);
```

---

## 🚀 Future Enhancements

### Phase 6: Property Tax Tracking
**Goal:** Track property taxes for each parcel

**Database Changes:**
```sql
ALTER TABLE properties ADD COLUMN annual_tax_amount DECIMAL(10,2);
ALTER TABLE properties ADD COLUMN tax_due_date DATE;
ALTER TABLE properties ADD COLUMN tax_paid BOOLEAN DEFAULT FALSE;
```

**Features:**
- Admin inputs tax amount and due date
- Customer sees tax info on loan detail
- Customer can pay tax through platform
- Admin marks as paid
- Tax calendar view

### Phase 7: Selling Expenses Tracking
**Goal:** Track all costs for true profit calculation

**Database Changes:**
```sql
ALTER TABLE properties ADD COLUMN selling_expenses DECIMAL(10,2);
-- Or for itemized:
CREATE TABLE property_expenses (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  expense_type VARCHAR(100),
  amount DECIMAL(10,2),
  description TEXT,
  date DATE
);
```

**Features:**
- Track postal fees, deed fees, title fees, etc.
- Calculate true profit: price - acquisition - expenses
- Update ROI calculation
- Expense reports

### Phase 8: Advanced Features
- **Multiple Property Images** (up to 10 per property)
- **Email Notifications** (payment reminders, receipts)
- **SMS Reminders** (via Twilio)
- **Document Storage** (contracts, deeds)
- **Automated Payment Reminders**
- **Late Fee Calculation**
- **Early Payoff Calculations**

### Phase 9: Business Intelligence
- **Financial Dashboard** (revenue, profit trends)
- **Customer Analytics** (payment patterns, demographics)
- **Property Performance** (time to sell, ROI by state)
- **Cash Flow Projections**
- **Export Reports** (CSV, PDF)

---

## 📝 Code Conventions

### Backend Conventions

#### Route Organization
```javascript
// Group routes by category
// ==================== AUTH ROUTES ====================
// ==================== PROPERTY ROUTES ====================
// ==================== LOAN ROUTES ====================
```

#### Error Handling
```javascript
try {
  // ... operation ...
  res.json({ success: true, data });
} catch (error) {
  console.error('Operation error:', error);
  res.status(500).json({ error: 'Operation failed' });
}
```

#### Database Queries
```javascript
// Always use parameterized queries
const result = await db.pool.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);
```

### Frontend Conventions

#### Component Structure
```javascript
// 1. Imports
import React, { useState, useEffect } from 'react';

// 2. Component definition
function ComponentName() {
  // 3. State declarations
  const [data, setData] = useState([]);
  
  // 4. Effects
  useEffect(() => {
    loadData();
  }, []);
  
  // 5. Event handlers
  const handleClick = () => {
    // ...
  };
  
  // 6. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 7. Export
export default ComponentName;
```

#### API Calls
```javascript
// Use try/catch
try {
  const response = await axios.get(`${API_URL}/endpoint`);
  setData(response.data);
} catch (error) {
  setError('Failed to load');
  console.error(error);
}
```

---

## 📊 Performance Optimization

### Frontend Optimization
- Lazy loading for routes (React.lazy)
- Image optimization (compress before upload)
- Minimize bundle size (tree shaking)
- Cache API responses where appropriate
- Use React.memo for expensive components

### Backend Optimization
- Database connection pooling (enabled)
- Index frequently queried columns
- Limit query results
- Cache static data
- Compress API responses (gzip)

### Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(status);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_payments_loan_id ON payments(loan_id);
```

---

## 🎨 Branding Guidelines

### Logo Usage
- **Full Logo:** Homepage hero, marketing materials
- **Horizontal Logo:** Desktop navbar
- **Icon Logo:** Mobile navbar, favicon
- **Light Versions:** Dark backgrounds

### Color Palette
- **Forest Green (#2c5f2d):** Primary actions, headings
- **Dark Forest (#1e4620):** Hover states, emphasis
- **Sandy Gold (#f4a460):** Accents, "Most Popular" badges
- **Light Green (#f0f8f0):** Backgrounds, subtle highlights

### Typography
- **Headings:** Bold, Forest Green
- **Body:** Regular, #333
- **Secondary:** Regular, #666
- **Buttons:** Medium weight, uppercase for CTAs

---

## 🆘 Support & Maintenance

### Regular Maintenance Tasks
- [ ] Monitor error logs (Railway dashboard)
- [ ] Review payment processing (Square dashboard)
- [ ] Check database backups (weekly)
- [ ] Update dependencies (monthly)
- [ ] Review and respond to customer inquiries
- [ ] Test payment processing (monthly)

### Security Updates
- [ ] Rotate JWT secret (quarterly)
- [ ] Update admin password (quarterly)
- [ ] Review and update dependencies
- [ ] Check for Square SDK updates
- [ ] Review access logs

### Monitoring
- **Railway:** Check deployment logs, errors
- **Netlify:** Check build status, errors
- **Supabase:** Monitor database performance
- **Square:** Review transactions, disputes

---

## 📞 Key Resources

### Documentation
- [React Docs](https://react.dev)
- [Express Docs](https://expressjs.com)
- [Square Docs](https://developer.squareup.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [Supabase Docs](https://supabase.com/docs)

### Support
- **Square Support:** developer.squareup.com/support
- **Railway Support:** railway.app/help
- **Netlify Support:** netlify.com/support
- **Supabase Support:** supabase.com/support

---

**Built with ❤️ for Green Acres Land Investments, LLC**

*Last updated: November 5, 2025*