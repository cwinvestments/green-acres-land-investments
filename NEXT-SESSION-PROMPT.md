\# Next Session Handoff Prompt



\*\*Copy this entire message to start the next session:\*\*



---



Hi Claude! I'm continuing work on my Green Acres Land Investments platform. Here's what you need to know:



\## Quick Context

\- \*\*Project:\*\* Land financing platform (React/Node.js/PostgreSQL)

\- \*\*Location:\*\* C:\\Projects\\GreenAcres

\- \*\*Stack:\*\* React (Netlify) + Node.js/Express (Railway) + PostgreSQL (Supabase)

\- \*\*Last Session:\*\* November 13, 2025



\## What We Just Completed

1\. ✅ Fixed payment convenience fee (only $5, not $10)

2\. ✅ Fixed payment type labels (Processing Fee displays correctly)

3\. ✅ Built Custom Loan Creator for flexible financing terms

4\. ✅ Verified property auto-returns to "available" on loan deletion



\## Critical Issues to Fix This Session



\### HIGH PRIORITY FIXES



\*\*1. Financial Reports - Revenue Breakdown is Incomplete\*\*

\- \*\*File:\*\* `client/src/pages/AdminReports.js`

\- \*\*Problem:\*\* "Fee Breakdown" only shows fees (convenience, late, notice) but NOT down payments and processing fees

\- \*\*Fix:\*\* Rename to "Revenue Breakdown" and show ALL revenue sources:

&nbsp; - Down Payments

&nbsp; - Processing Fees (Doc Fees)  

&nbsp; - Loan Payments

&nbsp; - Convenience Fees

&nbsp; - Late Fees

&nbsp; - Notice Fees

&nbsp; - Everything should add up to "Total Revenue"



\*\*2. Tax Summary Not Showing Custom Loan Revenue\*\*

\- \*\*File:\*\* `server/server.js` (around line 2065+, GET `/api/admin/reports/tax-summary`)

\- \*\*Problem:\*\* Custom loan payments ($5 down + $1 doc fee) show in Payment Tracking but NOT in Tax Summary

\- \*\*Investigation:\*\* Check if query filters out `payment\_method = 'custom\_loan'` or has date issues

\- \*\*Test:\*\* Create custom loan and verify it appears in Tax Summary



\*\*3. Custom Loan Creator - Add Square Payment Option\*\*

\- \*\*File:\*\* `client/src/pages/CreateCustomLoan.js`

\- \*\*Enhancement:\*\* Add checkbox "Collect down payment now via Square"

\- \*\*Behavior:\*\*

&nbsp; - If checked: Process Square payment before creating loan

&nbsp; - If unchecked: Create loan without payment (current behavior)

\- \*\*Use Case:\*\* eBay auction winners vs loyal customers



\*\*4. Custom Loan Creator - Auto-Calculate Loan Term\*\*

\- \*\*File:\*\* `client/src/pages/CreateCustomLoan.js`

\- \*\*Enhancement:\*\* Calculate term months automatically from:

&nbsp; - Purchase price

&nbsp; - Down payment

&nbsp; - Monthly payment

&nbsp; - Interest rate

\- \*\*Formula:\*\* Loan amortization: `n = -ln(1 - (P \* r) / M) / ln(1 + r)`

\- \*\*Benefit:\*\* Admin enters "what customer can afford" and system calculates how long



\### MEDIUM PRIORITY



\*\*5. Custom Loan Creator - Mobile-Friendly Redesign\*\*

\- \*\*File:\*\* `client/src/pages/CreateCustomLoan.js`

\- \*\*Current:\*\* Works on mobile but not polished

\- \*\*Goal:\*\* Match card-based design of other admin pages (PropertyManagement, AdminLoans)



\*\*6. Custom Loan Creator - Optional Tax/HOA Fields\*\*

\- \*\*File:\*\* `client/src/pages/CreateCustomLoan.js`

\- \*\*Enhancement:\*\* Add optional fields for Annual Tax Amount and Monthly HOA Fee

\- \*\*Current Workaround:\*\* Admin edits property after creating loan



\## Important Files to Know



\### Backend (Railway)

\- `server/server.js` - Main API, custom loan endpoint at line ~1197

\- `server/database.js` - PostgreSQL connection



\### Frontend (Netlify)

\- `client/src/pages/CreateCustomLoan.js` - NEW custom loan form (needs mobile polish)

\- `client/src/pages/PaymentTracking.js` - Shows all payments (working correctly)

\- `client/src/pages/PaymentHistory.js` - Customer payment history (working correctly)

\- `client/src/pages/AdminReports.js` - Revenue breakdown (needs fix)

\- `client/src/pages/TaxSummary.js` - CPA tax report (not showing custom loans)

\- `client/src/api.js` - API functions



\## Custom Loan Creator Details

\*\*Location:\*\* Admin → Loan Management → "✨ Create Custom Loan" button

\*\*Endpoint:\*\* POST `/api/admin/loans/create-custom`

\*\*Current Features:\*\*

\- Select customer and property

\- Set down payment (including $0)

\- Set processing fee (including $0)

\- Set interest rate, term, monthly payment

\- Internal notes field

\- No Square payment (for testing/deferred payment)



\*\*Database Records Created:\*\*

\- Loan record with `status = 'active'`

\- Payment record(s) with `payment\_method = 'custom\_loan'`

\- Property status → 'pending'



\## My Preferences

\- Work on ONE task at a time

\- Provide complete file contents for copy-paste

\- Use exact FIND/REPLACE format

\- Command Prompt syntax (not PowerShell)

\- No explanatory text after code blocks

\- Working directory: C:\\Projects\\GreenAcres



\## Testing Setup

\- Admin login: claudeweidner2013@gmail.com

\- Customer login: claudeweidner2013@gmail.com

\- Square API: Sandbox mode

\- Test loans should be deleted before production



\## What to Start With

Please read the full session summary in `SESSION-SUMMARY-2025-11-13.md`, then let's start with \*\*Issue #1: Financial Reports Revenue Breakdown\*\* since it's a quick fix and highly visible to me as the business owner.



After that, we'll tackle the Tax Summary investigation.



Ready to work!

