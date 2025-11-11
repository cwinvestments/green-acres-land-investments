# Green Acres Land Investments - Project Summary
**Last Updated: November 11, 2025**

## Project Overview
Green Acres Land Investments, LLC is a land financing platform that enables customers to purchase raw land with flexible owner financing options. The platform features a React frontend, Node.js/Express backend, PostgreSQL database, and integrates with Square for payments and Cloudinary for image storage.

---

## Technology Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Payment**: Square Web SDK
- **Deployment**: Netlify
- **URL**: https://greenacreslandinvestments.com

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Authentication**: JWT + bcrypt
- **Payment Processing**: Square API (Sandbox mode)
- **Image Storage**: Cloudinary
- **Deployment**: Railway
- **API URL**: https://green-acres-land-investments-production.up.railway.app

### Database
- **System**: PostgreSQL
- **Host**: Supabase
- **ORM**: None (direct pg pool queries)

---

## Project Structure
```
C:\Projects\GreenAcres\
├── client/                          # React frontend
│   ├── public/
│   │   └── green-acres-logo-*.png   # Logo files
│   ├── src/
│   │   ├── api.js                   # API integration layer
│   │   ├── index.css                # Global styles
│   │   ├── context/
│   │   │   └── AuthContext.js       # Authentication state
│   │   ├── pages/
│   │   │   ├── Home.js              # Landing page
│   │   │   ├── Properties.js        # Property listings (Cloudinary integrated)
│   │   │   ├── PropertyDetail.js    # Property detail + purchase (Cloudinary integrated)
│   │   │   ├── Login.js             # Customer login
│   │   │   ├── Register.js          # Customer registration (reCAPTCHA)
│   │   │   ├── Dashboard.js         # Customer dashboard
│   │   │   ├── LoanDetail.js        # Loan details + payments
│   │   │   ├── PaymentHistory.js    # Payment history
│   │   │   ├── SoldProperties.js    # Showcase sold properties
│   │   │   ├── AccountSettings.js   # Customer profile settings
│   │   │   ├── AdminLogin.js        # Admin authentication
│   │   │   ├── AdminDashboard.js    # Admin overview
│   │   │   ├── PropertyManagement.js # Admin property CRUD (Cloudinary upload)
│   │   │   ├── CustomerManagement.js # Admin customer view
│   │   │   ├── AdminLoans.js        # Admin loan management
│   │   │   ├── PaymentTracking.js   # Admin payment view
│   │   │   ├── AdminReports.js      # Financial reports
│   │   │   ├── TaxSummary.js        # CPA tax report
│   │   │   ├── DefaultedLoansReport.js # Default tracking
│   │   │   └── StateManagement.js   # Manage available states
│   │   └── App.js                   # Main app component
│   ├── package.json
│   └── .env                         # Frontend environment variables
│
├── server/                          # Node.js backend
│   ├── server.js                    # Main Express app (Cloudinary configured)
│   ├── database.js                  # PostgreSQL connection
│   ├── contract-template.txt        # Contract for Deed template
│   ├── package.json
│   └── .env                         # Backend environment variables
│
├── .git/                            # Git repository
├── .gitignore
└── PROJECT-SUMMARY.md               # This file
```

---

## Database Schema

### Core Tables

#### users
```sql
id SERIAL PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
password TEXT NOT NULL
first_name VARCHAR(100)
last_name VARCHAR(100)
phone VARCHAR(20)
mailing_address TEXT
mailing_city VARCHAR(100)
mailing_state VARCHAR(2)
mailing_zip VARCHAR(10)
created_at TIMESTAMP DEFAULT NOW()
```

#### admin_users
```sql
id SERIAL PRIMARY KEY
email VARCHAR(255) UNIQUE NOT NULL
password TEXT NOT NULL
first_name VARCHAR(100)
last_name VARCHAR(100)
role VARCHAR(50) DEFAULT 'admin'
tax_withholding_rate NUMERIC(5,2) DEFAULT 30.00
created_at TIMESTAMP DEFAULT NOW()
```

