\# Green Acres Land Investments - Development Chat Prompt



\## 🏢 BUSINESS OVERVIEW

I'm Claude Weidner, owner of Green Acres Land Investments, LLC ("Your Land. Your Terms."). I purchase raw land at auction and resell with flexible owner financing. My business model makes land ownership accessible through multiple financing tiers:



\*\*Financing Options:\*\*

\- $99 down payment at 18% APR (most popular)

\- 20% down at 12% APR

\- 25% down at 8% APR

\- 35% down at 8% APR

\- 50% down at 8% APR



\*\*Terms:\*\* 1-5 years, $50 minimum monthly payments

\*\*Target Properties:\*\* $2,000-$10,000 raw land parcels

\*\*States:\*\* Arizona, Colorado, Arkansas (expanding)



\## 💻 CURRENT TECH STACK

\- \*\*Frontend:\*\* React on Netlify (auto-deploy from GitHub)

\- \*\*Backend:\*\* Node.js/Express on Railway (auto-deploy from GitHub)

\- \*\*Database:\*\* PostgreSQL via Supabase

\- \*\*Payments:\*\* Square API (currently sandbox mode)

\- \*\*Security:\*\* JWT tokens (24hr expiry), Google reCAPTCHA v3

\- \*\*Working Directory:\*\* C:\\Projects\\GreenAcres



\## ✅ FULLY IMPLEMENTED FEATURES



\### Customer Features

\- User registration and login

\- Property browsing with state filtering

\- Property detail pages with GPS coordinates (5-point system)

\- Financing calculator with 5 down payment options

\- Square payment processing for down payments

\- Contract signing (in-app electronic signatures)

\- Customer dashboard showing active loans

\- Loan detail view with payment breakdown

\- Monthly payment processing

\- Payment history tracking



\### Admin Features

\- Admin login (separate from customer login)

\- Dashboard with live statistics

\- Property management (CRUD operations)

&nbsp; - GPS coordinates (NE, SE, SW, NW corners + center)

&nbsp; - Legal descriptions

&nbsp; - Tax and HOA tracking

&nbsp; - Property covenants

&nbsp; - Coming Soon status

&nbsp; - Acquisition cost tracking

&nbsp; - Tax payment recording and reconciliation

\- Customer management with search

\- Loan management

&nbsp; - Payment due date selection (1st or 15th)

&nbsp; - Alert status toggle

&nbsp; - Default tracking with recovery costs

&nbsp; - Deed type selection

&nbsp; - Default cure notices with tracking

\- Contract generation with merge fields

\- Payment tracking with detailed breakdown

\- Financial reports

&nbsp; - Tax Escrow Report

&nbsp; - Outstanding Balances Report

&nbsp; - Tax Summary for CPA

&nbsp; - Defaulted Loans Report

\- Multi-state management system



\### Recent Updates (Nov 8 \& Nov 10, 2025)

\- Photo disclaimer on property pages

\- Tax escrow reconciliation system

\- Payment breakdown column in tracking

\- Deed name and mailing address fields at checkout

\- "(Includes Interest)" label on total cost

\- Dynamic tax rate display (admin configurable)

\- Fixed PostgreSQL empty string handling

\- Fixed state filtering re-rendering

\- Mobile responsiveness improvements

\- Updated fee schedule ($99 contract fee, $75 late fee)



\## 🚧 KNOWN ISSUES

1\. Table scrolling on mobile needs improvement

2\. Square API in sandbox mode (not production)



\## 🎯 NEXT PRIORITY: Account Settings Page

\*\*Status:\*\* Documented but not implemented



Customers need ability to update:

\- Phone number

\- Mailing address

\- Deed name (per property)

\- Deed mailing address (per property)



\*\*Complete implementation guide:\*\* See `SESSION-UPDATES-NOV-10-2025.md`



\## 🎨 MY WORKING PREFERENCES

\*\*CRITICAL - Please follow these exactly:\*\*



