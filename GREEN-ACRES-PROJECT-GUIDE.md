# 🌿 Green Acres Land Investments - Complete Project Guide

**Last Updated:** November 21, 2025  
**Version:** 2.1.0  
**Status:** Production Ready

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Current Status](#current-status)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Pages](#frontend-pages)
7. [Admin Dashboard](#admin-dashboard)
8. [Development Workflow](#development-workflow)
9. [Deployment Guide](#deployment-guide)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

### Business Model
Green Acres Land Investments, LLC purchases raw land at auctions and resells it with flexible owner financing. The platform handles the complete customer lifecycle from property browsing through loan management and payment processing.

### Tagline
**"Your Land. Your Terms."** - Making land ownership accessible through flexible financing without credit checks.

### Financing Options
- **$99 Down Special** - 18% APR (Most Popular)
- **20% Down** - 12% APR
- **50%+ Down** - 8% APR
- Terms: 1-5 years
- $50 minimum monthly payment
- Payment due day: Customer chooses 1st or 15th
- Properties: $2,000 - $10,000 range

### Target States
- Arizona (Primary)
- Colorado
- Arkansas

---

## ✅ Current Status

### Production Features
- ✅ Complete loan origination and payment system
- ✅ Tax escrow and HOA fee tracking with reconciliation
- ✅ Comprehensive financial reporting with PDF export
- ✅ Mobile-responsive admin and customer interfaces
- ✅ Cloudinary image management with drag-and-drop uploads
- ✅ Performance dashboard with actionable insights
- ✅ Contract generation with e-signature system
- ✅ eBay auction winner submission and management
- ✅ Property sources tracking (auction sites, credentials)
- ✅ Auction calendar with urgency indicators
- ✅ Multi-state property management
- ✅ Customer account settings with per-loan deed information
- ✅ Admin loan import system for existing portfolios
- ✅ Custom loan creator for special deals

### In Development
- ⚠️ Email notification system (planned)
- ⚠️ Automated payment reminders
- ⚠️ SMS notifications for urgent items

### Production Readiness
- Square API: Production mode (live payments)
- Database: PostgreSQL via Supabase (production)
- Frontend: Deployed on Netlify
- Backend: Deployed on Railway
- **Status:** Fully operational, processing real transactions

---

## 🏗️ System Architecture

### Technology Stack

**Frontend:**
- React 18.2
- React Router 6
- Axios for API calls
- Square Web SDK for payments
- Cloudinary SDK for image uploads

**Backend:**
- Node.js 18+
- Express 4
- PostgreSQL (via Supabase)
- JWT authentication
- bcryptjs for password hashing
- Square API for payment processing
- PDFKit for report generation

**Infrastructure:**
- Frontend: Netlify (auto-deploy from GitHub)
- Backend: Railway (auto-deploy from GitHub)
- Database: Supabase PostgreSQL
- Image Storage: Cloudinary
- Payment Processing: Square (PCI compliant)

### Project Structure
```
GreenAcres/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # All page components
│   │   ├── App.js
│   │   ├── index.css       # Global styles
│   │   └── index.js
│   ├── .env                # Frontend environment variables
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── routes/             # API route modules
│   │   ├── ebay-listing-routes.js
│   │   ├── propertySourcesRoutes.js
│   │   └── auctionCalendarRoutes.js
│   ├── database.js         # PostgreSQL connection
│   ├── server.js           # Main API server
│   ├── .env                # Backend environment variables
│   └── package.json
│
└── Documentation/
    ├── GREEN-ACRES-PROJECT-GUIDE.md  # This file
    ├── PROJECT-SUMMARY.md
    ├── ADMIN-GUIDE.md
    ├── PROPERTY-SOURCES-AUCTION-CALENDAR.md
    └── PAYMENT-SYSTEM-GUIDE.md
```

---

## 🗄️ Database Schema

### Core Tables

**users**
- id, email, password (hashed)
- first_name, last_name, phone
- mailing_address, mailing_city, mailing_state, mailing_zip
- created_at

**properties**
- id, title, description, location, state, county
- acres, price, acquisition_cost, status
- apn, coordinates, legal_description
- annual_tax_amount, tax_payment_1_date, tax_payment_1_amount
- tax_payment_2_date, tax_payment_2_amount, tax_notes
- monthly_hoa_fee, hoa_name, hoa_contact, hoa_notes
- property_covenants
- created_at, updated_at

**loans**
- id, user_id, property_id
- purchase_price, down_payment, processing_fee
- loan_amount, interest_rate, term_months
- monthly_payment, total_amount, balance_remaining
- status (active, paid_off, defaulted, archived)
- next_payment_date, payment_due_day
- deed_name, deed_mailing_address, deed_type
- late_fee_amount, notice_sent_date, notice_tracking_number
- notice_postal_cost, notice_notes, cure_deadline_date
- default_date, recovery_costs, net_recovery, default_notes
- alerts_disabled
- created_at, updated_at

**payments**
- id, loan_id, user_id
- amount, payment_type (down_payment, processing_fee, monthly_payment)
- payment_method, square_payment_id, status
- payment_date
- loan_payment_amount, principal_amount, interest_amount
- tax_amount, hoa_amount
- late_fee_amount, notice_fee_amount, postal_fee_amount
- square_processing_fee, convenience_fee
- created_at

**property_images**
- id, property_id
- cloudinary_public_id, url
- caption, display_order, is_featured
- created_at

**selling_expenses**
- id, property_id
- expense_date, category, description, amount
- created_at

**property_tax_payments**
- id, property_id
- payment_date, amount, tax_year
- payment_method, check_number, notes
- created_at

**contracts**
- id, loan_id
- contract_text, status
- admin_signature, admin_signed_date, admin_ip_address
- customer_signature, customer_signed_date, customer_ip_address
- customer_user_agent
- created_at, updated_at

**states**
- id, name, abbreviation
- is_active, coming_soon, sort_order
- created_at, updated_at

**admin_users**
- id, email, password (hashed)
- first_name, last_name, role
- tax_withholding_rate
- created_at

**ebay_winner_submissions**
- id, ebay_username, email, phone
- first_name, last_name
- item_number, item_title, purchase_price
- submission_date, status, admin_notes
- user_id (linked after conversion)
- created_at, updated_at

**property_sources**
- id, name, url
- username, password_encrypted
- states, counties, notes, contact_info
- is_active, last_accessed
- created_at, updated_at

**auction_calendar**
- id, auction_date, auction_name, url
- property_address, description, notes
- is_completed
- created_at, updated_at

---

## 🔌 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://[railway-url]/api`

### Authentication

**Customer Auth:**
```javascript
POST /api/register
POST /api/login
// Returns JWT token, store in localStorage as 'token'
```

**Admin Auth:**
```javascript
POST /api/admin/login
// Returns JWT token, store in localStorage as 'adminToken'
```

**Protected Routes:**
- Customer: Send `Authorization: Bearer {token}` header
- Admin: Send `Authorization: Bearer {adminToken}` header

### Key Endpoints

**Properties:**
```javascript
GET /api/properties                    // Public, available properties
GET /api/properties/sold               // Public, sold properties showcase
GET /api/properties/:id                // Public, single property
GET /api/properties/:id/images         // Public, property images
GET /api/admin/properties              // Admin, all properties
POST /api/admin/properties             // Admin, create property
PUT /api/admin/properties/:id          // Admin, update property
DELETE /api/admin/properties/:id       // Admin, delete property
```

**Loans:**
```javascript
GET /api/loans                         // Customer, their loans
GET /api/loans/:id                     // Customer, loan detail
POST /api/loans                        // Customer, purchase property
GET /api/loans/:id/payments            // Customer, payment history
GET /api/loans/:id/payment-breakdown   // Customer, current payment breakdown
GET /api/admin/loans                   // Admin, all loans
POST /api/admin/loans/import           // Admin, import existing loan
POST /api/admin/loans/create-custom    // Admin, create custom deal
DELETE /api/admin/loans/:id            // Admin, delete loan
```

**Payments:**
```javascript
POST /api/payments                     // Customer, make payment
GET /api/admin/payments                // Admin, all payments
POST /api/admin/loans/:id/record-payment  // Admin, manual payment entry
```

**Reports:**
```javascript
GET /api/admin/reports/financial       // Admin, comprehensive financial data
GET /api/admin/reports/outstanding     // Admin, outstanding balances
GET /api/admin/reports/tax-summary     // Admin, tax summary by year
GET /api/admin/reports/export          // Admin, PDF export
```

**eBay System:**
```javascript
POST /api/ebay/submit-winner           // Public, winner submission form
GET /api/admin/ebay/submissions        // Admin, all submissions
PATCH /api/admin/ebay/submissions/:id  // Admin, update status
POST /api/admin/ebay/submissions/:id/convert  // Admin, convert to customer
POST /api/admin/ebay/generate-listing  // Admin, generate listing copy
```

**Property Sources:**
```javascript
GET /api/admin/property-sources        // Admin, list sources
POST /api/admin/property-sources       // Admin, create source
PATCH /api/admin/property-sources/:id  // Admin, update source
PATCH /api/admin/property-sources/:id/access  // Admin, track access
DELETE /api/admin/property-sources/:id // Admin, delete source
```

**Auction Calendar:**
```javascript
GET /api/admin/auction-calendar        // Admin, list auctions
POST /api/admin/auction-calendar       // Admin, create auction
PATCH /api/admin/auction-calendar/:id  // Admin, update auction
PATCH /api/admin/auction-calendar/:id/complete  // Admin, mark completed
DELETE /api/admin/auction-calendar/:id // Admin, delete auction
```

### Database Query Pattern
```javascript
// PostgreSQL with Supabase
const result = await db.pool.query(
  'SELECT * FROM loans WHERE user_id = $1',
  [userId]
);
const loans = result.rows;
```

**CRITICAL:** Always use `$1, $2, $3` placeholders (NOT `?` like SQLite)

---

## 🖥️ Frontend Pages

### Public Pages
- `/` - Home (landing page)
- `/properties` - Browse available properties
- `/properties/:id` - Property detail with financing calculator
- `/sold-properties` - Showcase of sold properties
- `/login` - Customer login
- `/register` - Customer registration (reCAPTCHA protected)
- `/ebay-winner` - eBay auction winner submission form
- `/about` - About Us
- `/contact` - Contact Us
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

### Customer Dashboard (Protected)
- `/dashboard` - Customer overview with active loans
- `/loans/:id` - Loan detail with payment form
- `/loans/:id/payments` - Payment history
- `/account-settings` - Profile, mailing address, deed information

### Admin Pages (Protected)
- `/admin/login` - Admin login
- `/admin/dashboard` - Main admin dashboard (12 cards)
- `/admin/properties` - Property management with image uploads
- `/admin/customers` - Customer management
- `/admin/loans` - All loans overview
- `/admin/loans/import` - Import existing loans with payment history
- `/admin/loans/create` - Create custom loans for special deals
- `/admin/loans/defaulted` - Defaulted loans report
- `/admin/payments` - Payment tracking across all customers
- `/admin/reports` - Financial reports with PDF export
- `/admin/tax-summary` - Annual tax summary for CPA
- `/admin/states` - Multi-state management
- `/admin/ebay-listing-generator` - Generate eBay listing copy
- `/admin/ebay-submissions` - Manage auction winner submissions
- `/admin/property-sources` - Track auction sites and credentials
- `/admin/auction-calendar` - Upcoming auction dates

---

## 🎛️ Admin Dashboard

### Layout
12-card grid (4 rows × 3 columns) on desktop, stacks on mobile

### Dashboard Cards

**Row 1: Core Management**
1. 🏠 Property Management - Add/edit properties, upload images
2. 👥 Customer Management - View all customers, reset passwords
3. 📋 Active Loans - Manage all loans, payment tracking

**Row 2: Financial**
4. 💳 Payment Tracking - View all payments, transaction history
5. 📊 Financial Reports - Revenue, tax escrow, HOA tracking
6. 💼 Income Tax Summary - Annual/quarterly tax reports for CPA

**Row 3: Configuration**
7. 🗺️ State Management - Manage active states, coming soon states
8. 📦 eBay Listing Generator - Generate professional listings
9. 🏆 eBay Auction Winners - Convert auction winners to customers

**Row 4: Tools**
10. 🗂️ Property Sources - Track auction sites, login credentials
11. 📅 Auction Calendar - Upcoming auction dates with reminders
12. 🔧 Future Feature - Placeholder for expansion

### Quick Actions
- Create/edit properties with drag-and-drop image uploads
- Import existing loans with full payment history
- Create custom loans for loyal customers
- Generate and send contracts for e-signature
- Record manual payments (cash, check, Venmo)
- Mark loans as defaulted with recovery tracking
- Export financial reports to PDF

---

## 💻 Development Workflow

### Local Development Setup

**Prerequisites:**
- Node.js 18+
- PostgreSQL access (Supabase)
- Square Developer account
- Cloudinary account

**Environment Variables:**

`server/.env`:
```
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
SQUARE_ACCESS_TOKEN=your_square_token
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

`client/.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SQUARE_APPLICATION_ID=your_app_id
REACT_APP_SQUARE_LOCATION_ID=your_location_id
REACT_APP_RECAPTCHA_SITE_KEY=your_site_key
```

**Start Development:**
```bash
# Terminal 1 - Backend
cd server
npm install
npm start

# Terminal 2 - Frontend
cd client
npm install
npm start

# Terminal 3 - Commands
cd C:\Projects\GreenAcres
# Use for git, file operations, etc.
```

### Code Conventions

**CRITICAL RULES:**

1. **Database Queries:**
   - Use `db.pool.query()` with `$1, $2` placeholders
   - Always use `result.rows` to access data
   - Field names: `balance_remaining`, `loan_amount`, `purchase_price`

2. **File Editing:**
   - Use Notepad for critical files (VS Code caches)
   - Verify changes with `type filename | find "text"`
   - Always test after editing

3. **Currency Formatting:**
   - Always use `.toFixed(2)` for decimal places
   - Use `.toLocaleString()` for comma separators
   - Example: `parseFloat(amount).toFixed(2)`

4. **Mobile Responsiveness:**
   - Use `.desktop-only` class for tables
   - Use `.mobile-only` class for cards
   - Test on 375px, 768px, 1024px widths

5. **Component Structure:**
   - Keep inline styles minimal
   - Use CSS classes from `index.css`
   - Follow existing page patterns

### Git Workflow
```bash
cd C:\Projects\GreenAcres
git add .
git commit -m "Description of changes"
git push origin main
```

**Deployments trigger automatically:**
- Netlify rebuilds frontend
- Railway rebuilds backend

---

## 🚀 Deployment Guide

### Frontend (Netlify)

**Setup:**
1. Connect GitHub repo
2. Build command: `npm run build`
3. Publish directory: `build`
4. Environment variables: Copy from `client/.env`

**Custom Domain:**
- greenacreslandinvestments.com
- Auto-SSL enabled

### Backend (Railway)

**Setup:**
1. Connect GitHub repo
2. Start command: `npm start`
3. Environment variables: Copy from `server/.env`
4. Enable IPv4 address for Supabase connection

**Monitoring:**
- Check Railway logs for errors
- Database queries logged to console

### Database (Supabase)

**Connection:**
- PostgreSQL 15
- Connection pooling enabled
- IPv4 address required (enabled in Railway)

**Backups:**
- Automatic daily backups
- Point-in-time recovery available

---

## 🔧 Troubleshooting

### Common Issues

**"Cannot find module" errors:**
- Check `node_modules` exists
- Run `npm install` in correct directory
- Verify import paths are correct

**Database connection fails:**
- Check Railway has IPv4 enabled
- Verify DATABASE_URL in `.env`
- Test connection in Railway logs

**Square payment errors:**
- Verify SQUARE_ENVIRONMENT setting
- Check if using correct token (sandbox vs production)
- Review Square dashboard for declined payments

**Images not uploading:**
- Check Cloudinary credentials
- Verify upload widget is initialized
- Check browser console for errors

**Session expired (403 errors):**
- Log out and log back in
- JWT token expires after 24 hours
- Check token in localStorage

**Mobile layout broken:**
- Hard refresh: Ctrl+Shift+R
- Check `.desktop-only` and `.mobile-only` classes
- Test in Chrome DevTools device mode

### Development Commands

**Check file contents:**
```bash
type server\server.js | find "text"
```

**Verify git status:**
```bash
git status
git log --oneline -5
```

**Check running processes:**
```bash
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

**Kill process on port:**
```bash
taskkill /PID <process_id> /F
```

---

## 📊 Performance Metrics

### Key Performance Indicators (Admin Dashboard)

- Total Properties
- Active Loans
- Total Customers
- Overdue Loans (7+ days)
- Loans in Default (notice sent)
- Revenue Last 30 Days (with trend)
- Collection Rate (on-time payments %)
- Upcoming Tax Deadlines (next 60 days)

### Financial Tracking

**Revenue Streams:**
- Down payments
- Processing fees (doc fees)
- Loan payments (principal + interest)
- Late fees
- Default cure notice fees
- Convenience fees ($5 per transaction)
- Postal fee reimbursements

**Pass-Through Items (Not Revenue):**
- Property taxes (held in escrow)
- HOA fees (collected and remitted)

**Expenses Tracked:**
- Property acquisition costs
- Square processing fees (2.9% + $0.30)
- Selling expenses (per property)
- Recovery costs (defaulted loans)
- Property tax payments (to counties)

---

## 🎨 Branding & Design

### Color Palette
```css
--forest-green: #2e7d32
--dark-forest: #1e4620
--sandy-gold: #f4a460
--muted-gold: #d4873e
--light-green: #f0f8f0
--border-color: #e0e0e0
```

### Typography
- Headings: Bold, professional
- Body: Clean, readable
- Buttons: Clear call-to-action

### Logo
- Pine trees in forest green
- Sandy gold accents
- Professional, outdoor aesthetic

---

## 📝 Notes & Best Practices

### For Developers

1. **Always read existing code first** - Don't reinvent patterns
2. **Test on mobile after every change** - Hard refresh (Ctrl+Shift+R)
3. **Commit frequently** - After each logical change
4. **Use exact field names** - `balance_remaining` not `balance`
5. **Follow established patterns** - Look at working pages

### For Business Operations

1. **Customer Due Diligence** - Always emphasize property research
2. **Transparent Pricing** - No hidden fees (competitive advantage)
3. **Documentation** - Waive doc fees for eBay customers
4. **Payment Due Days** - Let customers choose 1st or 15th
5. **Tax/HOA Tracking** - Reconcile monthly, pay on time

### Security Notes

- JWT tokens expire in 24 hours
- Passwords hashed with bcrypt (10 rounds)
- reCAPTCHA v3 on registration
- Admin routes protected with authenticateAdmin middleware
- No customer data stored in localStorage (only tokens)

---

## 🔮 Future Enhancements

### High Priority
- Email notification system (payment confirmations, reminders)
- Automated late payment reminders (7 days past due)
- SMS notifications for urgent items
- Token refresh mechanism (fix 403 errors)

### Medium Priority
- Bulk image upload for properties
- Calendar view for auction dates
- Email reminders for upcoming auctions
- Property source password encryption
- Contract template customization

### Nice to Have
- Customer portal mobile app
- Automated tax payment scheduling
- Integration with county tax portals
- Advanced analytics dashboard
- Referral program tracking

---

## 📞 Support & Resources

### Documentation Files
- **GREEN-ACRES-PROJECT-GUIDE.md** - This comprehensive guide
- **PROJECT-SUMMARY.md** - High-level business overview
- **ADMIN-GUIDE.md** - Step-by-step admin instructions
- **PROPERTY-SOURCES-AUCTION-CALENDAR.md** - Feature documentation
- **PAYMENT-SYSTEM-GUIDE.md** - Payment processing technical details

### External Resources
- [Square API Documentation](https://developer.squareup.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Built with ❤️ for Green Acres Land Investments, LLC**

Making land ownership simple and accessible! 🌿🏞️

*Last Updated: November 21, 2025*
*Version: 2.1.0*