#### states
```sql
id SERIAL PRIMARY KEY
name VARCHAR(100) NOT NULL
abbreviation VARCHAR(2) NOT NULL
is_active BOOLEAN DEFAULT FALSE
coming_soon BOOLEAN DEFAULT FALSE
sort_order INTEGER DEFAULT 0
```

#### properties
```sql
id SERIAL PRIMARY KEY
title VARCHAR(255) NOT NULL
description TEXT
location VARCHAR(255)
state VARCHAR(100)
county VARCHAR(100)
acres NUMERIC(10,2)
price NUMERIC(10,2)
acquisition_cost NUMERIC(10,2)
apn VARCHAR(100)
coordinates TEXT (JSON string with ne_corner, se_corner, sw_corner, nw_corner, center)
legal_description TEXT
status VARCHAR(50) DEFAULT 'available'
  -- Values: available, coming_soon, pending, under_contract, sold
annual_tax_amount NUMERIC(10,2)
tax_payment_1_date DATE
tax_payment_1_amount NUMERIC(10,2)
tax_payment_2_date DATE
tax_payment_2_amount NUMERIC(10,2)
tax_notes TEXT
monthly_hoa_fee NUMERIC(10,2)
hoa_name VARCHAR(255)
hoa_contact VARCHAR(255)
hoa_notes TEXT
property_covenants TEXT
created_at TIMESTAMP DEFAULT NOW()
```

#### property_images ⭐ UPDATED
```sql
id SERIAL PRIMARY KEY
property_id INTEGER REFERENCES properties(id)
cloudinary_public_id VARCHAR(255)  -- NEW: Cloudinary ID for deletion
url TEXT NOT NULL                   -- NEW: Full Cloudinary URL
caption TEXT
display_order INTEGER DEFAULT 0
is_featured BOOLEAN DEFAULT FALSE   -- NEW: Mark featured image
created_at TIMESTAMP DEFAULT NOW()
```

#### loans
```sql
id SERIAL PRIMARY KEY
user_id INTEGER REFERENCES users(id)
property_id INTEGER REFERENCES properties(id)
purchase_price NUMERIC(10,2)
down_payment NUMERIC(10,2)
processing_fee NUMERIC(10,2) DEFAULT 99
loan_amount NUMERIC(10,2)
interest_rate NUMERIC(5,2)
term_months INTEGER
monthly_payment NUMERIC(10,2)
total_amount NUMERIC(10,2)
balance_remaining NUMERIC(10,2)
next_payment_date DATE
payment_due_day INTEGER DEFAULT 1  -- 1 or 15
status VARCHAR(50) DEFAULT 'active'
  -- Values: active, paid_off, defaulted
alerts_disabled BOOLEAN DEFAULT FALSE
default_date DATE
recovery_costs NUMERIC(10,2)
net_recovery NUMERIC(10,2)
default_notes TEXT
notice_sent_date DATE
notice_tracking_number VARCHAR(100)
notice_postal_cost NUMERIC(10,2)
notice_notes TEXT
cure_deadline_date DATE
late_fee_amount NUMERIC(10,2) DEFAULT 75
deed_type VARCHAR(100) DEFAULT 'Special Warranty Deed'
deed_name VARCHAR(255)
deed_mailing_address TEXT
created_at TIMESTAMP DEFAULT NOW()
```

#### payments
```sql
id SERIAL PRIMARY KEY
loan_id INTEGER REFERENCES loans(id)
user_id INTEGER REFERENCES users(id)
amount NUMERIC(10,2)
payment_type VARCHAR(50)
  -- Values: down_payment, monthly_payment
payment_method VARCHAR(50) DEFAULT 'square'
square_payment_id VARCHAR(255)
status VARCHAR(50) DEFAULT 'completed'
payment_date TIMESTAMP DEFAULT NOW()
-- Payment breakdown fields
loan_payment_amount NUMERIC(10,2)
tax_amount NUMERIC(10,2)
hoa_amount NUMERIC(10,2)
late_fee_amount NUMERIC(10,2)
notice_fee_amount NUMERIC(10,2)
postal_fee_amount NUMERIC(10,2)
square_processing_fee NUMERIC(10,2)
convenience_fee NUMERIC(10,2)
principal_amount NUMERIC(10,2)
interest_amount NUMERIC(10,2)
```

