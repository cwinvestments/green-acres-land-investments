# Green Acres Land Investments - Project Summary

## Project Overview
**Business:** Green Acres Land Investments, LLC  
**Tagline:** "Your Land. Your Terms."  
**Purpose:** Land investment business purchasing raw land at auctions and reselling with flexible owner financing

## Business Model
- **Target Properties:** $2,000-$10,000 raw land parcels
- **Financing Tiers:** 5 options from $99 down (18% APR) to 50% down (8% APR)
- **Terms:** 1-5 years with $50 minimum monthly payments
- **Coordinates:** Properties use GPS coordinate systems (raw land, no traditional addresses)
- **Expansion:** Planning multi-state expansion (Arizona, Colorado, Arkansas)

## Technology Stack
### Frontend
- **Framework:** React (Fully mobile-responsive ✅)
- **Hosting:** Netlify
- **Deployment:** Automatic from GitHub main branch
- **Responsive Design:** All pages optimized for mobile, tablet, and desktop

### Backend
- **Runtime:** Node.js with Express
- **Hosting:** Railway
- **Database:** PostgreSQL via Supabase
- **Payment Processing:** Square API (currently sandbox mode)
- **File Storage:** Cloudinary (for property images)

### Development Environment
- **Location:** C:\Projects\GreenAcres
- **Editor:** VS Code (with Notepad for critical edits due to caching issues)
- **Terminal:** Command Prompt (not PowerShell)
- **Version Control:** GitHub
- **Setup:** Four-monitor workstation

## Core Features - COMPLETED ✅

### Property Management
- ✅ Full CRUD for properties with multiple statuses (available, coming_soon, pending, sold)
- ✅ GPS coordinate system for raw land
- ✅ Legal descriptions and APN tracking
- ✅ Property covenant management
- ✅ Tax escrow tracking with dual payment dates
- ✅ HOA fee tracking (monthly + contact info)
- ✅ Acquisition cost tracking
- ✅ Selling expense tracking by category
- ✅ Property tax payment recording to counties
- ✅ State management system (active/coming soon states)
- ✅ **Property image management with Cloudinary:**
  - Direct file upload (drag-and-drop)
  - Image reordering
  - Captions
  - Delete functionality
  - Preview thumbnails
  - Featured image selection
  - Maximum 10 images per property

### Customer Portal
- ✅ User registration with reCAPTCHA v3
- ✅ Secure authentication (JWT tokens)
- ✅ Dashboard showing all active loans
- ✅ Payment history viewing
- ✅ **Account Settings page:**
  - Update contact information (phone, email)
  - Update mailing address (per user account)
  - View/edit deed information (per property/loan)
  - Separate deed name and mailing address fields for each loan
  - Change password (validates current password, requires 6+ characters)
- ✅ Contract viewing and signing
- ✅ Payment breakdown display (principal, interest, tax, HOA, fees)

### Loan Management
- ✅ Standard loan creation from property purchases
- ✅ **Import existing loans with complete payment history:**
  - Original contract date tracking
  - Payment history import (principal, interest, tax, HOA breakdown)
  - Tax payment history import
  - Current balance calculation
  - Proper loan_payment_amount field population
- ✅ **Custom loan creation:**
  - Flexible terms for special deals
  - Custom down payment, interest rate, term
  - Auto-calculated payment schedule
  - Processing fee customization
- ✅ Payment due day selection (1st or 15th)
- ✅ Balance tracking and payment application
- ✅ Late fee automation (7-day grace period, $75 fee)
- ✅ Notice system (default/cure notices with 14-day cure period)
- ✅ Default tracking with recovery costs
- ✅ Alert system with toggle (enable/disable per loan)
- ✅ Deed type selection (Special Warranty vs Quitclaim)

### Contract System
- ✅ **Dynamic contract generation from template:**
  - Mail merge with loan/property/customer data
  - Number-to-words conversion
  - Professional formatting
- ✅ **Amended and Restated Contracts:**
  - Automatic detection of imported loans with payment history
  - Shows original contract date
  - Displays number of payments made
  - Shows total principal paid to date
  - References remaining balance
  - Different language for new vs. imported loans
