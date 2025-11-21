# 📘 Green Acres Admin User Guide

**Last Updated:** November 21, 2025  
**Version:** 2.1.0  
**For:** Admin Users

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Admin Dashboard Overview](#admin-dashboard-overview)
3. [Property Management](#property-management)
4. [Customer Management](#customer-management)
5. [Loan Management](#loan-management)
6. [Payment Tracking](#payment-tracking)
7. [Financial Reports](#financial-reports)
8. [eBay System](#ebay-system)
9. [Property Sources](#property-sources)
10. [Auction Calendar](#auction-calendar)
11. [Common Tasks](#common-tasks)

---

## 🚀 Getting Started

### Logging In

1. Go to: `https://greenacreslandinvestments.com/admin/login`
2. Enter your admin email and password
3. Click "Login to Admin Panel"
4. You'll be redirected to the Admin Dashboard

**Note:** If you see "Session expired" errors after being idle, simply log out and log back in.

### Admin Dashboard Layout

The dashboard shows 12 cards organized in 4 rows:

**Row 1 - Core Management:**
- Property Management
- Customer Management  
- Active Loans

**Row 2 - Financial:**
- Payment Tracking
- Financial Reports
- Income Tax Summary

**Row 3 - Configuration:**
- State Management
- eBay Listing Generator
- eBay Auction Winners

**Row 4 - Tools:**
- Property Sources
- Auction Calendar
- Future Feature (placeholder)

---

## 🏠 Property Management

### Adding a New Property

1. Click **"Property Management"** card
2. Click **"➕ Add New Property"** button
3. Fill in required fields:
   - **Title** (e.g., "5 Acres in Maricopa County")
   - **Location** (e.g., "Maricopa County, Arizona")
   - **State** (select from dropdown)
   - **County**
   - **Acres**
   - **Price**

4. Optional fields:
   - **Description** - Property highlights
   - **Acquisition Cost** - What you paid (for profit tracking)
   - **APN** - Assessor's Parcel Number
   - **Coordinates** - GPS coordinates
   - **Legal Description** - From deed

5. Tax Information (if applicable):
   - **Annual Tax Amount**
   - **Tax Payment 1 Date & Amount**
   - **Tax Payment 2 Date & Amount**
   - **Tax Notes**

6. HOA Information (if applicable):
   - **Monthly HOA Fee**
   - **HOA Name**
   - **HOA Contact**
   - **HOA Notes**

7. **Property Covenants** - Any restrictions

8. Click **"Create Property"**

### Uploading Property Images

1. Open the property in Property Management
2. Scroll to **"Property Images"** section
3. Click **"Upload Image"** button
4. Select image file (JPG, PNG, WEBP)
5. Add optional caption
6. Image uploads to Cloudinary automatically
7. Repeat for up to 10 images per property

**Tips:**
- First image becomes the featured image automatically
- Drag images to reorder
- Set captions for SEO and accessibility
- Delete unwanted images with trash icon

### Editing Property Details

1. Find property in Property Management list
2. Click **"Edit"** button
3. Update any fields needed
4. Click **"Update Property"**

### Changing Property Status

Properties can have these statuses:
- **Available** - Shows on public site
- **Coming Soon** - Shows with "Coming Soon" badge
- **Pending** - Customer in contract process
- **Under Contract** - Contract signed, awaiting close
- **Sold** - Property sold, shows in showcase

**To Change Status:**
1. Find property in list
2. Use status dropdown
3. Status updates immediately

### Tracking Selling Expenses

Record expenses associated with selling a property:

1. Open property details
2. Scroll to **"Selling Expenses"** section
3. Click **"Add Expense"**
4. Enter:
   - **Date**
   - **Category** (Marketing, Repairs, Legal, etc.)
   - **Description**
   - **Amount**
5. Click **"Add Expense"**

**Common Expense Categories:**
- Marketing (eBay fees, ads)
- Repairs/Improvements
- Legal fees
- Survey costs
- Title work
- Other

### Recording Tax Payments

When you pay property taxes to the county:

1. Open property details
2. Scroll to **"Tax Payments"** section
3. Click **"Record Tax Payment"**
4. Enter:
   - **Payment Date**
   - **Amount**
   - **Tax Year**
   - **Payment Method** (Check, ACH, etc.)
   - **Check Number** (if applicable)
   - **Notes**
5. Click **"Record Payment"**

**System tracks:**
- Tax collected from customer (in escrow)
- Tax paid to county
- Balance remaining in escrow

---

## 👥 Customer Management

### Viewing All Customers

1. Click **"Customer Management"** card
2. View list showing:
   - Name, email, phone
   - Number of active loans
   - Total balance owed
   - Total monthly payment

### Viewing Customer Details

1. Find customer in list
2. Click **"View Details"**
3. See:
   - Contact information
   - All loans (active and paid off)
   - Payment history
   - Contract status

### Resetting Customer Password

If a customer forgets their password:

1. Find customer in Customer Management
2. Click **"Reset Password"**
3. Enter temporary password (at least 6 characters)
4. Click **"Reset Password"**
5. **IMPORTANT:** Call or email customer with temp password
6. Instruct them to log in and change password in Account Settings

### Deleting a Customer

**⚠️ WARNING:** Can only delete customers with NO loans

1. Find customer with 0 loans
2. Click **"Delete"**
3. Confirm deletion
4. Customer account permanently removed

---

## 📋 Loan Management

### Viewing All Loans

1. Click **"Active Loans"** card
2. View comprehensive table with:
   - Customer name and contact
   - Property title and location
   - Loan details (balance, monthly payment, rate)
   - Payment status (current, overdue, in default)
   - Next payment due date
   - Contract status

**Desktop:** Full table with all columns  
**Mobile:** Cards with key information

### Loan Details & Actions

For each loan, you can:
- **View Details** - Complete loan information
- **Edit Payment Due Day** - Change to 1st or 15th
- **Record Manual Payment** - Cash, check, Venmo
- **Send Default Notice** - 30-day cure notice
- **Mark as Defaulted** - After cure period expires
- **Toggle Alerts** - Disable overdue alerts for this loan
- **Update Deed Type** - Special Warranty or Quitclaim
- **Generate Contract** - Create e-signature contract
- **Delete Loan** - Permanently remove (use carefully!)

### Creating a Custom Loan

For loyal customers or special deals:

1. Click **"Active Loans"** card
2. Click **"Create Custom Loan"** button
3. Select:
   - **Customer** (from dropdown)
   - **Property** (from available properties)
4. Enter loan terms:
   - **Purchase Price**
   - **Down Payment Amount**
   - **Processing Fee** (usually $99, can be $0)
   - **Interest Rate** (as decimal, e.g., 12.5)
   - **Monthly Payment**
5. Select **Payment Due Day** (1st or 15th)
6. Add **Notes** explaining special terms
7. Click **"Create Loan"**

**System auto-calculates:**
- Loan amount (price - down + processing fee)
- Term length (from monthly payment and interest rate)
- First payment date (based on due day)

### Importing Existing Loans

When you have loans from before the system:

1. Click **"Active Loans"** card
2. Click **"Import Loan"** button
3. Enter loan details:
   - Customer, property, original terms
   - **Current Balance** (not original balance)
   - **Next Payment Date**
4. Add payment history:
   - Click **"Add Payment"** for each past payment
   - Enter date, amount, principal, interest breakdown
5. Add tax payment history if collected
6. Click **"Import Loan"**

**System will:**
- Create loan with current balance
- Record all past payments
- Calculate correct next payment date
- Track tax payments separately

### Recording Manual Payments

When customers pay by cash, check, or Venmo:

1. Find loan in Active Loans
2. Click **"Record Payment"**
3. Enter:
   - **Amount** (total payment including tax/HOA)
   - **Payment Date**
   - **Payment Method** (Cash, Check, Venmo, etc.)
   - **Transaction ID** (check number, Venmo ID)
   - **Notes** (optional)
4. Click **"Record Payment"**

**System calculates:**
- Loan payment portion
- Tax portion (based on property tax)
- HOA portion (based on property HOA fee)
- Principal vs interest breakdown
- New balance

### Sending Default/Cure Notices

When a loan is 30+ days overdue:

1. Find loan in Active Loans (shows in red if overdue)
2. Click **"Send Notice"**
3. Enter:
   - **Notice Date** (date you mailed it)
   - **Postal Method** (Certified, Priority, etc.)
   - **Postal Cost** (tracking fees)
   - **Tracking Number**
   - **Notes**
4. Click **"Send Notice"**

**System automatically:**
- Calculates 7-day cure deadline
- Adds $75 notice fee to balance
- Adds postal cost to balance
- Marks loan as "In Default"

### Marking Loan as Defaulted

After cure period expires without payment:

1. Find loan with expired cure deadline
2. Click **"Mark as Defaulted"**
3. Enter:
   - **Default Date**
   - **Recovery Costs** (repossession, legal fees)
   - **Notes** on outcome
4. Click **"Mark as Defaulted"**

**System calculates:**
- Total paid by customer
- Net recovery (total paid - recovery costs)
- Sets property back to "Available"
- Disables overdue alerts
- Moves loan to defaulted report

### Generating Contracts

1. Find loan in Active Loans
2. Click loan to view details
3. Click **"Generate Contract"**
4. System creates contract with:
   - Property legal description
   - Customer information
   - Loan terms and payment schedule
   - Current balance (for imported loans)
5. Review contract text
6. Click **"Sign as Admin"**
7. Enter your signature (typed name)
8. Contract moves to "Pending Customer Signature"
9. Customer signs via their dashboard
10. Contract becomes "Fully Executed"

**For Imported Loans:**
Contract uses "Amended and Restated" language showing:
- Original purchase details
- Payments already made
- Remaining balance and terms

---

## 💳 Payment Tracking

### Viewing All Payments

1. Click **"Payment Tracking"** card
2. View table with all payments:
   - Customer name and contact
   - Property title
   - Payment amount and breakdown
   - Date and method
   - Transaction ID

**Payment Types:**
- Down Payment
- Processing Fee
- Monthly Payment
- Late Fee
- Notice Fee

**Breakdown columns show:**
- Loan payment amount
- Principal portion
- Interest portion
- Tax portion
- HOA portion
- Late fees
- Notice fees
- Convenience fee
- Square processing fee

### Exporting Payment Data

1. View payments in Payment Tracking
2. Use browser tools to save as CSV (future feature: export button)

---

## 📊 Financial Reports

### Overview Report

1. Click **"Financial Reports"** card
2. View dashboard showing:
   - **Total Revenue** breakdown
   - **Tax Escrow** status by property
   - **HOA Tracking** by property
   - **Monthly Trends** (last 12 months)

### Tax Escrow Reconciliation

Shows for each property with tax:
- Annual tax amount
- Tax collected from customers
- Tax paid to county
- Balance held in escrow
- Status: FUNDED or COLLECTING

**Red flags:**
- Balance less than annual tax amount
- No tax payments recorded but tax collected
- Upcoming tax deadline without funding

### HOA Fee Tracking

Shows for each property with HOA:
- Monthly HOA fee
- Total collected from customers
- Number of months collected
- Last payment date

### Revenue Breakdown

Shows all revenue by category:
- Down payments
- Processing fees
- Loan payments (principal + interest)
- Late fees
- Notice fees
- Convenience fees
- Postal fee reimbursements

**Note:** Tax and HOA are NOT revenue (pass-through)

### Exporting to PDF

1. Select report type (Overview, Tax, HOA, Outstanding)
2. Select date range (optional)
3. Click **"Export to PDF"**
4. PDF generates with professional formatting
5. Download opens automatically

**PDF includes:**
- Report title and date range
- Summary statistics
- Detailed breakdown by property
- Totals and balances

---

## 📦 eBay System

### Generating eBay Listings

1. Click **"eBay Listing Generator"** card
2. Select property from dropdown
3. Choose financing options to show (check up to 3):
   - $99 Down
   - 20% Down
   - 50% Down
4. Click **"Generate Listing"**
5. System creates:
   - Compelling title (under 80 characters)
   - Detailed description with property features
   - Payment options table with calculations
   - Call-to-action
6. Click **"Copy to Clipboard"**
7. Paste into eBay listing editor

**Tips:**
- Include good property photos
- Use "Buy It Now" or "Auction" format
- Set realistic reserve price
- Mention owner financing prominently

### Managing Auction Winner Submissions

When customers complete the public eBay Winner Form:

1. Click **"eBay Auction Winners"** card
2. View all submissions showing:
   - eBay username and contact info
   - Item purchased and price
   - Submission date
   - Status

**Statuses:**
- **Pending** - New submission, needs review
- **Contacted** - You've reached out
- **Converted** - Now a registered customer
- **Rejected** - Decided not to proceed

### Processing a Winner Submission

1. Find pending submission
2. Review details:
   - Contact information complete?
   - Purchase price matches auction?
   - Item number correct?
3. Click **"Contact Customer"** - update to "Contacted"
4. Call or email customer:
   - Congratulate on winning
   - Explain next steps
   - Confirm they want to proceed
5. If proceeding:
   - Click **"Convert to Customer"**
   - System creates user account
   - Link opens to create their loan
   - Complete loan creation as custom loan
   - Customer receives email with login info

### Rejecting a Submission

If customer doesn't respond or changes mind:

1. Find submission
2. Add notes explaining why
3. Click **"Reject"**
4. Status changes to "Rejected"
5. Keeps record but removes from active list

---

## 🗂️ Property Sources

### What Are Property Sources?

Track websites where you find properties:
- Auction sites (Hudson & Marshall, etc.)
- Government surplus sites
- Land sales platforms

**Benefits:**
- Store login credentials securely
- Track last access date
- Note which states/counties each covers
- Quick-open links with tracking

### Adding a Property Source

1. Click **"Property Sources"** card
2. Click **"➕ Add New Source"**
3. Enter:
   - **Source Name** (e.g., "Hudson & Marshall")
   - **Website URL** (full URL with https://)
   - **Username** (for login)
   - **Password** (stored for your reference)
   - **States** (which states they cover)
   - **Counties** (specific counties)
   - **Contact Info** (rep name, phone, email)
   - **Notes** (auction schedule, best property types)
4. Check **"Active"** if currently using
5. Click **"Add Source"**

### Using Property Sources

1. View list of all sources
2. See last accessed date
3. Click **"🌐 Open"** button:
   - Opens website in new tab
   - Updates "Last Accessed" timestamp
   - Helps track which sites you check regularly

### Editing Source Information

1. Find source in list
2. Click **"Edit"**
3. Update any fields
4. Click **"Update Source"**

**Common updates:**
- Updated passwords
- New contact person
- Schedule changes in notes
- Mark inactive if no longer using

---

## 📅 Auction Calendar

### What Is the Auction Calendar?

Track upcoming auction dates with countdown and reminders:
- Land auctions
- Tax lien sales
- Government surplus auctions

**Benefits:**
- Never miss an auction
- Color-coded urgency (green → yellow → red)
- Store property details and links
- Mark completed when done

### Adding an Auction

1. Click **"Auction Calendar"** card
2. Click **"➕ Add Auction"**
3. Enter:
   - **Auction Date & Time** (includes time)
   - **Auction Name** (e.g., "H&M December Land Auction")
   - **Auction URL** (link to listing)
   - **Property Address/Location** (where properties are)
   - **Description** (what's being auctioned)
   - **Notes** (internal reminders)
4. Click **"Add Auction"**

### Viewing Auctions

**Filter Tabs:**
- **Upcoming** - Not yet happened
- **Past** - Happened but not marked complete
- **Completed** - Finished and marked complete
- **All** - Everything

**Color Coding (Days Until):**
- 🟢 Green: 8+ days away
- 🟡 Yellow: 3-7 days away
- 🟠 Orange: 1-2 days away
- 🔴 Red: TODAY (highlighted background)
- ⚫ Gray: Past auctions

### Completing an Auction

After attending or reviewing results:

1. Find auction in list
2. Click **"✓ Complete"**
3. Auction moves to "Completed" filter
4. Optional: Add notes about outcome

---

## 🔧 Common Tasks

### Starting Your Day

1. **Check Dashboard** - Review key metrics
2. **Check Active Loans** - Any payments due today?
3. **Check Overdue** - Follow up on late payments
4. **Check Auction Calendar** - Any auctions today/soon?
5. **Check eBay Submissions** - New winner forms?

### Processing a Property Sale

**Full workflow:**

1. **Add Property** (Property Management)
   - Upload images
   - Set tax/HOA if applicable
   - Set status to "Available"

2. **Optional: Generate eBay Listing**
   - Create professional listing copy
   - Post on eBay

3. **Customer Purchases or Wins Auction**
   - If eBay: Process winner submission
   - If direct: They register and purchase online

4. **Loan Created Automatically** (or you create custom loan)
   - Property changes to "Pending"

5. **Generate & Sign Contract**
   - Review contract
   - Sign as admin
   - Customer signs online

6. **Property Changes to "Under Contract"**
   - Contract fully executed

7. **First Payment Received**
   - Recorded automatically if online
   - Record manually if cash/check

8. **Property Changes to "Sold"**
   - Loan becomes "Active"

### Handling Late Payments

**7 Days Late:**
- System shows yellow warning
- Customer sees late fee on payment screen
- You can call/email as courtesy reminder

**14 Days Late:**
- System shows orange warning
- Consider personal outreach

**30 Days Late:**
- System shows red alert
- Send default/cure notice:
  - Mail certified letter
  - Record in system with tracking #
  - Gives customer 7 days to cure
  - Adds $75 notice fee + postal costs

**37+ Days (Cure Period Expired):**
- If no payment, mark as defaulted
- Property returns to available
- Record recovery costs
- System calculates net recovery

### Month-End Financial Review

1. **Run Financial Reports**
   - Revenue breakdown
   - Tax escrow status
   - HOA tracking

2. **Review Tax Escrow**
   - Any properties underfunded?
   - Any tax payments due soon?
   - Pay taxes before deadline

3. **Review Outstanding Balances**
   - Total receivables
   - Average loan balance
   - Collection rate

4. **Export Reports**
   - PDF for records
   - Share with accountant if needed

### Preparing Tax Summary for CPA

1. Click **"Income Tax Summary"** card
2. Select tax year
3. Review:
   - **Annual totals** (revenue and expenses)
   - **Quarterly breakdown**
   - **Monthly detail**
4. Export to PDF
5. Send to accountant

**Revenue Included:**
- Down payments
- Processing fees
- Loan payments (principal + interest)
- Late fees
- Notice fees
- Convenience fees
- Postal reimbursements

**Expenses Included:**
- Property acquisition costs
- Square processing fees
- Selling expenses
- Recovery costs (defaulted loans)

**NOT Included (Pass-Through):**
- Property taxes
- HOA fees

---

## 💡 Tips & Best Practices

### Property Management
- ✅ Upload at least 3-5 good photos per property
- ✅ Include GPS coordinates for rural land
- ✅ Be honest about property access/utilities
- ✅ Update acquisition cost for profit tracking
- ✅ Set accurate tax amounts to avoid escrow shortfalls

### Customer Communication
- ✅ Respond to eBay winners within 24 hours
- ✅ Call customers before sending default notice
- ✅ Document all communication in loan notes
- ✅ Be friendly but firm on payment deadlines
- ✅ Celebrate when customers pay off loans!

### Financial Tracking
- ✅ Reconcile tax escrow monthly
- ✅ Pay property taxes before deadline (avoid penalties)
- ✅ Track all selling expenses for accurate profit
- ✅ Export monthly reports for records
- ✅ Review defaulted loans for lessons learned

### Loan Management
- ✅ Generate contracts early in loan lifecycle
- ✅ Record manual payments immediately
- ✅ Send default notices consistently (don't play favorites)
- ✅ Update deed information when customer requests
- ✅ Import old loans to have complete portfolio view

### System Maintenance
- ✅ Update property sources passwords when changed
- ✅ Mark completed auctions to keep calendar clean
- ✅ Review and reject old eBay submissions
- ✅ Keep property images organized and captioned
- ✅ Back up important reports to your computer

---

## 🆘 Troubleshooting

### "Session Expired" Error
**Solution:** Log out and log back in. JWT tokens expire after 24 hours.

### Can't Upload Images
**Solution:** Check image file size (under 10MB) and format (JPG, PNG, WEBP only).

### Payment Not Showing
**Solution:** Hard refresh page (Ctrl+Shift+R). Check if payment was actually completed in Square dashboard.

### Customer Can't Login
**Solution:** Reset their password in Customer Management. Call/email them the temporary password.

### Wrong Property Tax Amount
**Solution:** Edit property in Property Management. Update annual tax amount and payment schedule.

### Loan Balance Incorrect
**Solution:** Review payment history. If manual payment was entered wrong, contact developer (cannot edit payments directly).

### Mobile Layout Issues
**Solution:** Hard refresh (Ctrl+Shift+R). Clear browser cache. Try different browser.

---

## 📞 Support

### For Technical Issues
- Review this guide first
- Check GREEN-ACRES-PROJECT-GUIDE.md for detailed technical info
- Check Railway logs for backend errors
- Check Netlify logs for frontend errors

### For Business Questions
- Review financial reports for data
- Check payment tracking for transaction history
- Export PDF reports for detailed records

---

**Green Acres Land Investments, LLC - Admin Guide**

*Making land ownership simple through professional tools!* 🌿

*Last Updated: November 21, 2025*  
*Version: 2.1.0*