#### contracts
```sql
id SERIAL PRIMARY KEY
loan_id INTEGER REFERENCES loans(id)
contract_text TEXT
status VARCHAR(50) DEFAULT 'pending'
  -- Values: pending, customer_signed, fully_signed
customer_signature VARCHAR(255)
customer_signed_date TIMESTAMP
customer_ip_address VARCHAR(100)
customer_user_agent TEXT
admin_signature VARCHAR(255)
admin_signed_date TIMESTAMP
admin_ip_address VARCHAR(100)
created_at TIMESTAMP DEFAULT NOW()
```

#### selling_expenses
```sql
id SERIAL PRIMARY KEY
property_id INTEGER REFERENCES properties(id)
expense_date DATE NOT NULL
category VARCHAR(100)
  -- Values: Postal/Mailing, Deed Transfer, Legal Fees, Marketing, Property Cleanup, Travel, Miscellaneous
description TEXT
amount NUMERIC(10,2) NOT NULL
created_at TIMESTAMP DEFAULT NOW()
```

#### property_tax_payments
```sql
id SERIAL PRIMARY KEY
property_id INTEGER REFERENCES properties(id)
payment_date DATE NOT NULL
amount NUMERIC(10,2) NOT NULL
tax_year INTEGER NOT NULL
payment_method VARCHAR(50)
check_number VARCHAR(100)
notes TEXT
created_at TIMESTAMP DEFAULT NOW()
```

#### loan_notices
```sql
id SERIAL PRIMARY KEY
loan_id INTEGER REFERENCES loans(id)
notice_type VARCHAR(50)
  -- Values: default_cure, final_notice
notice_date DATE NOT NULL
postal_method VARCHAR(100)
postal_cost NUMERIC(10,2)
tracking_number VARCHAR(255)
notice_fee NUMERIC(10,2) DEFAULT 75
notes TEXT
created_at TIMESTAMP DEFAULT NOW()
```

---

## Environment Variables

### Frontend (.env in client/)
```
REACT_APP_API_URL=https://green-acres-land-investments-production.up.railway.app/api
REACT_APP_SQUARE_APPLICATION_ID=[Square App ID]
REACT_APP_SQUARE_LOCATION_ID=[Square Location ID]
REACT_APP_SQUARE_ENVIRONMENT=sandbox
REACT_APP_RECAPTCHA_SITE_KEY=[reCAPTCHA Site Key]
```

### Backend (.env in server/ and Railway)
```
DATABASE_URL=[Supabase PostgreSQL URL]
JWT_SECRET=[Random secret string]
SQUARE_ACCESS_TOKEN=[Square Sandbox Access Token]
SQUARE_LOCATION_ID=[Square Location ID]
SQUARE_ENVIRONMENT=sandbox
RECAPTCHA_SECRET_KEY=[reCAPTCHA Secret Key]
CLOUDINARY_CLOUD_NAME=dxd4ef2tc
CLOUDINARY_API_KEY=[Cloudinary API Key]
CLOUDINARY_API_SECRET=[Cloudinary API Secret]
PORT=5000
```

---

## Key Features Implemented

### Customer Features
✅ Property browsing with state filtering
✅ Property detail view with GPS coordinates
✅ Interactive financing calculator
✅ Owner financing with 5 payment tiers ($99 down to 50% down)
✅ Square payment integration (Sandbox mode)
✅ Loan dashboard with payment tracking
✅ Payment history with detailed breakdowns
✅ Contract generation and e-signing
✅ Account settings (contact info, deed information per property)
✅ reCAPTCHA on registration