- ✅ Digital signature collection (admin + customer)
- ✅ IP address and timestamp logging
- ✅ Download signed contracts
- ✅ Customer mailing address integration
- ✅ Contract deletion and regeneration

### Payment Processing
- ✅ Square API integration (sandbox mode)
- ✅ **Comprehensive payment breakdown:**
  - Loan payment (principal + interest)
  - Tax escrow collection (annual ÷ 12)
  - HOA fees
  - Late fees (after 7-day grace)
  - Notice fees ($75 + postal costs)
  - Square processing fees (2.9% + $0.30)
  - Convenience fees ($5.00)
- ✅ **Manual payment recording:**
  - Cash, check, Venmo, Zelle, wire transfer
  - Full breakdown calculation
  - Transaction ID and notes tracking
  - Balance update automation
- ✅ Payment history with complete audit trail
- ✅ Balance recalculation after each payment
- ✅ Auto-advance next payment date (30 days)

### Admin Dashboard
- ✅ **Statistics overview:**
  - Total properties
  - Active loans
  - Total customers
  - Overdue loans (7+ days)
  - Loans in default (notice sent)
  - Revenue trends (30-day comparison)
  - Collection rate tracking
  - Upcoming tax deadlines (60-day view)
- ✅ **Customer management:**
  - View all customers with loan summaries
  - Reset customer passwords (generates 12-char temp password)
  - Delete customers (prevents if loans exist)
  - Fully mobile-responsive (table on desktop, cards on mobile)
- ✅ Loan management across all customers
- ✅ Payment tracking system
- ✅ Property management
- ✅ **Tax withholding rate setting** (default 30%, customizable per admin)

### Financial Reporting
- ✅ **Comprehensive financial reports:**
  - Revenue breakdown (down payments, processing fees, loan payments, late fees, notice fees)
  - Tax escrow tracking by property (collected vs paid to counties)
  - HOA fee tracking by property
  - Monthly revenue trends (12-month view)
  - Outstanding balances report
  - Defaulted loans report with recovery analysis
- ✅ **Tax Summary Report for CPA:**
  - Annual summary with monthly breakdown
  - Quarterly summaries (Q1-Q4)
  - Revenue streams (loan payments, fees, reimbursements)
  - Expenses (Square fees, acquisition costs, selling expenses, recovery costs)
  - Net profit calculation
  - Year selection (defaults to current year)
- ✅ **PDF Export functionality:**
  - Overview reports (portfolio + property-level revenue)
  - Tax escrow reports (collected vs paid by property)
  - HOA tracking reports
  - Outstanding balances with customer details
  - Professional formatting with Green Acres branding
- ✅ **Property-level profit tracking:**
  - Acquisition cost vs sale price
  - Revenue generated from financing
  - Selling expenses by category
  - Net profit per property

### Tax Escrow System
- ✅ **Advanced reconciliation tracking:**
  - Tax collected from customers (monthly portions)
  - Tax paid to counties (actual payments)
  - Balance held in escrow
  - Property-level tracking
  - Payment history with check numbers
  - Funded vs. collecting status
  - Annual tax amount with dual payment dates
  - Notes field for special circumstances

## Recent Updates (November 2025)

### November 14, 2025 - Mobile Responsiveness Overhaul
- ✅ All admin pages now fully responsive on mobile devices
- ✅ Eliminated horizontal scrolling across entire platform
- ✅ Desktop tables replaced with mobile card views
- ✅ Standardized responsive patterns: `flexWrap: 'wrap', gap: '1rem'`
- ✅ Fixed grid layouts to stack properly on small screens
- ✅ Consistent button layouts across client and admin pages
- ✅ Pages updated: CustomerManagement, AccountSettings, CreateCustomLoan, ImportLoan, PropertyManagement, TaxSummary
- ✅ Established code standards for future development

### Customer Password Management & Admin Controls (November 13, 2025) ✅
- **Feature:** Complete password and account management system
- **Customer Features (Account Settings):**
  - Change Password functionality
  - Validates current password before allowing change
  - Requires 6+ character new password
  - Backend endpoint: POST /api/user/change-password
