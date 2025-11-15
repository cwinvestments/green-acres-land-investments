# 🌿 Green Acres Land Investments - Technical Reference Guide
**Version:** 2.2  
**Last Updated:** November 14, 2025
**Purpose:** Technical reference for code architecture, development patterns, and setup instructions

> **📋 For Current Project Status:** See [PROJECT-SUMMARY.md] for features completed, session history, and what's next.
> 
> **This guide** contains technical reference material for working with the codebase.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Code Architecture & Conventions](#code-architecture--conventions)
4. [Project Structure](#project-structure)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Property Coordinate System](#property-coordinate-system)
8. [Multi-State Property Management](#multi-state-property-management)
9. [Loan Tracking System](#loan-tracking-system)
10. [Deployment Setup](#deployment-setup)
11. [Logo & Branding](#logo--branding)
12. [Development Workflow](#development-workflow)
13. [Troubleshooting](#troubleshooting)
14. [Security Guidelines](#security-guidelines)

---

## 🎯 Project Overview

**Business:** Green Acres Land Investments, LLC  
**Tagline:** "Your Land. Your Terms."  
**Owner:** Claude Weidner

### Business Model
- Purchase raw land at auction
- Resell with flexible owner financing
- Make land ownership accessible to everyone
- Price range: $2,000 - $10,000 typically
- Flexible payment plans with special $99 down option

### Value Proposition
Financing options that traditional lenders don't offer:
- **Special $99 Down:** 18% APR (most accessible option)
- **20% Down:** 12% APR
- **25% Down:** 8% APR
- **35% Down:** 8% APR  
- **50% Down:** 8% APR
- Loan terms: 1-5 years maximum
- $50 minimum monthly payment
- $99 processing fee on all purchases
- No early payoff penalties

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router 6
- **HTTP Client:** Axios
- **Payment SDK:** Square Web SDK
- **Styling:** Modern CSS (Flexbox/Grid)
- **Hosting:** Netlify
- **Repository:** GitHub (cwinvestments organization)

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Authentication:** JWT (jsonwebtoken) - 24-hour expiry
- **Password Hashing:** bcrypt
- **Security:** reCAPTCHA v3
- **Payment Processing:** Square API
- **Hosting:** Railway (Production) - Auto-deploys from GitHub
- **Live URL:** https://green-acres-land-investments-production.up.railway.app/api

### Database
- **Production:** PostgreSQL via Supabase
- **Library:** pg (node-postgres)
- **Connection:** IPv4-enabled (add-on purchased - $4/month)
- **Project:** db.fywbavjylonrnaipxawn.supabase.co
- **Status:** Fully operational

### Additional Features
- **Image Storage:** Cloudinary with direct file uploads, drag-and-drop reordering
- **PDF Generation:** PDFKit for comprehensive financial reports
- **Reporting:** Advanced financial analytics with export capabilities
- **Mobile UI:** Fully responsive admin interfaces
- **Mapping:** Google Maps API (integrated for GPS coordinates)
- **Coordinate System:** 5-point GPS boundary system for raw land parcels (implemented)

### Future Integrations
- **Email Notifications:** SendGrid/Mailgun for payment reminders and alerts
- **File Processing:** KML/KMZ/GPX import for property boundaries

---

---

## 🆕 Recent Technical Additions (November 2025)

### Mobile Responsiveness Overhaul (November 14, 2025)

**Feature:** Complete platform-wide mobile optimization with standardized responsive patterns

**Problem Solved:**
Multiple admin and client pages had cut-off headers, horizontal scrolling tables, inconsistent button layouts, and cramped mobile displays.

**Solution Implemented:**
- Standardized responsive header pattern: `flexWrap: 'wrap', gap: '1rem'`
- Changed rigid grids from `'1fr 1fr'` to `repeat(auto-fit, minmax(250px, 1fr))`
- Replaced desktop-only scrolling tables with mobile card views
- Established consistent button layouts using `flex: '1 1 auto'`
- Added responsive font sizing with `clamp()` where needed

**Files Updated:**
- CustomerManagement.js - Fixed stats grid and mobile card display
- AccountSettings.js - Responsive header with full-width button
- CreateCustomLoan.js - Header wrapping
- ImportLoan.js - Form field stacking
- PropertyManagement.js - Standardized header format
- TaxSummary.js - Fixed syntax error, added quarterly mobile cards

**Pattern Established:**
```javascript
// Standard responsive header
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '1rem' }}>

// Standard responsive grid
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>

// Desktop-only table with mobile-only cards
<div className="desktop-only">...</div>
<div className="mobile-only">...</div>
```

**Result:** Zero horizontal scrolling, professional mobile experience across entire platform.

---

### Amended Contract System (November 13, 2025)

**Feature:** Automatic detection and generation of amended contracts for imported loans

**Technical Implementation:**

**Detection Logic:**
```javascript
// In /api/admin/loans/:id/generate-contract
const paymentsResult = await db.pool.query(
  'SELECT COUNT(*) as payment_count, 
   COALESCE(SUM(principal_amount), 0) as total_principal_paid 
   FROM payments WHERE loan_id = $1',
  [loanId]
);

const paymentCount = parseInt(paymentsResult.rows[0].payment_count);
const isImportedLoan = paymentCount > 0;
```

**Template System:**
- File: `/server/contract-template.txt`
- Dynamic placeholder: `{{PAYMENT_TERMS_SECTION}}`
- Conditional variable: `{{IS_AMENDED}}`
- Automatic selection based on payment history

**Contract Types:**
1. **Standard:** `isImportedLoan === false` → Full purchase terms
2. **Amended:** `isImportedLoan === true` → Historical reference + remaining balance

**Database Requirements:**
- Requires `loans.created_at` or import date for original contract date
- Queries `payments` table for history
- Uses `loans.balance_remaining` for current balance

**Number-to-Words Conversion:**
```javascript
function numberToWords(num) {
  // Converts: $5,000.00 → "Five Thousand dollars"
  // Handles: thousands, hundreds, tens, ones
  // Format: dollars as words + "and XX/100" for cents
}
```

---

### Imported Loan Payment System (November 13, 2025)

**Feature:** Import existing loans with complete payment history and automatic revenue calculation

**Critical Field: loan_payment_amount**

**Problem Solved:**
Financial reports were showing $0 revenue for imported loans because `loan_payment_amount` field was NULL.

**Solution:**
```javascript
// In /api/admin/loans/import endpoint
for (const payment of payments) {
  const principalAmount = parseFloat(payment.principalAmount) || 0;
  const interestAmount = parseFloat(payment.interestAmount) || 0;
  const loanPaymentAmount = principalAmount + interestAmount; // CRITICAL
  
  await db.pool.query(`
    INSERT INTO payments (
      loan_id, user_id, amount, payment_type, payment_method,
      status, payment_date, principal_amount, interest_amount,
      tax_amount, hoa_amount, late_fee_amount, 
      loan_payment_amount  // ← Auto-calculated field
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
  `, [...values, loanPaymentAmount]);
}
```

**Database Schema Addition:**
```sql
ALTER TABLE payments 
ADD COLUMN loan_payment_amount DECIMAL(10, 2);

-- For existing imported payments:
UPDATE payments 
SET loan_payment_amount = COALESCE(principal_amount, 0) + COALESCE(interest_amount, 0)
WHERE payment_method = 'imported' 
  AND loan_payment_amount IS NULL;
```

**Why This Matters:**
- Financial reports query: `SUM(loan_payment_amount)` for revenue
- Missing values caused underreporting
- Tax summaries require accurate loan payment amounts
- Monthly trends depend on this field

**Payment Method Values:**
- `imported` - Historical payments from import
- `square` - Credit card payments via Square
- `cash`, `check`, `venmo`, `zelle` - Manual payments
- `custom_loan` - Custom loan down payments

**Revenue Reporting:**
All reports now correctly aggregate:
```sql
SELECT 
  payment_method,
  SUM(loan_payment_amount) as revenue,
  SUM(tax_amount) as tax_collected,
  SUM(hoa_amount) as hoa_collected
FROM payments
WHERE status = 'completed'
GROUP BY payment_method;
```

---

## 💻 Code Architecture & Conventions

**CRITICAL FOR FUTURE DEVELOPMENT:** This section documents how the codebase is structured to avoid wasting time redoing work that's already done.

### Backend Architecture

**Server File:** `server/server.js`
- **Database Library:** `pg` (node-postgres) - NOT SQLite
- **Database Access:** Uses `db.pool.query()` with parameterized queries
- **Pattern:** `await db.pool.query('SELECT * FROM table WHERE id = $1', [value])`
- **NO `db.prepare()` calls** - that's SQLite syntax and will cause errors

**Database File:** `server/database.js`
- Exports `{ pool, initDatabase }`
- `pool` is the PostgreSQL connection pool
- `initDatabase()` creates tables if they don't exist
- Uses `pg.Pool` configured with `DATABASE_URL` environment variable

**Key Points:**
- ✅ All queries use `async/await`
- ✅ All queries use parameterized values (`$1, $2, $3...`)
- ✅ Returns `result.rows` array (PostgreSQL format)
- ✅ Use `.rows[0]` for single record, `.rows` for multiple
- ❌ NO synchronous `db.prepare().get()` or `.run()` calls
- ❌ NO `?` placeholders (that's SQLite, use `$1, $2` instead)

**Example Query Patterns:**
```javascript
// Single record
const result = await db.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = result.rows[0];

// Multiple records
const result = await db.pool.query('SELECT * FROM loans WHERE user_id = $1', [userId]);
const loans = result.rows;

// Insert with RETURNING
const result = await db.pool.query(
  'INSERT INTO loans (user_id, amount) VALUES ($1, $2) RETURNING id',
  [userId, amount]
);
const newId = result.rows[0].id;
```

### Frontend Architecture

**All Page Files:** `client/src/pages/`
- Dashboard.js
- LoanDetail.js
- PaymentHistory.js
- PropertyDetail.js
- Properties.js
- Home.js
- Login.js
- Register.js
- Admin/ (admin dashboard pages)

**CRITICAL Field Names (Database → Frontend):**

These field names MUST match between database and frontend code:

| Database Column | Frontend Variable | Notes |
|----------------|-------------------|-------|
| `balance_remaining` | `loan.balance_remaining` | NOT `loan.balance` |
| `loan_amount` | `loan.loan_amount` | NOT `loan.principal` |
| `purchase_price` | `loan.purchase_price` | Property price |
| `down_payment` | `loan.down_payment` | Down payment amount |
| `processing_fee` | `loan.processing_fee` | $99 fee |
| `interest_rate` | `loan.interest_rate` | APR percentage |
| `term_months` | `loan.term_months` | Loan term |
| `monthly_payment` | `loan.monthly_payment` | Monthly payment |
| `total_amount` | `loan.total_amount` | Total to be paid |

**Common Mistake to Avoid:**
- ❌ DON'T use `loan.balance` (old SQLite code used this)
- ✅ ALWAYS use `loan.balance_remaining`
- ❌ DON'T use `loan.principal` 
- ✅ ALWAYS use `loan.loan_amount`

### API Integration

**API File:** `client/src/api.js`

**Available Functions:**
- `login(credentials)` - User login
- `register(userData)` - User registration
- `getProperties()` - Get all properties
- `getProperty(id)` - Get single property
- `getLoans()` - Get user's loans (NOT `getUserLoans`)
- `getLoan(id)` - Get single loan
- `createLoan(data)` - Purchase property
- `createPayment(data)` - Make payment
- `getPaymentHistory(loanId)` - Get payment history
- `formatCurrency(amount)` - Format currency with 2 decimals

**Admin Functions:**
- `adminLogin(credentials)` - Admin authentication
- `getAdminStats()` - Dashboard statistics
- `getAllProperties()` - All properties including hidden
- `createProperty(data)` - Add new property
- `updateProperty(id, data)` - Update property
- `deleteProperty(id)` - Delete property
- `getAllCustomers()` - Get customer list with stats
- `getCustomerDetail(id)` - Get customer and their loans

**Common Mistake:**
- ❌ DON'T import `getUserLoans` (doesn't exist)
- ✅ Import `getLoans` instead

### Square Payment Integration

**Environment Variables Required:**
- `REACT_APP_SQUARE_APPLICATION_ID` - Application ID (starts with `sandbox-`)
- `REACT_APP_SQUARE_LOCATION_ID` - Location ID
- `REACT_APP_SQUARE_ENVIRONMENT` - `sandbox` or `production`

**Pattern for Square Payments:**
```javascript
// 1. Initialize Square (in component)
const payments = window.Square.payments(
  process.env.REACT_APP_SQUARE_APPLICATION_ID,
  process.env.REACT_APP_SQUARE_LOCATION_ID
);

// 2. Create card instance
const card = await payments.card();
await card.attach('#card-container');

// 3. Tokenize on submit
const result = await card.tokenize();
if (result.status === 'OK') {
  // Send result.token to backend as paymentNonce
}
```

**CRITICAL:** The `#card-container` div must exist in DOM BEFORE calling `card.attach()`. 

**Solution:** Always render it (hidden initially):
```jsx
<div id="card-container" style={{ display: cardInstance ? 'block' : 'none' }}></div>
```

### File Editing Best Practices

**IMPORTANT:** VS Code has been known to cache files incorrectly on this project.

**Safe File Editing:**
1. For critical files (server.js, database.js, page components), use **Notepad** instead of VS Code
2. Always verify changes took effect:
```bash
   type filename | find "specific text"
```
3. If React doesn't pick up changes:
   - Stop client (Ctrl+C)
   - Restart: `npm start`
   - Hard refresh browser (Ctrl+Shift+R)

### Development Gotchas

1. **Two .env Files Required:**
   - `server/.env` - Backend config
   - `client/.env` - Frontend config (REACT_APP_ prefix)
   - They're different! Don't mix them up.

2. **Terminal Setup:**
   - Need 2-3 terminals running simultaneously
   - Terminal 1: Server (`cd server && npm start`)
   - Terminal 2: Client (`cd client && npm start`)
   - Terminal 3: Commands (optional)
   - Use Command Prompt, NOT PowerShell

3. **Port Management:**
   - Server: 5000
   - Client: 3000
   - If "port in use" error, close other instances

4. **PostgreSQL Connection:**
   - Requires Supabase IPv4 add-on ($4/month)
   - Connection string uses URL-encoded password
   - Test connection: Check server startup logs for "✅ Database initialized successfully"

---

## 📁 Project Structure
```
C:\Projects\GreenAcres\
├── client/                      # React Frontend
│   ├── public/
│   │   ├── images/             # Logo files
│   │   │   ├── green-acres-full-logo.svg
│   │   │   ├── green-acres-horizontal.svg
│   │   │   ├── green-acres-icon.svg
│   │   │   └── green-acres-full-512.png
│   │   ├── favicon-16.png
│   │   ├── favicon-32.png
│   │   ├── favicon-64.png
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js       # Navigation with logo
│   │   ├── pages/
│   │   │   ├── Home.js         # Landing page
│   │   │   ├── Properties.js   # Property listings
│   │   │   ├── PropertyDetail.js # Property detail + calculator
│   │   │   ├── Login.js        # User login
│   │   │   ├── Register.js     # User registration
│   │   │   ├── Dashboard.js    # Customer dashboard
│   │   │   ├── LoanDetail.js   # Individual loan view
│   │   │   ├── PaymentHistory.js # Payment history
│   │   │   └── Admin/          # Admin dashboard pages
│   │   │       ├── AdminLogin.js
│   │   │       ├── AdminDashboard.js
│   │   │       ├── PropertyManagement.js
│   │   │       └── CustomerManagement.js
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication state
│   │   ├── App.js              # Main app with routing
│   │   ├── api.js              # API helper functions
│   │   ├── index.js            # React entry point
│   │   └── index.css           # All styles (500+ lines)
│   ├── .env                    # Client environment variables
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── server.js               # Main Express server
│   ├── database.js             # Database operations
│   ├── .env                    # Server environment variables
│   └── package.json
│
├── README.md                    # Setup instructions
├── QUICKSTART.md               # Quick start guide
├── PROJECT-SUMMARY.md          # Current status & features
├── GREEN-ACRES-PROJECT-GUIDE.md # This technical guide
└── .gitignore                  # Git ignore rules
```

---

## 💾 Database Setup

### PostgreSQL via Supabase (Production)

**Connection Details:**
- **Host:** db.fywbavjylonrnaipxawn.supabase.co
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Password:** AlyssaMatthew0211$$!$! (URL encoded in connection string)

**Connection String Format:**
```
postgresql://postgres:AlyssaMatthew0211%24%24%21%24%21@db.fywbavjylonrnaipxawn.supabase.co:5432/postgres
```

**Note:** Special characters in password must be URL encoded:
- `$` → `%24`
- `!` → `%21`

**Status:**
- ✅ Supabase project active and healthy
- ✅ IPv4 add-on purchased and enabled
- ✅ Connection working properly
- ✅ All tables created and populated
- ✅ Full CRUD operations tested

**Tables:**
1. **users** - Customer accounts
2. **properties** - Land listings with GPS coordinates
3. **loans** - Customer loans
4. **payments** - Payment records

### Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Properties Table
```sql
CREATE TABLE properties (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  acreage DECIMAL(10, 2),
  location VARCHAR(255),
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'available',
  
  -- GPS Coordinates (5-point system)
  gps_coordinates TEXT,  -- JSON: {ne, se, sw, nw, center}
  
  -- Admin tracking
  acquisition_cost DECIMAL(10, 2),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Status values: 'available', 'pending', 'under_contract', 'sold', 'coming_soon'
);

-- Index for filtering by status
CREATE INDEX idx_properties_status ON properties(status);
```

**GPS Coordinates JSON Format:**
```json
{
  "ne": {"lat": 44.262500, "lng": -88.414800},
  "se": {"lat": 44.261800, "lng": -88.414800},
  "sw": {"lat": 44.261800, "lng": -88.416200},
  "nw": {"lat": 44.262500, "lng": -88.416200},
  "center": {"lat": 44.262150, "lng": -88.415500}
}
```

#### Loans Table
```sql
CREATE TABLE loans (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  property_id INTEGER REFERENCES properties(id),
  
  -- Loan amounts
  purchase_price DECIMAL(10, 2) NOT NULL,
  down_payment DECIMAL(10, 2) NOT NULL,
  processing_fee DECIMAL(10, 2) DEFAULT 99.00,
  loan_amount DECIMAL(10, 2) NOT NULL,
  balance_remaining DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  
  -- Loan terms
  interest_rate DECIMAL(5, 2) NOT NULL,
  term_months INTEGER NOT NULL,
  monthly_payment DECIMAL(10, 2) NOT NULL,
  
  -- Status and dates
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  first_payment_date DATE,
  
  -- Billing information
  billing_name VARCHAR(255),
  billing_address VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(2),
  billing_zip VARCHAR(10),
  billing_phone VARCHAR(20),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_loans_user ON loans(user_id);
CREATE INDEX idx_loans_property ON loans(property_id);
CREATE INDEX idx_loans_status ON loans(status);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  loan_id INTEGER REFERENCES loans(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_type VARCHAR(50) NOT NULL,
  
  -- Square payment details
  square_payment_id VARCHAR(255),
  payment_nonce VARCHAR(255),
  
  -- Payment status
  status VARCHAR(50) DEFAULT 'completed',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_loan ON payments(loan_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
```

---

## ⚙️ Environment Configuration

### Server Environment Variables (`server/.env`)

```env
# Database
DATABASE_URL=postgresql://postgres:AlyssaMatthew0211%24%24%21%24%21@db.fywbavjylonrnaipxawn.supabase.co:5432/postgres

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# Square API (Sandbox Mode)
SQUARE_ACCESS_TOKEN=your-square-sandbox-access-token
SQUARE_LOCATION_ID=your-square-location-id
SQUARE_ENVIRONMENT=sandbox

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password

# Server
PORT=5000

# reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Client Environment Variables (`client/.env`)

```env
# API URL (production)
REACT_APP_API_URL=https://green-acres-land-investments-production.up.railway.app/api

# Square (Sandbox Mode)
REACT_APP_SQUARE_APPLICATION_ID=your-square-app-id
REACT_APP_SQUARE_LOCATION_ID=your-square-location-id
REACT_APP_SQUARE_ENVIRONMENT=sandbox

# reCAPTCHA
REACT_APP_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
```

**Important Notes:**
- All client variables MUST start with `REACT_APP_`
- Never commit `.env` files to Git
- Use `.env.example` files as templates
- Switch Square to `production` mode when going live
- Update `REACT_APP_API_URL` to Railway URL for production

---

## 🗺️ Property Coordinate System

### Overview
Since Green Acres deals with raw land parcels (not traditional residential properties), properties are identified by GPS coordinates rather than street addresses. Each property uses a 5-point coordinate system for accurate boundary definition and mapping.

### Coordinate Requirements

**5-Point System:**
1. **NE Corner:** Northeast corner latitude/longitude
2. **SE Corner:** Southeast corner latitude/longitude
3. **SW Corner:** Southwest corner latitude/longitude
4. **NW Corner:** Northwest corner latitude/longitude
5. **Center Point:** Property center latitude/longitude

**Coordinate Format:**
- Latitude: Decimal degrees (e.g., 44.2619° N)
- Longitude: Decimal degrees (e.g., -88.4154° W)
- Precision: 8 decimal places (±1.1mm accuracy)

### Storage Format

**JSON in Database:**
```json
{
  "ne": {"lat": 44.262500, "lng": -88.414800},
  "se": {"lat": 44.261800, "lng": -88.414800},
  "sw": {"lat": 44.261800, "lng": -88.416200},
  "nw": {"lat": 44.262500, "lng": -88.416200},
  "center": {"lat": 44.262150, "lng": -88.415500}
}
```

### Admin Interface

**Property Form Fields:**
- NE Corner (Lat/Lng)
- SE Corner (Lat/Lng)
- SW Corner (Lat/Lng)
- NW Corner (Lat/Lng)
- Center Point (Lat/Lng)

**Validation:**
- All coordinates within valid ranges
- Corners form a valid quadrilateral
- Center point is inside boundary

### Customer Display

**PropertyDetail.js displays:**
- Individual Google Maps links for each corner point
- Center point link
- Opens in Google Maps for directions

**Link Format:**
```
https://www.google.com/maps?q=44.262500,-88.414800
```

---

## 🗺️ Multi-State Property Management

### Overview
Green Acres can expand into multiple states with organized county-level property management.

### Target Markets

**Initial States:**
- **Arizona** - Desert land parcels
- **Colorado** - Mountain and rural properties  
- **Arkansas** - Wooded and recreational land

### Database Schema (Future)

**States Table:**
```sql
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(2) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  coming_soon BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Counties Table:**
```sql
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(state_id, name)
);
```

**Property Images Table:**
```sql
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  caption VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Image Upload System (Future)

**Requirements:**
- Maximum: 10 images per property
- Formats: JPG, PNG, WebP
- Max Size: 5MB per image
- Resolution: 1920x1080px (auto-resized)

**Storage Options:**
1. Cloud Storage (AWS S3, Cloudflare R2) - Recommended
2. Server Storage (/server/uploads/)
3. Third-party (Cloudinary, Uploadcare)

---

## 📊 Loan Tracking System

### Loan Calculation Logic

**Monthly Payment Formula:**
```javascript
// Monthly payment calculation
const monthlyRate = (interestRate / 100) / 12;
const numPayments = termMonths;
const monthlyPayment = 
  (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
  (Math.pow(1 + monthlyRate, numPayments) - 1);
```

**Financing Options:**
- **$99 Down:** 18% APR
- **20% Down:** 12% APR
- **25% Down:** 8% APR
- **35% Down:** 8% APR
- **50% Down:** 8% APR

**Loan Terms:** 1-5 years (12-60 months)

**Processing Fee:** $99 (added to loan amount)

### Payment Processing

**Payment Types:**
- `down_payment` - Initial down payment at purchase
- `monthly_payment` - Regular monthly payment
- `payoff` - Pay remaining balance

**Payment Flow:**
1. Customer enters payment amount
2. Square tokenizes card
3. Backend processes payment via Square API
4. Update loan balance
5. Record payment in database
6. Display success message

### Balance Updates

**After Each Payment:**
```sql
UPDATE loans
SET balance_remaining = balance_remaining - $1
WHERE id = $2
```

**Payment Record:**
```sql
INSERT INTO payments (loan_id, amount, payment_type, square_payment_id, status)
VALUES ($1, $2, $3, $4, 'completed')
```

---

## 🚀 Deployment Setup

### Backend Deployment (Railway)

**Live URL:** https://green-acres-land-investments-production.up.railway.app/api

**Setup Steps:**
1. Create Railway account and project
2. Connect GitHub repository
3. Add environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - SQUARE_ACCESS_TOKEN
   - SQUARE_LOCATION_ID
   - SQUARE_ENVIRONMENT
   - ADMIN_USERNAME
   - ADMIN_PASSWORD
   - RECAPTCHA_SECRET_KEY
4. Railway auto-deploys from `main` branch
5. Enable auto-deploy on push

**Health Check Endpoint:**
```
GET /api/health
```

### Frontend Deployment (Netlify)

**Setup Steps:**
1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables:
   - REACT_APP_API_URL (Railway URL)
   - REACT_APP_SQUARE_APPLICATION_ID
   - REACT_APP_SQUARE_LOCATION_ID
   - REACT_APP_SQUARE_ENVIRONMENT
   - REACT_APP_RECAPTCHA_SITE_KEY
5. Add `_redirects` file:
```
/* /index.html 200
```

**Custom Domains Ready:**
- greenacreslandinvestments.com
- wefinancelandforyou.com
- greenacreslandinvestments.net
- wefinancelandforyou.net

### Database (Supabase)

**Status:** Production-ready
**Cost:** $4/month for IPv4 add-on
**Backups:** Automatic via Supabase
**Connection Pooling:** Enabled

---

## 🎨 Logo & Branding

### Logo Package (20 Files)

**Full Logos:**
- green-acres-full-logo.svg (scalable vector)
- green-acres-full-white.svg (light backgrounds)
- green-acres-full-512.png (raster)
- green-acres-full-1024.png (high-res)

**Horizontal Logos:**
- green-acres-horizontal.svg (desktop navbar)
- green-acres-horizontal-white.svg
- green-acres-horizontal-512.png

**Icon/Badge:**
- green-acres-icon.svg (mobile navbar)
- green-acres-icon-white.svg
- green-acres-icon-512.png

**Favicons:**
- favicon-16.png
- favicon-32.png
- favicon-64.png
- favicon-128.png
- favicon.ico

### Brand Colors

```css
:root {
  --forest-green: #2c5f2d;
  --dark-forest: #1e4620;
  --sandy-gold: #f4a460;
  --muted-gold: #d4873e;
  --light-green: #f0f8f0;
  --white: #ffffff;
  --light-gray: #f8f9fa;
  --gray: #6c757d;
  --success-green: #28a745;
  --warning-yellow: #ffc107;
  --danger-red: #dc3545;
}
```

**Primary:** Forest Green (#2c5f2d)  
**Accent:** Sandy Gold (#f4a460)  
**Background:** Light Green (#f0f8f0)

### Logo Usage

**Navbar:**
- Desktop: Horizontal logo (150px width)
- Mobile: Icon logo (40px)

**Hero Section:**
- Full logo with tagline
- 200px width

**Favicons:**
- All sizes included for browser compatibility

---

## 🔧 Development Workflow

### Local Development Setup

**Requirements:**
- Node.js v16+
- Git
- VS Code or text editor
- Square Developer account

**Initial Setup:**
```bash
# Clone repository
git clone [repository-url]
cd green-acres-land

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Configure environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your credentials
```

**Running Locally:**
```bash
# Terminal 1: Start server
cd server
npm start
# Server runs on http://localhost:5000

# Terminal 2: Start client
cd client
npm start
# Client runs on http://localhost:3000
```

### Git Workflow

**Branch Strategy:**
- `main` - Production branch (auto-deploys)
- Feature branches for new work

**Commit Messages:**
```
feat: Add GPS coordinate system to properties
fix: Correct decimal formatting on payments
docs: Update README with new features
style: Improve dashboard card layout
```

**Don't Commit:**
- `.env` files
- `node_modules/` directories
- `*.db` database files
- Passwords or secrets

**Do Commit:**
- `.env.example` files (templates)
- All source code
- Documentation
- Logo files

### Testing Workflow

**Test Credit Card (Square Sandbox):**
- Card Number: 4111 1111 1111 1111
- CVV: 111
- Expiration: Any future date
- ZIP: Any 5 digits

**Test Scenarios:**
1. User registration
2. Property browsing
3. Financing calculator
4. Purchase with down payment
5. Monthly payment
6. View payment history
7. Admin property management
8. Admin customer management

---

## 🐛 Troubleshooting

### Common Issues

**Server won't start:**
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000
# Kill process if needed
taskkill /PID [process-id] /F

# Verify environment variables
type server\.env

# Check database connection
# Look for "✅ Database initialized successfully" in logs
```

**Client won't start:**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Verify environment variables
type client\.env

# Clear cache and restart
npm start
```

**Database connection fails:**
- Verify Supabase IPv4 add-on is active
- Check connection string encoding ($ → %24, ! → %21)
- Test connection in Supabase dashboard
- Verify DATABASE_URL in server/.env

**Square payment errors:**
- Verify sandbox mode credentials
- Check browser console for errors
- Ensure `#card-container` div exists before attach()
- Verify CORS is enabled in Square dashboard

**React component not updating:**
- Stop client (Ctrl+C)
- Clear browser cache (Ctrl+Shift+Delete)
- Restart client: `npm start`
- Hard refresh (Ctrl+Shift+R)

**VS Code caching issues:**
- Use Notepad for critical file edits
- Verify changes: `type filename | find "text"`
- Restart VS Code if needed

### Deployment Issues

**Railway Backend:**
- Check environment variables are set
- View logs in Railway dashboard
- Verify Supabase connection from Railway
- Check health endpoint: /api/health

**Netlify Frontend:**
- Verify build command: `npm run build`
- Check environment variables (REACT_APP_ prefix)
- Ensure `_redirects` file exists
- Check deploy logs for errors

**Database:**
- Monitor Supabase dashboard for errors
- Check connection pooling limits
- Verify IPv4 add-on is active

### Error Messages

**"Cannot connect to database"**
- Check DATABASE_URL encoding
- Verify IPv4 add-on
- Test connection from server location

**"Invalid JWT token"**
- Token expired (24-hour limit)
- User needs to log in again
- Check JWT_SECRET matches

**"Payment processing failed"**
- Square credentials incorrect
- Network/CORS issue
- Check Square dashboard for details

---

## 🔒 Security Guidelines

### Authentication

**JWT Tokens:**
- 24-hour expiration for security
- Stored in localStorage
- Sent in Authorization header
- Server validates on protected routes

**Admin Authentication:**
- Separate admin credentials
- Environment variable storage
- Admin-only routes protected
- Session tokens for admin users

**Password Security:**
- bcrypt hashing (10 rounds)
- Never store plain text passwords
- Never log passwords
- Strong password requirements encouraged
- Customer password change: validates current password before update (POST /api/user/change-password)
- Admin password reset: generates 12-character secure temp password (POST /api/admin/customers/:id/reset-password)
- Minimum 6 characters required for all passwords

### reCAPTCHA Integration

**Purpose:** Prevent bot registrations

**Implementation:**
- reCAPTCHA v3 (invisible)
- Validates on registration
- Score threshold: 0.5
- Site key in client, secret in server

### Input Validation

**Frontend:**
- Required field validation
- Format validation (email, phone, ZIP)
- Min/max value checks
- Real-time feedback

**Backend:**
- Parameterized queries (SQL injection prevention)
- Input sanitization
- Type checking
- Business logic validation

### Payment Security

**Square Integration:**
- PCI compliance via Square
- No card data stored
- Tokenization only
- Secure nonce handling

**Best Practices:**
- Use HTTPS only
- Validate amounts server-side
- Log all transactions
- Monitor for fraud

### Environment Variables

**Protection:**
- Never commit `.env` files
- Use `.env.example` as template
- Strong secrets in production
- Rotate credentials periodically

**Required Security:**
- Strong JWT_SECRET (production)
- Secure ADMIN_PASSWORD
- Production Square keys (not sandbox)
- Secure database password

### Production Checklist

- [ ] Strong JWT secret
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting implemented
- [ ] Input validation everywhere
- [ ] XSS protection
- [ ] CSRF protection (if needed)
- [ ] Security headers configured
- [ ] Dependency audit: `npm audit`
- [ ] Error handling doesn't expose internals
- [ ] Production Square credentials
- [ ] Strong admin credentials
- [ ] Database backups enabled
- [ ] Monitoring/logging enabled

---

## 📚 Additional Resources

### Documentation Links

**Square API:**
- Docs: https://developer.squareup.com/docs
- Sandbox Testing: https://developer.squareup.com/docs/testing/sandbox

**PostgreSQL:**
- pg Library: https://node-postgres.com/
- Supabase: https://supabase.com/docs

**React:**
- React Docs: https://react.dev/
- React Router: https://reactrouter.com/

**Deployment:**
- Railway: https://docs.railway.app/
- Netlify: https://docs.netlify.com/

### Support

For current project status and features completed, see [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md)

For quick setup instructions, see [QUICKSTART.md](QUICKSTART.md)

---

**Last Updated:** November 4, 2025  
**Last Updated By:** Claude Weidner & AI Assistant  
**Next Update:** As technical architecture changes

---

## Recent Updates - November 15, 2025

### Mobile Responsive Fixes
**Status:** In Progress
**Documentation:** See `MOBILE-FIXES-PROGRESS.md` and `MOBILE-RESPONSIVE-CLEANUP.md`

**Completed:**
- ✅ Terms of Service modals fixed for mobile (PropertyDetail.js, Register.js)
- ✅ Root cause analysis of border cutoff issues
- ✅ Comprehensive refactor plan created

**Outstanding:**
- ⚠️ Property card borders cut off on mobile (Properties page, PropertyDetail page)
- ⚠️ Need professional CSS refactor (estimated 2-3 hours)

**Next Session Priority:** Follow `MOBILE-RESPONSIVE-CLEANUP.md` implementation plan - do it professionally, not with quick fixes.

*This guide is a technical reference. For project status, features, and session history, see PROJECT-SUMMARY.md*