### Admin Features
✅ Admin authentication (separate from customers)
✅ Property CRUD operations
✅ **Cloudinary image upload (direct file upload, max 10 per property)**
✅ **Image management (captions, featured images, deletion)**
✅ Coming Soon property status
✅ Customer management view
✅ Loan management and tracking
✅ Payment due day selection (1st or 15th)
✅ Late fee tracking (7-day grace period, $75 fee)
✅ Default/cure notice system with tracking
✅ Deed type selection (Special Warranty or Quitclaim)
✅ Payment tracking and reporting
✅ Financial reports (revenue, tax escrow, HOA)
✅ Tax summary for CPA (monthly/quarterly/annual)
✅ Defaulted loans report
✅ Selling expense tracking
✅ Property tax payment recording
✅ Tax escrow reconciliation
✅ State management (add/edit available states)
✅ Configurable tax withholding rate

### Business Logic
✅ 5 financing tiers: $99 (18% APR), 20% (12% APR), 25%/35%/50% (8% APR)
✅ $99 processing fee on all purchases
✅ $50 minimum monthly payment
✅ 1-5 year loan terms
✅ Automatic interest/principal calculation
✅ Property tax escrowed in monthly payment
✅ HOA fees escrowed in monthly payment
✅ Payment breakdown (principal, interest, tax, HOA, fees)
✅ Square processing fee + $5 convenience fee
✅ Notice fees ($75 + postal costs)
✅ Contract for Deed generation with mail-merge
✅ Property covenants included in contracts

---

## Cloudinary Integration ⭐ NEW

### Implementation Details
- **Folder**: green-acres-properties
- **Upload**: Admin can upload images directly from computer
- **Storage**: Images stored with `cloudinary_public_id` for management
- **Display**: All images referenced by Cloudinary URL
- **Deletion**: Removes image from both Cloudinary and database
- **Features**: Captions, display order, featured image marking
- **Limit**: Maximum 10 images per property
- **Placeholder**: Custom "Images Coming Soon" image for properties without photos

### Endpoints
```
POST   /api/admin/properties/:id/images/upload  (multipart/form-data with 'image' field)
GET    /api/properties/:propertyId/images
PATCH  /api/admin/properties/:propertyId/images/:imageId (caption, order, featured)
PATCH  /api/admin/properties/:id/images/reorder
DELETE /api/admin/properties/:propertyId/images/:imageId (deletes from Cloudinary too)
```

---

## API Endpoints

### Authentication
```
POST   /api/register           (Customer registration with reCAPTCHA)
POST   /api/login              (Customer login)
POST   /api/admin/login        (Admin login)
```

### Properties (Public)
```
GET    /api/properties         (Available + Coming Soon)
GET    /api/properties/sold    (Sold/Under Contract showcase)
GET    /api/properties/:id     (Single property detail)
GET    /api/properties/:propertyId/images  (Property images)
GET    /api/states             (Active + Coming Soon states)
```

### Loans (Customer - Auth Required)
```
GET    /api/loans                              (User's loans)
GET    /api/loans/:id                          (Single loan detail)
GET    /api/loans/:id/payments                 (Payment history)
GET    /api/loans/:id/payment-breakdown        (Current payment breakdown)
GET    /api/loans/:id/contract                 (View contract)
POST   /api/loans                              (Create loan = Purchase)
POST   /api/payments                           (Make payment)
POST   /api/loans/:id/sign-contract            (Customer signs)
GET    /api/loans/:loanId/download-contract    (Download signed contract)
```

### User Account (Customer - Auth Required)
```
GET    /api/user/profile                       (Get profile)
PATCH  /api/user/profile                       (Update contact info)
GET    /api/user/deed-info                     (Get deed info for all loans)
PATCH  /api/user/loans/:loanId/deed-info       (Update deed info per loan)
```

### Admin - Properties
```
GET    /api/admin/properties                   (All properties)
POST   /api/admin/properties                   (Create property)
PUT    /api/admin/properties/:id               (Update property)
PATCH  /api/admin/properties/:id/status        (Update status only)
DELETE /api/admin/properties/:id               (Delete property)
POST   /api/admin/properties/:id/images/upload (Upload image - Cloudinary)
PATCH  /api/admin/properties/:propertyId/images/:imageId (Update image)
DELETE /api/admin/properties/:propertyId/images/:imageId (Delete image)
```