- **Admin Features (Customer Management):**
  - Reset Password for customers
  - Generates random 12-character temporary password
  - Modal displays temp password for admin to copy and share
  - Delete Customer functionality
  - Prevents deletion if customer has active loans
  - Backend endpoints: POST /api/admin/customers/:id/reset-password, DELETE /api/admin/customers/:id
- **UI Enhancement:** Customer Management page now fully mobile-responsive (table on desktop, cards on mobile)

### Amended Contract Support (November 13, 2025) ✅
- **Feature:** Automatic generation of "Amended and Restated" contracts for imported loans
- **Implementation:**
  - Contract system detects loans with existing payment history
  - Shows original contract date, payments made, and total paid
  - Uses different legal language for amended vs. new contracts
  - Maintains all standard contract features (signatures, download, etc.)
- **Use Case:** When importing existing loans from previous systems or portfolio acquisitions

### Imported Payment Revenue Fix (November 13, 2025) ✅
- **Issue:** Imported payment history not showing correctly in revenue reports
- **Fix:** Updated import process to populate `loan_payment_amount` field
- **Impact:** Financial reports now accurately show all revenue including imported loan history
- **Verification:** All 42 imported payments ($6,147.50) now appear correctly in breakdowns

### Photo Management System (November 2025) ✅
- **Feature:** Complete property image management with Cloudinary integration
- **Capabilities:**
  - Direct file upload with drag-and-drop
  - Reorder images by drag-and-drop
  - Add/edit captions
  - Delete images (removes from Cloudinary and database)
  - Preview thumbnails
  - Set featured image
  - Maximum 10 images per property

### Account Settings Enhancement (October-November 2025) ✅
- **Feature:** Comprehensive customer account management
- **Sections:**
  1. Contact Information (phone, stored per user)
  2. Mailing Address (street, city, state, zip - stored per user)
  3. Deed Information (name and mailing address - stored per loan/property)
- **Auto-fill:** Deed information automatically pre-fills from user profile when empty
- **Contract Integration:** Mailing address from Account Settings populates contracts

### Tax Escrow Reconciliation (October 2025) ✅
- **Feature:** Track taxes collected from customers vs. taxes paid to counties
- **Reports:** Show escrow balance held for each property
- **Payment Recording:** Full audit trail of county tax payments

### Payment Breakdown Enhancement (October 2025) ✅
- **Feature:** Detailed breakdown of every payment component
- **Components:** Loan payment, tax escrow, HOA, late fees, notice fees, processing fees
- **Display:** Shows breakdown before payment and in payment history

## Development Workflow

### Making Changes
1. **Local Development:**
   - Work in `C:\Projects\GreenAcres`
   - Test locally before committing
   - Use Command Prompt for git operations

2. **Version Control:**
```bash
   git add -A
   git commit -m "Description of changes"
   git push origin main
```

3. **Deployment:**
   - Railway: Automatic from GitHub push (backend)
   - Netlify: Automatic from GitHub push (frontend)
   - Monitor deployment logs for errors

4. **Database Changes:**
   - Always backup before schema changes
   - Test queries in Supabase SQL editor first
   - Update both production and understanding of schema

### File Editing Best Practices
- **Critical files:** Use Notepad (VS Code has caching issues)
- **Code snippets:** Request complete FIND/REPLACE blocks
- **No explanatory text:** Just code blocks for copy-paste
- **One task at a time:** Prevents overwhelming workflow

### Documentation
- **Session handoffs:** Create detailed markdown files after major work
- **Update PROJECT-SUMMARY.md:** After completing features
- **Git commits:** Descriptive messages for tracking changes

## System Architecture

### Database Schema (Key Tables)
- **users:** Customer accounts with mailing addresses
- **admin_users:** Admin accounts with tax withholding rates
- **properties:** Land parcels with full details and tax/HOA info
- **property_images:** Cloudinary-hosted images with captions and ordering
- **loans:** Financing agreements with payment schedules
- **payments:** Transaction history with complete breakdowns
- **contracts:** Generated and signed agreements
- **loan_notices:** Default/cure notice tracking
- **property_tax_payments:** County tax payment records
- **selling_expenses:** Property-level expense tracking
- **states:** State management (active/coming soon)