1\. \*\*One task at a time\*\* - I get overwhelmed with multiple simultaneous instructions

2\. \*\*Complete file contents\*\* - Not snippets. I copy-paste entire files

3\. \*\*Exact FIND/REPLACE format\*\* - Show me exact code to find and what to replace it with

4\. \*\*Command Prompt syntax\*\* - NOT PowerShell (I use `cd`, not `Set-Location`)

5\. \*\*No explanatory text after code blocks\*\* - I've accidentally copied explanations into files before

6\. \*\*Use Notepad for critical edits\*\* - VS Code caching causes issues

7\. \*\*Four-monitor setup\*\* - I work from C:\\Projects\\GreenAcres

8\. \*\*Step-by-step workflow:\*\*

&nbsp;  - Make changes locally

&nbsp;  - Test (locally or production)

&nbsp;  - Commit and push (triggers auto-deploy)

&nbsp;  - Monitor Railway/Netlify logs



\## 🔒 SECURITY PRACTICES

\- Environment variables for sensitive data (never hardcoded)

\- Confirmation dialogs for destructive operations

\- JWT tokens limited to 24-hour expiry

\- All admin routes properly authenticated

\- User data scoped to authenticated user only



\## 📁 KEY FILES TO KNOW

\- `server/server.js` - Main backend API

\- `server/database.js` - Database schema and initialization

\- `client/src/pages/PropertyDetail.js` - Customer checkout flow

\- `client/src/pages/Dashboard.js` - Customer dashboard

\- `client/src/pages/AdminDashboard.js` - Admin dashboard

\- `client/src/pages/PropertyManagement.js` - Admin property CRUD

\- `client/src/pages/AdminReports.js` - Financial reporting

\- `server/contract-template.txt` - Contract for Deed template



\## 🎨 BRAND COLORS

\- Forest Green: #2c5f2d

\- Sandy Gold: #f4a460

\- Light Green: #e8f5e9



\## 📝 IMPORTANT PATTERNS

1\. \*\*Database changes:\*\* Always use "IF NOT EXISTS" pattern

2\. \*\*Null handling:\*\* Use `|| null` for optional PostgreSQL fields

3\. \*\*Date fields:\*\* Never send empty strings, always null

4\. \*\*Error handling:\*\* Try-catch on all API calls

5\. \*\*Loading states:\*\* Show spinner during async operations

6\. \*\*Success messages:\*\* Always confirm successful operations



\## 🐛 DEBUGGING WORKFLOW

1\. Check Railway deployment logs first

2\. Verify database schema matches code

3\. Test frontend-backend integration

4\. Check for typos in variable names (common issue!)

5\. Verify authentication tokens



\## 📚 DOCUMENTATION FILES

\- `PROJECT-SUMMARY.md` - Overall project state

\- `GREEN-ACRES-PROJECT-GUIDE.md` - Complete feature guide

\- `ADMIN-GUIDE.md` - Admin functionality reference

\- `PAYMENT-SYSTEM-GUIDE.md` - Payment processing details

\- `SESSION-UPDATES-NOV-10-2025.md` - Latest session updates with Issue #7 implementation guide



\## 🚀 WHEN STARTING A NEW CHAT

Please review:

1\. This chat prompt

2\. `SESSION-UPDATES-NOV-10-2025.md` for latest changes

3\. `PROJECT-SUMMARY.md` for overall context



\## 💡 FUTURE ENHANCEMENTS (Not Prioritized)

\- DocuSign integration (replace in-app signatures)

\- Print/export for reports

\- Enhanced property image management

\- Checkout page improvements

\- Multi-state expansion beyond AZ, CO, AR

\- Square production mode transition



---



\*\*Last Updated:\*\* November 10, 2025

\*\*Current Status:\*\* Issue #7 (Account Settings) ready for implementation

\*\*Platform Status:\*\* Fully deployed and operational

```



Save and commit:

```

git add CHAT-PROMPT.md

git commit -m "Update chat prompt with latest session info and Issue #7 priority"

git push origin main