### Admin - Customers
```
GET    /api/admin/customers                    (All customers with loan summaries)
GET    /api/admin/customers/:id                (Single customer detail)
```

### Admin - Loans
```
GET    /api/admin/loans                        (All loans across customers)
PATCH  /api/admin/loans/:id/toggle-alert       (Toggle alerts on/off)
PATCH  /api/admin/loans/:id/payment-due-day    (Change payment due day)
PATCH  /api/admin/loans/:id/default            (Mark as defaulted)
PATCH  /api/admin/loans/:id/deed-type          (Update deed type)
POST   /api/admin/loans/:id/send-notice        (Record notice sent)
POST   /api/admin/loans/:id/waive-late-fee     (Waive late fee)
POST   /api/admin/loans/:id/generate-contract  (Generate contract)
POST   /api/admin/loans/:id/sign-contract      (Admin signs contract)
DELETE /api/admin/loans/:id/contract           (Delete contract)
```

### Admin - Expenses
```
GET    /api/admin/properties/:propertyId/expenses       (Property expenses)
POST   /api/admin/properties/:propertyId/expenses       (Add expense)
DELETE /api/admin/expenses/:id                          (Delete expense)
```

### Admin - Tax Payments
```
GET    /api/admin/properties/:propertyId/tax-payments   (Property tax payments)
POST   /api/admin/properties/:propertyId/pay-taxes      (Record tax payment)
DELETE /api/admin/tax-payments/:id                      (Delete tax payment)
```

### Admin - Reports
```
GET    /api/admin/stats                        (Dashboard statistics)
GET    /api/admin/payments                     (All payments)
GET    /api/admin/reports/financial            (Financial reports)
GET    /api/admin/reports/outstanding          (Outstanding balances)
GET    /api/admin/reports/tax-summary          (Tax summary for CPA)
```

### Admin - States
```
GET    /api/admin/states                       (All states)
POST   /api/admin/states                       (Create state)
PATCH  /api/admin/states/:id                   (Update state)
DELETE /api/admin/states/:id                   (Delete state)
```

### Admin - Settings
```
GET    /api/admin/tax-rate                     (Get tax withholding rate)
PATCH  /api/admin/tax-rate                     (Update tax rate)
```

---

## Payment Flow

1. Customer selects property and financing terms
2. Customer enters billing info and payment details
3. Customer enters deed information (name and mailing address)
4. Square tokenizes card (client-side)
5. Backend creates loan record
6. Backend processes down payment via Square API
7. Backend records payment in database
8. Backend updates property status to "pending"
9. Customer redirected to dashboard

### Monthly Payment Flow
1. System calculates payment breakdown:
   - Loan payment (principal + interest)
   - Monthly tax escrow (annual_tax / 12)
   - Monthly HOA fee
   - Late fee (if > 7 days overdue)
   - Notice fee + postal cost (if sent)
   - Subtotal
   - Square processing fee (2.9% + $0.30)
   - $5 convenience fee
   - **Total due**
2. Customer makes payment via Square
3. Payment allocated to: principal, interest, tax, HOA, fees
4. Tax/HOA amounts tracked for reconciliation
5. Next payment date set to 30 days out

---

## Contract System

### Contract Generation
- Admin triggers contract generation for a loan
- Backend reads `contract-template.txt`
- Mail-merge replaces placeholders with actual data
- Stores generated contract in `contracts` table with status "pending"

### Contract Signing
1. Customer views contract and types their name
2. System records: signature, date, IP, user agent
3. Status changes to "customer_signed"
4. Admin views and types their name
5. System records: signature, date, IP
6. Status changes to "fully_signed"