### API Structure
- **Public routes:** `/api/properties`, `/api/states`
- **Customer routes:** `/api/loans`, `/api/payments`, `/api/user/*` (JWT auth)
  - `/api/user/change-password` - Customer password change
- **Admin routes:** `/api/admin/*` (Admin JWT auth)
  - `/api/admin/customers/:id/reset-password` - Reset customer password
  - `/api/admin/customers/:id` - Delete customer (DELETE)
- **Authentication:** JWT tokens with role-based access

### Security
- **reCAPTCHA v3:** Registration protection
- **Password hashing:** bcrypt (10 rounds)
- **JWT tokens:** 24-hour expiration
- **Environment variables:** Stored in Railway/Netlify, never in code
- **Admin separation:** Separate admin_users table with role verification

## Business Rules

### Financing Tiers
1. **$99 Down:** 18% APR, 5 years max
2. **20% Down:** 12% APR, 5 years max  
3. **50% Down:** 8% APR, 1-5 years

### Payment Rules
- **Minimum Payment:** $50/month
- **Processing Fee:** $99 (added to loan amount)
- **Late Fee:** $75 (after 7-day grace period)
- **First Payment:** No grace period, late fee applies immediately
- **Payment by Mail:** Must be postmarked by due date

### Default Process
1. Payment overdue 7+ days: Late fee applied
2. Payment overdue 30+ days: Default notice sent by certified mail
3. Notice fee: $75 + actual postal costs
4. Cure period: 14 days from notice receipt
5. Failure to cure: Acceleration option or eviction proceedings

### Tax Escrow
- Collected monthly (annual amount ÷ 12)
- Paid to counties on schedule (dual payment dates supported)
- Balance tracked per property
- Reconciliation reports for admin

## Known Issues & Solutions

### VS Code Caching
- **Issue:** File changes not reflecting properly during critical edits
- **Solution:** Use Notepad for important file modifications
- **Impact:** Contract template, server.js critical sections

### Square API
- **Current State:** Sandbox mode
- **Production:** Will need Square production credentials
- **Testing:** Use Square test card numbers

### Database Connection
- **Provider:** Supabase PostgreSQL
- **Connection:** Environment variables on Railway
- **Backup:** Regular exports recommended

## Future Enhancements (Planned)

### Near-Term
- [ ] Advanced property search/filtering by state, price, acres
- [ ] Customer payment portal improvements (scheduled payments)
- [ ] Email notifications for payment due dates
- [ ] SMS reminders for payments
- [ ] Photo disclaimer system for property images

### Medium-Term
- [ ] Mobile app for customer portal
- [ ] Automated late fee assessment
- [ ] Automated default notice generation
- [ ] Lien release processing automation
- [ ] Multi-language support

### Long-Term
- [ ] Portfolio analytics and projections
- [ ] Property acquisition tracking (auction bids)
- [ ] Marketing automation for available properties
- [ ] Customer referral program
- [ ] Integration with county tax systems

## Support & Maintenance

### Regular Tasks
- [ ] Monitor payment processing (daily)
- [ ] Review late fees and notices (weekly)
- [ ] Tax escrow reconciliation (monthly)
- [ ] Generate tax reports (quarterly)
- [ ] Database backups (weekly)
- [ ] Review error logs (daily)

### Troubleshooting
- **Payment fails:** Check Square sandbox status
- **Contract won't generate:** Verify template file exists, check loan data
- **Reports showing $0:** Check payment dates and field population
- **Deploy fails:** Check Railway logs, verify environment variables

## Contact Information
- **Business:** Green Acres Land Investments, LLC
- **Mailing:** P.O. Box 43, Kimberly, WI 54136-0043
- **Owner:** Claude Weidner
- **Email:** claudeweidner2013@gmail.com

## Repository Structure
```
C:\Projects\GreenAcres\
├── server/
│   ├── server.js (main backend application)
│   ├── database.js (PostgreSQL connection and init)
│   ├── contract-template.txt (mail merge template)
│   └── package.json
├── src/ (React frontend)
├── public/
├── PROJECT-SUMMARY.md (this file)
├── SESSION-HANDOFF-*.md (session documentation)
└── package.json
```

---

**Version:** 2.2
**Last Updated:** November 14, 2025
**Status:** Production - All core features complete and operational