### Contract Merge Fields
```
{{CONTRACT_DATE}}, {{PURCHASER_NAME}}, {{PURCHASER_ADDRESS}},
{{COUNTY}}, {{STATE}}, {{PROPERTY_DESCRIPTION}}, {{ACRES}},
{{APN}}, {{PURCHASE_PRICE}}, {{PURCHASE_PRICE_WORDS}},
{{DOWN_PAYMENT}}, {{BALANCE}}, {{BALANCE_WORDS}},
{{INTEREST_RATE}}, {{MONTHLY_PAYMENT}}, {{MONTHLY_PAYMENT_WORDS}},
{{FIRST_PAYMENT_DATE}}, {{NUMBER_OF_PAYMENTS}},
{{PROPERTY_COVENANTS}}, {{DEED_TYPE}}
```

---

## Tax Escrow System

### How It Works
- Properties have `annual_tax_amount` field
- Monthly payment includes 1/12 of annual tax
- Customer payments tracked with `tax_amount` field
- Admin records actual tax payments to county via "Pay Taxes" button
- System tracks: tax collected vs. tax paid
- Reports show escrow balance per property

### Reconciliation
- Financial Reports show tax escrow balances
- Tax Summary shows tax collected in revenue
- Property tax payments tracked separately
- System calculates: collected - paid = escrow balance

---

## Deployment

### Frontend (Netlify)
1. Push to GitHub main branch
2. Netlify auto-deploys from `client/` directory
3. Build command: `npm run build`
4. Publish directory: `client/build`
5. Environment variables set in Netlify dashboard

### Backend (Railway)
1. Push to GitHub main branch
2. Railway auto-deploys from `server/` directory
3. Start command: `node server.js`
4. Environment variables set in Railway dashboard
5. Monitor logs in Railway dashboard

### Database (Supabase)
- Hosted PostgreSQL
- SQL Editor for manual queries/migrations
- Connection string in `DATABASE_URL`

---

## Development Workflow

### Making Changes
```bash
cd C:\Projects\GreenAcres

# Edit files in VS Code or Notepad

# Test locally (optional)
cd client
npm start  # Frontend on localhost:3000

cd ../server
node server.js  # Backend on localhost:5000

# Commit and deploy
git add .
git commit -m "Description of changes"
git push origin main

# Monitor deployments
# - Railway logs for backend
# - Netlify build logs for frontend

# Always hard refresh after deployment (Ctrl+Shift+R)
```

### Database Migrations
```bash
# Run SQL in Supabase SQL Editor
# Example: Add column
ALTER TABLE table_name ADD COLUMN column_name TYPE;

# Always test queries before running
# Backup critical data before major changes
```

---

## Current Status

### Production
- ✅ Frontend deployed and accessible
- ✅ Backend deployed and running
- ✅ Database connected and operational
- ✅ Square payments in Sandbox mode
- ✅ Cloudinary image storage active
- ⚠️ Square needs production credentials for live payments

### Known Issues
None - system is working cleanly

### Planned Enhancements
1. Drag-and-drop image reordering in admin
2. Featured image priority on public site
3. Mobile responsive table on Property Management page
4. Cloudinary image transformations for thumbnails
5. Move Square from Sandbox to Production mode

---

## Support & Resources

### External Services
- **Supabase**: https://supabase.com/dashboard
- **Railway**: https://railway.app/dashboard
- **Netlify**: https://app.netlify.com/
- **Square Dashboard**: https://developer.squareup.com/apps
- **Cloudinary Dashboard**: https://cloudinary.com/console
- **GitHub**: https://github.com/[your-repo]

### Documentation
- PROJECT-SUMMARY.md (this file)
- QUICKSTART.md (quick reference)
- ADMIN-GUIDE.md (admin features)
- UI-IMPROVEMENT-PLAN.md (future UI enhancements)
- GREEN-ACRES-PROJECT-GUIDE.md (comprehensive guide)
- PAYMENT-SYSTEM-GUIDE.md (payment details)

---

**Last Major Update**: Cloudinary integration completed November 11, 2025
**System Status**: Fully operational with clean, maintainable code