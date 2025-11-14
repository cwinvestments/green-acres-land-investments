\# 🌿 Green Acres Land Investments - Complete Admin Guide



**Version:** 2.1  
**Last Updated:** November 13, 2025 
**System Status:** Fully Operational - Mobile Responsive with PDF Export



---



\## Table of Contents



1\. \[Getting Started](#getting-started)

2\. \[Dashboard Overview](#dashboard-overview)

3\. \[Property Management](#property-management)

4\. \[Customer Management](#customer-management)

5\. \[Loan Management](#loan-management)

6\. \[Payment Tracking](#payment-tracking)

7\. \[Financial Reports](#financial-reports)

8\. \[Default Management Process](#default-management-process)

9\. \[Business Operations](#business-operations)

10\. \[Troubleshooting](#troubleshooting)

11\. \[Best Practices](#best-practices)



---



\## Getting Started



\### Accessing the Admin Panel



\*\*Production URL:\*\* https://greenacreslandinvestments.com/admin/login



\*\*Login Credentials:\*\*

\- Username and password are stored in environment variables

\- Credentials are set in Netlify environment configuration

\- Contact system administrator if you need credentials reset



\*\*Security Features:\*\*

\- JWT token authentication with 24-hour expiry

\- Separate admin authentication system from customer login

\- All admin routes are protected and invisible to customers

\- Admin sessions are independent from customer sessions



\### Initial Login Process



1\. Navigate to admin login URL

2\. Enter admin username

3\. Enter admin password

4\. System generates 24-hour admin token

5\. Redirects to Admin Dashboard



\*\*Note:\*\* If you're inactive for 24 hours, you'll need to log in again.



---



\## Dashboard Overview



\### Main Dashboard Components



\*\*Quick Stats (Top Section):\*\*

\- \*\*Total Properties\*\* - All properties in system (available, pending, sold)

\- \*\*Active Loans\*\* - Loans currently being paid

\- \*\*Total Customers\*\* - Registered customer accounts



\*\*Navigation Cards:\*\*

1\. \*\*Property Management\*\* - Manage property listings

2\. \*\*Customer Management\*\* - View customer accounts and loans

3\. \*\*Loan Management\*\* - Track loans, payments, defaults

4\. \*\*Payment Tracking\*\* - View payment history

5\. \*\*Financial Reports\*\* - Analytics and revenue tracking



\### Navigation Tips



\- Click any card to navigate to that section

\- Use browser back button or section's "Back to Dashboard" button

\- Dashboard refreshes stats on each visit

\- All sections are mobile-responsive



---



\## Property Management



\### Property Management Overview



The Property Management system handles all aspects of your property inventory, from initial listing through sale and beyond.



\### Adding a New Property



\*\*Step-by-Step Process:\*\*



1\. \*\*Click "Add New Property"\*\* button (top right)



2\. \*\*Fill Required Fields:\*\*

&nbsp;  - \*\*Title\*\* - Property name (e.g., "Peaceful 5 Acre Retreat")

&nbsp;  - \*\*Description\*\* - Detailed property description

&nbsp;  - \*\*Location\*\* - Full address or area description

&nbsp;  - \*\*State\*\* - Select from dropdown

&nbsp;  - \*\*County\*\* - County name

&nbsp;  - \*\*Acres\*\* - Property size (decimal allowed)

&nbsp;  - \*\*Price\*\* - Selling price (full amount)



3\. \*\*Fill Optional Fields:\*\*

&nbsp;  - \*\*Acquisition Cost\*\* - What you paid for property (admin-only, for ROI tracking)

&nbsp;  - \*\*Annual Tax Amount\*\* - Yearly property tax (system calculates monthly)

&nbsp;  - \*\*Monthly HOA Fee\*\* - If property has HOA

&nbsp;  - \*\*HOA Name\*\* - Name of HOA association



4\. \*\*Add GPS Coordinates (5 Points):\*\*

&nbsp;  - \*\*NE Corner\*\* - Northeast boundary point

&nbsp;  - \*\*SE Corner\*\* - Southeast boundary point

&nbsp;  - \*\*SW Corner\*\* - Southwest boundary point

&nbsp;  - \*\*NW Corner\*\* - Northwest boundary point

&nbsp;  - \*\*Center Point\*\* - Center of property

&nbsp;  

&nbsp;  \*\*Format:\*\* Latitude, Longitude (e.g., 44.2619, -88.4154)

&nbsp;  

&nbsp;  \*\*How to Get Coordinates:\*\*

&nbsp;  - Use Google Maps

&nbsp;  - Right-click location → "What's here?"

&nbsp;  - Copy coordinates

&nbsp;  - Paste in format: latitude, longitude



5\. \*\*Set Property Status:\*\*

&nbsp;  - \*\*Available\*\* - Shows on public site with full details

&nbsp;  - \*\*Coming Soon\*\* - Shows on public site but no financing calculator

&nbsp;  - \*\*Pending\*\* - Hidden from public (under contract)

&nbsp;  - \*\*Sold\*\* - Hidden from public, shows in "Recent Sales"



6\. \*\*Click "Add Property"\*\*



\*\*System Actions:\*\*

\- Property is immediately available based on status

\- GPS coordinates stored as JSON

\- Tax/HOA amounts auto-calculate monthly portions

\- ROI tracking starts if acquisition cost provided



\### Editing Existing Properties



\*\*Process:\*\*



1\. Find property in list

2\. Click "Edit" button

3\. Modify any fields

4\. Click "Update Property"



\*\*Common Edit Scenarios:\*\*



\*\*Property Sold:\*\*

\- Change status to "Sold"

\- System automatically hides from public listings

\- Appears in "Recent Sales" page



\*\*Property Under Contract:\*\*

\- Change status to "Pending"

\- Hides from public site

\- Prevents additional inquiries



\*\*Price Adjustment:\*\*

\- Update price field

\- Existing loans are NOT affected

\- Only new purchases use new price



\*\*Tax Amount Changed:\*\*

\- Update annual tax amount

\- Affects future loan calculations only

\- Existing loans keep original tax amount



\### Property Status Management



\*\*Status Definitions:\*\*



\*\*Available:\*\*

\- Visible on public Properties page

\- Full property details shown

\- Financing calculator active

\- "Purchase This Property" button enabled

\- Can be sold to customers



\*\*Coming Soon:\*\*

\- Visible on public Properties page

\- Full property details shown

\- Purple "Coming Soon" badge

\- Financing calculator HIDDEN

\- Purchase button HIDDEN

\- Message: "Finalizing deed transfer - Available soon"

\- Use for: Properties in redemption period



\*\*Pending:\*\*

\- HIDDEN from public Properties page

\- Not searchable by customers

\- Use when: Under contract but not yet finalized

\- Prevents double-selling



\*\*Sold:\*\*

\- HIDDEN from public Properties page

\- Appears on "Recent Sales" page

\- Shows as "Recently Sold"

\- Use when: Sale complete and loan active



\### Understanding Property ROI Tracking



\*\*Acquisition Cost Field:\*\*

\- Admin-only (customers never see this)

\- Enter what you paid for the property

\- System auto-calculates:

&nbsp; - \*\*Profit:\*\* Sale Price - Acquisition Cost

&nbsp; - \*\*ROI %:\*\* (Profit / Acquisition Cost) × 100



\*\*Where ROI Shows:\*\*

\- Admin Loan Management table

\- Each loan row shows property profit and ROI

\- Helps track most profitable properties



\*\*Example:\*\*

\- Acquisition Cost: $3,500

\- Sale Price: $5,000

\- Profit: $1,500

\- ROI: 42.9%



\### GPS Coordinate System



\*\*Why 5 Points:\*\*

Raw land parcels have irregular boundaries. The 5-point system provides:

\- Accurate boundary representation

\- Multiple access points for Google Maps

\- Clear property visualization for customers



\*\*Customer Display:\*\*

Each coordinate shows as a clickable Google Maps link:

\- "View NE Corner on Map"

\- "View SE Corner on Map"

\- etc.



\*\*Tips:\*\*

\- Use satellite view in Google Maps

\- Zoom in for accuracy

\- Double-check coordinates before saving

\- Coordinates can be edited anytime



\### Deleting Properties



\*\*Important:\*\* There is currently no delete function by design.



\*\*Why:\*\*

\- Prevents accidental deletion

\- Maintains historical records

\- Preserves data integrity for sold properties



\*\*Alternative:\*\*

\- Change status to "Pending" or "Sold" to hide

\- Edit details if information wrong

\- Properties with active loans should NEVER be deleted



---



\## Customer Management



\### Customer Management Overview



View and manage all customer accounts, their loans, and payment history.



\### Customer Dashboard



\*\*Summary Statistics (Top):\*\*

\- \*\*Total Customers\*\* - All registered users

\- \*\*Total Outstanding Balance\*\* - Sum of all active loan balances

\- \*\*Total Monthly Payments Expected\*\* - Sum of all monthly payments due



\*\*Customer Table Columns:\*\*

\- Customer Name

\- Email Address

\- Phone Number

\- Active Loans / Total Loans

\- Monthly Payment (total across all loans)

\- Total Balance (total across all loans)



\### Viewing Customer Details



\*\*Process:\*\*

1\. Search for customer (by name, email, or phone)

2\. Click anywhere on customer row

3\. Modal opens with full details



\*\*Customer Detail Modal Shows:\*\*



\*\*Contact Information:\*\*

\- Full name

\- Email address

\- Phone number

\- Registration date



\*\*All Customer Loans:\*\*

For each loan:

\- Property title and location

\- Loan amount and balance

\- Monthly payment

\- Next payment due date

\- Loan status (Active/Paid Off/Defaulted)

\- Progress bar showing percentage paid



\*\*Use Cases:\*\*

\- Quick lookup during customer calls

\- Verify payment history

\- Check multiple property ownership

\- Confirm contact information




### Customer Password Management



**Reset Customer Password:**

1. Open customer detail modal

2. Click "Reset Password" button

3. System generates secure 12-character temporary password

4. Modal displays temp password - copy and share with customer

5. Customer can change password in Account Settings



**Important Notes:**

- Temporary password is shown only once

- Customer must use Account Settings to set new password

- System validates current password before allowing change

- Minimum 6 characters required



### Delete Customer Account



**Delete Customer Process:**

1. Open customer detail modal

2. Click "Delete Customer" button (bottom of modal)

3. System checks for active loans

4. If customer has loans: deletion prevented with error message

5. If no loans: confirmation dialog appears

6. Confirm deletion to permanently remove customer



**Safety Features:**

- Cannot delete customers with active loans

- Confirmation required before deletion

- Permanent action - cannot be undone

- Use only for test accounts or duplicate registrations



\### Customer Search



\*\*Search Functionality:\*\*

\- Real-time search (starts as you type)

\- Searches across:

&nbsp; - First name

&nbsp; - Last name

&nbsp; - Email address

&nbsp; - Phone number



\*\*Tips:\*\*

\- Use partial matches (e.g., "john" finds "Johnson")

\- Phone search works with or without formatting

\- Case-insensitive

\- Clear search to see all customers



\### Understanding Customer Metrics



\*\*Active vs Total Loans:\*\*

\- \*\*Active\*\* - Loans currently being paid

\- \*\*Total\*\* - All loans (active + paid off)

\- Example: "2/3" means 2 active out of 3 total loans



\*\*Monthly Payment Column:\*\*

\- Sum of ALL active loans for that customer

\- If customer has 2 properties: $200 + $150 = $350

\- This is total they should pay monthly



\*\*Total Balance Column:\*\*

\- Sum of remaining balances across ALL active loans

\- Total amount customer still owes you

\- Used to calculate total outstanding portfolio



---

\### Loan Management Dashboard

\## Loan Management
The most important admin section for day-to-day operations. Track all loans, send default notices, manage late fees, and monitor payment status.

### Creating Custom Loans ✨

**Purpose:**  
Create flexible financing for special situations: loyal customers, eBay auction winners, negotiated deals, or testing without real payments.

**When to Use:**
- eBay auctions where winner bids on down payment amount
- Loyal customer deserves special terms
- Negotiated deal outside standard financing tiers
- Testing system without charging real money
- Zero down payment promotions

**Step-by-Step Process:**

1. **Navigate to Custom Loan Creator**
   - Admin Dashboard → Loan Management
   - Click "✨ Create Custom Loan" button (top right)

2. **Select Customer**
   - Dropdown shows all registered customers
   - Search by typing name
   - Customer must have account already

3. **Select Property**
   - Dropdown shows only Available properties
   - Search by typing property title
   - Property will be set to "Pending" when loan created

4. **Set Purchase Price**
   - Usually matches property price
   - Can customize for special deals
   - Must be greater than $0

5. **Set Down Payment**
   - Any amount from $0 to full price
   - Can set to $0 for zero-down deals
   - For eBay auctions: Use bid amount

6. **Set Processing Fee (Doc Fee)**
   - Standard is $99
   - Can set to $0 to waive fee
   - Or any custom amount

7. **Set Interest Rate**
   - Any percentage (e.g., 18, 12, 8)
   - Not restricted to standard tiers
   - Use for special arrangements

8. **Set Term (Months)**
   - How many months to pay off loan
   - Common: 12, 24, 36, 48, 60
   - Can be any number

9. **Set Monthly Payment**
   - Minimum $50 required
   - System enforces minimum
   - Customer pays this amount monthly

10. **Set Payment Due Day**
    - 1st of month
    - 15th of month
    - Choose based on customer preference

11. **Add Internal Notes**
    - Document reason for custom terms
    - Record special arrangements
    - Example: "eBay auction winner - down payment was bid amount of $247"

12. **Click "Create Custom Loan"**

**System Actions:**
- Creates loan with custom terms
- Records down payment (if > $0) with payment_method = 'custom_loan'
- Records processing fee (if > $0) with payment_method = 'custom_loan'
- Sets property status to "Pending"
- Customer can now make monthly payments through normal dashboard
- **Does NOT charge Square** (no real payment processed)

**Important Notes:**
- ✅ Great for testing without real money
- ✅ Perfect for eBay auction workflows
- ✅ Customer makes monthly payments normally via Square
- ⚠️ Currently cannot collect down payment via Square at creation time
- ⚠️ Workaround: Create loan, then customer pays manually, or collect payment separately
- ⚠️ Mobile design needs polish (works but not as pretty as other pages)

**Tax and HOA:**
- Custom Loan Creator does NOT set tax/HOA amounts
- After creating loan, edit the property to add:
  - Annual Tax Amount
  - Monthly HOA Fee
- These will be included in customer's monthly payment breakdown

**Example Use Case - eBay Auction:**
1. List property on eBay: "Bid on Your Down Payment!"
2. Winner bids $500 (down payment amount)
3. After auction ends:
   - Customer registers on website
   - You create custom loan:
     - Down Payment: $500 (bid amount)
     - Processing Fee: $0 (waived for auction)
     - Interest Rate: 15% (special rate)
     - Term: 48 months
     - Monthly Payment: $75
     - Notes: "eBay auction winner - Bid #123456789"
4. Customer makes monthly payments normally

**Known Limitations:**
- Cannot auto-calculate term based on payment amount (coming soon)
- Cannot collect Square payment at creation (coming soon)
- Mobile UI needs improvement (works but not polished)

### Importing Existing Loans with Payment History

**Purpose:**  
Import loans from previous systems, portfolio acquisitions, or when taking over existing financing from another seller.

**When to Use:**
- Acquiring properties with existing financing
- Portfolio purchases with payment history
- Consolidating loans from previous systems
- Taking over seller financing from another party

**What Gets Imported:**
- Loan details (amount, rate, term, payment)
- Complete payment history (principal, interest, tax, HOA breakdown)
- Property tax payment history
- Current balance and next payment date
- Original contract date

**Important: Amended Contracts**

When you import a loan with payment history, the system automatically generates an "Amended and Restated Contract for Deed" instead of a standard contract.

**Amended Contract Features:**
- References original contract date
- Shows number of payments made
- Displays total principal paid to date
- Shows current remaining balance
- Uses legal language acknowledging the original agreement

**Example Amended Contract Language:**
```
AMENDED AND RESTATED CONTRACT FOR DEED

This Amended and Restated Contract for Deed amends and restates the 
original Contract for Deed dated June 15, 2021. The Purchaser has made 
42 payment(s) toward the original balance, totaling $4,378.34 in 
principal payments. The remaining balance of Three Thousand Five Hundred 
Twenty and 66/100 dollars ($3,520.66) is due and payable...
```

**How It Works:**
1. System checks if loan has existing payment history
2. If payments exist → Generates amended contract automatically
3. If no payments → Generates standard contract
4. You don't have to do anything - it's automatic

**Importing Process:**

1. **Navigate to Import Tool**
   - Admin Dashboard → Loan Management
   - Click "Import Existing Loan" button

2. **Enter Loan Details**
   - Select customer (must be registered)
   - Select property
   - Purchase price
   - Down payment amount
   - Processing fee paid
   - Interest rate
   - Term in months
   - Monthly payment
   - Current balance remaining
   - Next payment date
   - Payment due day (1st or 15th)
   - Original purchase/contract date

3. **Enter Payment History**
   - For each payment made:
     - Payment date
     - Principal amount
     - Interest amount
     - Tax amount (if collected)
     - HOA amount (if collected)
     - Late fee (if any)
   - System calculates total payment automatically

4. **Enter Tax Payment History** (if applicable)
   - For each tax payment made to county:
     - Payment date
     - Amount paid
     - Tax year
     - Payment method (check, wire, etc.)
     - Notes

5. **Click "Import Loan"**

**System Actions:**
- Creates loan with all details
- Imports all payment history with proper breakdowns
- **Automatically populates `loan_payment_amount` field** (principal + interest)
- Imports tax payment history
- Sets property status to "Sold"
- Customer can immediately make payments
- **Contract generation will automatically use amended template**

**Critical Technical Note:**
The system automatically calculates and stores `loan_payment_amount = principal + interest` for each imported payment. This ensures accurate revenue reporting across all financial reports.

**Contract Generation After Import:**
1. Import the loan (as described above)
2. Navigate to Loan Management
3. Find the imported loan
4. Click "Generate Contract"
5. **System automatically detects payment history**
6. **Generates Amended and Restated Contract** with:
   - Original contract date from import
   - Number of payments made
   - Total principal paid
   - Current balance
7. Review the contract
8. Sign as admin when ready
9. Customer can view and sign

**Customer Mailing Address Requirement:**
- Customer MUST update their mailing address in Account Settings
- If address is missing, contract shows placeholder text
- Delete and regenerate contract after customer updates address

**Best Practices:**
- Import all historical payments for accurate records
- Include tax payments for escrow reconciliation
- Verify customer has updated their mailing address before generating contract
- Document source of imported data in loan notes
- Double-check current balance calculation
- Test payment processing after import

**Example Use Case:**

You purchase a portfolio of 5 properties from another seller. Each property has an existing loan with 2 years of payment history.

1. Register each customer on your system
2. Import each property into Property Management
3. For each loan:
   - Import loan details and payment history
   - Import tax payment records
   - Verify current balance
4. Ask customers to update mailing addresses in Account Settings
5. Generate amended contracts for each loan
6. Customers sign new contracts
7. Customers continue making payments to you

**Revenue Reporting:**
All imported payments appear correctly in:
- Financial Reports → Overview
- Tax Summary Reports
- Payment Tracking
- Monthly revenue breakdowns

The `loan_payment_amount` field is automatically populated, so imported revenue shows accurately alongside new payments.

\### Loan Management Dashboard



\*\*Summary Cards (Top):\*\*

\- \*\*Active Loans\*\* - Currently being paid

\- \*\*Overdue\*\* - Past due date (red indicator)

\- \*\*Paid Off\*\* - Completed loans



\*\*Filter Buttons:\*\*

\- \*\*All\*\* - Every loan in system

\- \*\*Active\*\* - Currently paying, not overdue

\- \*\*Overdue\*\* - Past due date

\- \*\*Paid Off\*\* - Balance = $0

\- \*\*Defaulted\*\* - Marked as default



\*\*Search Bar:\*\*

\- Search by customer name, email, or property title

\- Real-time filtering



\### Understanding the Loan Table



\*\*Desktop View Columns:\*\*



1\. \*\*Customer\*\*

&nbsp;  - Name

&nbsp;  - Email

&nbsp;  - Phone number



2\. \*\*Property\*\*

&nbsp;  - Property title

&nbsp;  - Location



3\. \*\*Balance\*\*

&nbsp;  - Remaining amount owed

&nbsp;  - In green (forest green color)



4\. \*\*Monthly\*\*

&nbsp;  - Regular monthly payment amount



5\. \*\*Due Date\*\*

&nbsp;  - Next payment due date

&nbsp;  - If overdue: Shows "X days late" in red



6\. \*\*Profit\*\* (if acquisition cost tracked)

&nbsp;  - Sale price minus acquisition cost

&nbsp;  - Green if positive, red if negative



7\. \*\*ROI\*\* (if acquisition cost tracked)

&nbsp;  - Return on investment percentage

&nbsp;  - In gold color



8\. \*\*Alerts\*\*

&nbsp;  - Payment due day selector (1st or 15th)

&nbsp;  - Alert toggle (🔔 On / 🔕 Off)

&nbsp;  - Send Notice button (30+ days overdue)

&nbsp;  - Waive Late Fee button (7+ days overdue)

&nbsp;  - Default button



\### Loan Status Indicators



\*\*Visual Indicators:\*\*



\*\*Active, Current:\*\*

\- White background

\- Next payment date shown

\- No special badges



\*\*Overdue:\*\*

\- Light red background (#fff5f5)

\- "X days late" in red text

\- Shows days overdue count



\*\*Notice Sent:\*\*

\- "Notice Sent \[date]" badge (gray)

\- Indicates default notice was mailed



\*\*Defaulted:\*\*

\- Red "Defaulted" badge

\- Shows default date

\- Property automatically returned to Available



\### Payment Due Day Management



\*\*Feature:\*\*

Each loan can have payments due on either:

\- \*\*1st of month\*\*

\- \*\*15th of month\*\*



\*\*How to Change:\*\*

1\. Find loan in Loan Management

2\. Look in "Alerts" column

3\. Select "1st" or "15th" from dropdown

4\. Confirm change

5\. Next payment will be calculated from new due day



\*\*Use Cases:\*\*

\- Customer gets paid on 15th, wants payments due on 15th

\- Aligning with customer's payday

\- Splitting customers across two due dates for cash flow management



\*\*System Behavior:\*\*

\- Changes apply to NEXT payment only

\- Does NOT change current overdue status

\- Customer's dashboard updates immediately



\### Alert Management



\*\*Alert Toggle:\*\*

\- \*\*🔔 Alerts On\*\* (green button) - Customer sees overdue warnings

\- \*\*🔕 Alerts Off\*\* (yellow button) - Customer does NOT see warnings



\*\*When to Disable Alerts:\*\*

\- Customer has special payment arrangement

\- You've agreed to extension

\- Customer is in active communication about payment plan

\- Temporary financial hardship with agreement



\*\*Important:\*\*

\- System still tracks payment dates

\- Late fees still apply (you can waive them separately)

\- Only disables customer-facing warning banners

\- Does NOT prevent you from sending default notice



\*\*Re-enabling Alerts:\*\*

\- Click button again

\- Toggles back to "🔔 Alerts On"

\- Customer immediately sees warnings if overdue



---



\## Sending Default Notices



\### When to Send a Notice



\*\*Legal/Business Trigger:\*\*

\- Customer is 30+ days past due

\- You've attempted contact (phone/email)

\- No response or no payment arrangement made



\*\*System Shows:\*\*

\- "📨 Send Notice" button appears when 30+ days late

\- Button only visible for qualifying loans



\### Notice Sending Process



\*\*Step-by-Step:\*\*



1\. \*\*Click "📨 Send Notice"\*\* on overdue loan



2\. \*\*Fill Notice Form:\*\*



&nbsp;  \*\*Notice Date:\*\*

&nbsp;  - Date you're sending the letter

&nbsp;  - Typically today's date

&nbsp;  - Used to calculate cure deadline



&nbsp;  \*\*Postal Method:\*\*

&nbsp;  - Certified Mail

&nbsp;  - Certified Mail with Return Receipt (recommended)

&nbsp;  - Priority Mail

&nbsp;  - Overnight

&nbsp;  

&nbsp;  \*\*Why Certified Mail with Return Receipt:\*\*

&nbsp;  - Legal proof of delivery

&nbsp;  - Customer must sign for it

&nbsp;  - You get return receipt

&nbsp;  - Best protection if legal action needed



&nbsp;  \*\*Postal Cost:\*\*

&nbsp;  - Enter ACTUAL cost you paid

&nbsp;  - Include tracking and return receipt costs

&nbsp;  - Example: $10.50 for certified mail

&nbsp;  - Customer will be charged this exact amount



&nbsp;  \*\*Tracking Number:\*\*

&nbsp;  - USPS tracking number from receipt

&nbsp;  - Required field

&nbsp;  - Keep for your records

&nbsp;  - Customer can't see this (admin only)



&nbsp;  \*\*Notes:\*\*

&nbsp;  - Record contact attempts

&nbsp;  - Document customer communication

&nbsp;  - Add relevant details

&nbsp;  - Example: "Called 3 times, left voicemails on 10/1, 10/5, 10/8. No response. Sent email 10/10. No reply."



3\. \*\*Review Warning Box:\*\*

&nbsp;  - Shows fees that will be added:

&nbsp;    - Default/Cure Notice Fee: $75.00

&nbsp;    - Postal/Certified Mail Fee: $X.XX

&nbsp;  - Shows cure deadline date (7 days from notice date)

&nbsp;  - Shows message customer will see



4\. \*\*Click "Record Notice Sent"\*\*



\*\*System Actions:\*\*

1\. Records notice sent date

2\. Calculates cure deadline (notice date + 7 days)

3\. Adds $75 notice fee to customer's next payment

4\. Adds postal cost to customer's next payment

5\. Changes button to show "Notice Sent \[date]"

6\. Customer immediately sees RED default warning on dashboard



\### What Customer Sees After Notice Sent



\*\*On Their Dashboard:\*\*



Large red warning box at top of loan card:

```

⚠️ DEFAULT NOTICE - IMMEDIATE ACTION REQUIRED



Your loan is officially in DEFAULT.



YOU HAVE X DAYS TO CURE THE DEFAULT



Cure Deadline: Thursday, November 14, 2025



FAILURE TO PAY WILL RESULT IN:

\- Forfeiture of all payments made to date

\- Loss of all rights to the property

\- Immediate repossession proceedings

\- Property will be resold



Contact us IMMEDIATELY:

(920) 716-6107

greenacreslandinvestments@gmail.com

```



\*\*On Their Payment Page:\*\*



Payment breakdown shows:

\- Monthly Loan Payment: $201.70

\- Late Fee: $35.00

\- Default/Cure Notice Fee: $75.00

\- Postal/Certified Mail Fee: $10.50

\- Total Due: $\[calculated total]



\### Cure Deadline Management



\*\*What is Cure Deadline:\*\*

\- 7 days from notice date

\- Customer has exactly 7 days to pay

\- After deadline passes, you can repo property



\*\*System Countdown:\*\*

\- Shows "YOU HAVE X DAYS" to customer

\- Updates daily automatically

\- When deadline passes: "CURE DEADLINE HAS PASSED"



\*\*Legal Importance:\*\*

\- Different states have different requirements

\- 7 days is conservative (check your state)

\- Document everything

\- Keep all tracking receipts



\### After Notice is Sent



\*\*If Customer Pays:\*\*

\- Late fee, notice fee, and postal fee clear automatically

\- Next payment includes only regular loan payment

\- Loan returns to "Active" status

\- Notice tracking clears from system

\- Customer no longer sees default warning



\*\*If Customer Doesn't Pay by Deadline:\*\*

\- You can proceed with default process

\- Click "⚠️ Default" button (see Default Management section)

\- Or extend more time at your discretion



---



\## Waiving Late Fees



\### When to Waive



\*\*Common Scenarios:\*\*

\- First-time late payment with good history

\- Customer communication was proactive

\- Valid emergency situation

\- You want to maintain good customer relationship

\- Payment made immediately after reminder



\*\*Business Considerations:\*\*

\- One-time courtesy for good customers

\- Bank error delayed payment

\- Natural disaster or emergency

\- Customer called ahead about delay



\### How to Waive Late Fee



1\. Find loan in Loan Management

2\. Look for "Waive Late Fee" button (appears when 7+ days overdue)

3\. Click button

4\. Confirm action

5\. System removes late fee from next payment



\*\*Important:\*\*

\- Waiving is permanent (can't undo)

\- Waive BEFORE customer pays

\- Customer won't see the fee in next payment

\- \*\*You must tell customer\*\* - they won't know otherwise

\- Document why you waived it



\*\*System Actions:\*\*

\- Late fee amount set to $0

\- Customer's payment breakdown updates

\- Total due decreases by $35

\- No notification sent to customer (you must tell them)



---



\## Default Management Process



\### When to Default a Loan



\*\*Criteria:\*\*

1\. Customer is 30+ days overdue

2\. Default notice has been sent

3\. Cure deadline has passed (7 days after notice)

4\. Customer has not paid or contacted you

5\. All contact attempts exhausted



\### Marking Loan as Defaulted



\*\*Step-by-Step Process:\*\*



1\. \*\*Click "⚠️ Default" button\*\* on loan



2\. \*\*Fill Default Form:\*\*



&nbsp;  \*\*Default Date:\*\*

&nbsp;  - Date loan officially defaulted

&nbsp;  - Usually cure deadline + 1 day

&nbsp;  - Or today's date if processing late



&nbsp;  \*\*Recovery Costs:\*\*

&nbsp;  - Legal fees (attorney, court costs)

&nbsp;  - Repossession costs (travel, time)

&nbsp;  - Property cleanup/maintenance

&nbsp;  - Any costs to resell property

&nbsp;  - Example: $450.00

&nbsp;  

&nbsp;  \*\*Why Track This:\*\*

&nbsp;  - Shows true profitability

&nbsp;  - Calculates net recovery

&nbsp;  - Helps make future lending decisions



&nbsp;  \*\*Default Notes:\*\*

&nbsp;  - Document reason for default

&nbsp;  - Record all contact attempts

&nbsp;  - Include timeline of events

&nbsp;  - Add any customer communication

&nbsp;  - Example: "Customer called 11/1 saying would pay by 11/5. No payment received. No further contact. Certified mail delivered 11/8, cure deadline 11/15. No payment by deadline."



3\. \*\*Review Confirmation:\*\*

&nbsp;  - Shows property title

&nbsp;  - Shows customer name

&nbsp;  - Lists actions that will happen:

&nbsp;    - Loan status → "Defaulted"

&nbsp;    - Property status → "Available"

&nbsp;    - Net recovery calculated



4\. \*\*Click "Mark as Defaulted"\*\*



\*\*System Actions:\*\*

1\. Sets loan status to "Defaulted"

2\. Sets property status to "Available" (ready to resell)

3\. Calculates net recovery:

&nbsp;  - Total collected (down payment + all payments)

&nbsp;  - Minus recovery costs

&nbsp;  - Shows profit/loss on default

4\. Records all default information

5\. Adds to Defaulted Loans Report



\### After Defaulting a Loan



\*\*Property:\*\*

\- Automatically returned to "Available" status

\- Shows on public website immediately

\- Ready to be purchased by new customer

\- GPS coordinates and details unchanged



\*\*Customer:\*\*

\- Sees "Loan Defaulted" in their dashboard

\- Can no longer make payments on that loan

\- Other active loans (if any) unaffected

\- Account remains active for other properties



\*\*Reporting:\*\*

\- Appears in Defaulted Loans Report

\- Shows:

&nbsp; - Customer information

&nbsp; - Property details

&nbsp; - Default date

&nbsp; - Total collected before default

&nbsp; - Recovery costs

&nbsp; - Net recovery (profit or loss)



\### Defaulted Loans Report



\*\*Access:\*\*

\- From Loan Management → "📊 Defaulted Loans Report" button

\- Or direct link from admin dashboard



\*\*Report Shows:\*\*

\- All defaulted loans

\- Total defaults count

\- Total amount lost

\- Total recovery costs

\- Net recovery/loss

\- Average loss per default



\*\*Use For:\*\*

\- Business analysis

\- Tax reporting

\- Lending criteria refinement

\- Identifying risk patterns



---



\## Payment Tracking



\### Payment Tracking Overview



View complete history of all payment transactions processed through Square.



\### Payment Table Columns



\*\*Customer Information:\*\*

\- Customer name

\- Email address



\*\*Payment Details:\*\*

\- Property title

\- Payment date/time

\- Payment method (Credit Card via Square)



\*\*Amount Breakdown:\*\*

\- Total amount charged

\- Loan payment portion

\- Tax amount (if applicable)

\- HOA amount (if applicable)

\- Late fee (if applicable)

\- Notice fee (if applicable)

\- Convenience fee ($5)

\- Square processing fee



\*\*Transaction Info:\*\*

\- Transaction ID (Square)

\- Status (Completed/Failed/Refunded)



\### Filtering Payments



\*\*Status Filters:\*\*

\- \*\*All\*\* - Every transaction

\- \*\*Completed\*\* - Successfully processed

\- \*\*Failed\*\* - Payment declined or error

\- \*\*Refunded\*\* - Payment reversed



\*\*Search:\*\*

\- Customer name

\- Email

\- Property title



\### Understanding Payment Status



\*\*Completed:\*\*

\- Green badge

\- Payment successfully processed

\- Funds deposited to your Square account

\- Loan balance reduced

\- Customer payment history updated



\*\*Failed:\*\*

\- Red badge

\- Payment declined by card issuer

\- Customer needs to retry

\- No balance change

\- Customer should be notified



\*\*Refunded:\*\*

\- Yellow badge

\- Payment was reversed

\- Typically only by manual action in Square dashboard

\- Balance restored to loan

\- Rare occurrence



\### Payment Breakdown Details



\*\*Loan Payment Amount:\*\*

\- Portion applied to principal and interest

\- Main payment that reduces balance



\*\*Tax Amount:\*\*

\- Monthly property tax collection

\- Goes to escrow

\- Tracked separately for tax payments



\*\*HOA Amount:\*\*

\- Monthly HOA fee

\- Tracked separately

\- Used to pay HOA association



\*\*Late Fee:\*\*

\- $35 if payment overdue

\- Your income

\- Applied when payment late



\*\*Notice Fee:\*\*

\- $75 if default notice sent

\- Covers administrative costs

\- One-time fee per default notice



\*\*Postal Fee:\*\*

\- Actual postal/certified mail cost

\- Reimbursement for mailing notice

\- Variable amount based on postal service



\*\*Convenience Fee:\*\*

\- $5 credit card processing fee

\- Your income to offset Square fees

\- Charged on all payments



\*\*Square Processing Fee:\*\*

\- 2.9% + $0.30

\- Square's fee (your expense)

\- Automatically deducted by Square



\### Exporting Payment Data



\*\*Coming Soon Feature:\*\*

\- Export to CSV

\- Excel format export

\- Custom date ranges

\- Filtered exports



\*\*Current Workaround:\*\*

\- Access Square Dashboard directly

\- Download reports from Square

\- Use Square reporting tools



---



\## Financial Reports



\### Reports Overview



Comprehensive financial analytics and tracking across four main categories:

1\. Revenue Summary

2\. Tax Escrow Tracking

3\. HOA Fee Tracking

4\. Outstanding Balances



\### Accessing Reports



\*\*URL:\*\* Admin Dashboard → Financial Reports  

\*\*Navigation Tabs:\*\* Overview / Tax Escrow / HOA Tracking / Outstanding Balances



---



\### Overview Tab



\*\*Revenue Summary Cards:\*\*



\*\*Total Revenue:\*\*

\- All money collected through system

\- Includes: loans, fees, taxes, HOA

\- Gross revenue (before Square fees)



\*\*Loan Payments:\*\*

\- Only principal + interest portions

\- Excludes fees, taxes, HOA

\- True lending income



\*\*Late Fees:\*\*

\- Total late fees collected

\- $35 per late payment

\- Additional income from overdue loans



\*\*Notice Fees:\*\*

\- Total default notice fees

\- $75 per notice sent

\- Administrative cost recovery



\*\*Fee Breakdown Table:\*\*



Shows detailed breakdown of all money types:



| Category | Purpose | Type |

|----------|---------|------|

| Tax Collected (Escrow) | Property taxes | Held for payment |

| HOA Fees Collected | HOA dues | Held for payment |

| Convenience Fees | CC processing | Your income |

| Postal Fees (Reimbursed) | Mailing costs | Cost recovery |

| Square Processing Fees | Payment processing | Your expense |



\*\*Monthly Trends (Last 12 Months):\*\*



Table showing:

\- Month and year

\- Total revenue

\- Loan payments

\- Total fees

\- Number of payments



\*\*Use Cases:\*\*

\- Track revenue growth month-over-month

\- Identify seasonal patterns

\- Forecast cash flow

\- Analyze payment frequency



---



\### Tax Escrow Tab



\*\*Purpose:\*\*

Track property tax collections to ensure you have adequate funds to pay annual property taxes.



\*\*How Property Tax Works:\*\*



1\. Customer pays monthly tax amount with their loan payment

2\. You collect and hold in escrow (separate account recommended)

3\. When annual tax bill comes due, you pay it from escrow

4\. Should always have enough collected



\*\*Tax Escrow Table Columns:\*\*



\*\*Property:\*\*

\- Property title

\- Which property this tracking applies to



\*\*Annual Tax:\*\*

\- Full yearly property tax amount

\- Set when adding/editing property



\*\*Collected:\*\*

\- How much collected so far from customer

\- Sum of all tax payments made to date

\- In green



\*\*Balance:\*\*

\- Annual tax minus collected

\- How much more needs to be collected

\- If negative: collected more than annual (customer paying ahead)

\- If positive: still need to collect this much



\*\*Example:\*\*



| Property | Annual Tax | Collected | Balance |

|----------|------------|-----------|---------|

| 5 Acre Retreat | $150.00 | $75.00 | $75.00 |



\*\*Interpretation:\*\*

\- Annual tax = $150

\- Customer has made 6 payments of $12.50 each = $75

\- Still need $75 more to cover full year

\- After 12 months, collected = annual tax



\*\*Best Practices:\*\*

\- Review monthly

\- Ensure collected amount grows

\- Plan for annual tax payments

\- Keep escrow in separate account

\- Pay taxes on time to avoid penalties



---



\### HOA Tracking Tab



\*\*Purpose:\*\*

Track HOA fee collections to ensure you can pay HOA associations on customer's behalf.



\*\*How HOA Fees Work:\*\*



1\. Customer pays monthly HOA fee with their loan payment

2\. You collect these fees

3\. You pay HOA association monthly/quarterly (per their schedule)

4\. You're responsible for timely HOA payments



\*\*HOA Tracking Table Columns:\*\*



\*\*Property:\*\*

\- Property title

\- Which property has HOA



\*\*Monthly Fee:\*\*

\- Customer's monthly HOA amount

\- Set when adding/editing property



\*\*Total Collected:\*\*

\- All HOA fees collected to date

\- Sum of all payments

\- Your available balance to pay HOA



\*\*Payments:\*\*

\- Number of payments made by customer

\- Helps verify expected collection



\*\*Example:\*\*



| Property | Monthly Fee | Collected | Payments |

|----------|-------------|-----------|----------|

| Lake View Lot | $25.00 | $150.00 | 6 |



\*\*Interpretation:\*\*

\- Monthly fee = $25

\- 6 payments made × $25 = $150 collected

\- You have $150 to pay HOA

\- If HOA bills quarterly: $75 per quarter



\*\*Best Practices:\*\*

\- Know HOA payment schedule (monthly/quarterly/annual)

\- Pay HOA on time to avoid fines

\- Keep collected HOA separate from other income

\- Verify collection matches expected (payments × monthly fee)

\- Communicate with HOA about customer's account



---



\### Outstanding Balances Tab



\*\*Purpose:\*\*

Track total outstanding loan portfolio and identify risk exposure.



\*\*Summary Cards:\*\*



\*\*Total Outstanding:\*\*

\- Sum of all active loan balances

\- Total amount customers owe you

\- Key metric for portfolio value



\*\*Total Loans:\*\*

\- Number of active loans

\- Count of current customers paying



\*\*Overdue:\*\*

\- Number of loans past due date

\- Risk indicator

\- Needs attention



\*\*In Default:\*\*

\- Loans with default notice sent

\- Highest risk category

\- May lead to defaults



\*\*Outstanding Loans Table:\*\*



Shows each active loan with:

\- Customer name and contact

\- Property title

\- Remaining balance

\- Days overdue (if applicable)

\- Status badge (Current/Overdue/In Default)



\*\*Status Indicators:\*\*



\*\*CURRENT (green):\*\*

\- Payment not yet due

\- Or paid on time

\- No action needed



\*\*OVERDUE (yellow/orange):\*\*

\- Past due date

\- Before 30 days or no notice sent

\- Needs contact



\*\*IN DEFAULT (red badge):\*\*

\- Default notice has been sent

\- Cure deadline active or passed

\- High risk of defaulting



\*\*Use Cases:\*\*

\- Calculate total portfolio value

\- Assess risk exposure

\- Identify problem loans quickly

\- Plan cash flow based on expected payments

\- Monitor default risk



\*\*Example Analysis:\*\*



If report shows:

\- Total Outstanding: $125,000

\- Overdue Loans: 3

\- In Default: 1



\*\*Interpretation:\*\*

\- Healthy portfolio of $125K

\- 3 loans need attention (call customers)

\- 1 loan may default (prepare for loss/recovery)



---



\## Business Operations



\### Daily Operations Workflow



\*\*Morning Routine (5-10 minutes):\*\*



1\. \*\*Check Admin Dashboard\*\*

&nbsp;  - Review quick stats

&nbsp;  - Note any changes from yesterday



2\. \*\*Review Loan Management\*\*

&nbsp;  - Click "Overdue" filter

&nbsp;  - Note loans approaching 30 days

&nbsp;  - Plan contact attempts for day



3\. \*\*Check Email\*\*

&nbsp;  - Customer payment inquiries

&nbsp;  - Square payment notifications

&nbsp;  - Any customer questions



\*\*As Customers Call (Throughout Day):\*\*



1\. \*\*Pull Up Customer Record\*\*

&nbsp;  - Admin → Customer Management

&nbsp;  - Search by name or phone

&nbsp;  - Click to see full details



2\. \*\*Discuss Payment\*\*

&nbsp;  - Confirm balance from Loan Management

&nbsp;  - Explain payment breakdown if needed

&nbsp;  - Discuss payment arrangements if struggling



3\. \*\*Take Notes\*\*

&nbsp;  - Document in loan notes

&nbsp;  - Record promises to pay

&nbsp;  - Note special circumstances



\*\*End of Day (5 minutes):\*\*



1\. \*\*Review Payment Tracking\*\*

&nbsp;  - Check completed payments for day

&nbsp;  - Note any failed payments

&nbsp;  - Follow up on failures tomorrow



2\. \*\*Review Any New Defaults\*\*

&nbsp;  - Check if any cure deadlines passed

&nbsp;  - Decide on default actions

&nbsp;  - Plan next steps



\### Weekly Operations Workflow



\*\*Monday Morning (15 minutes):\*\*



1\. \*\*Review Financial Reports - Overview\*\*

&nbsp;  - Check last week's revenue

&nbsp;  - Compare to previous weeks

&nbsp;  - Note trends



2\. \*\*Review All Overdue Loans\*\*

&nbsp;  - Filter: Overdue

&nbsp;  - Prioritize by days overdue

&nbsp;  - Plan week's collection calls



3\. \*\*Check Properties\*\*

&nbsp;  - Any new Coming Soon ready to activate?

&nbsp;  - Any pending sales to finalize?

&nbsp;  - Update statuses as needed



\*\*Mid-Week (10 minutes):\*\*



1\. \*\*Follow Up Collection Calls\*\*

&nbsp;  - Seriously overdue (15-29 days)

&nbsp;  - Document contact attempts

&nbsp;  - Send emails if no phone answer



2\. \*\*Check Tax Escrow Report\*\*

&nbsp;  - Ensure adequate reserves

&nbsp;  - Plan for upcoming tax payments

&nbsp;  - Note any shortfalls



\*\*Friday Afternoon (15 minutes):\*\*



1\. \*\*Review Week's Activity\*\*

&nbsp;  - Payments received

&nbsp;  - Defaults avoided

&nbsp;  - Successful collections



2\. \*\*Plan Next Week\*\*

&nbsp;  - Upcoming payment due dates

&nbsp;  - Potential default notices to send

&nbsp;  - Properties to list



3\. \*\*Check HOA Tracking\*\*

&nbsp;  - Upcoming HOA payments due

&nbsp;  - Verify adequate collected fees

&nbsp;  - Schedule HOA payments



\### Monthly Operations Workflow



\*\*First Week of Month (30 minutes):\*\*



1\. \*\*Comprehensive Financial Review\*\*

&nbsp;  - Review all four report tabs

&nbsp;  - Download data from Square

&nbsp;  - Calculate true profit (revenue - Square fees - expenses)



2\. \*\*Tax Escrow Analysis\*\*

&nbsp;  - Properties with annual taxes due this month

&nbsp;  - Verify escrow adequate

&nbsp;  - Pay property taxes on time



3\. \*\*HOA Payment Review\*\*

&nbsp;  - Which HOAs bill this month

&nbsp;  - Total HOA fees to pay

&nbsp;  - Schedule HOA payments



4\. \*\*Outstanding Balances Analysis\*\*

&nbsp;  - Total portfolio value

&nbsp;  - Default risk assessment

&nbsp;  - Collection priorities



\*\*Mid-Month (20 minutes):\*\*



1\. \*\*Customer Service Check\*\*

&nbsp;  - Any recurring issues?

&nbsp;  - Common questions?

&nbsp;  - Improvement opportunities?



2\. \*\*Property Portfolio Review\*\*

&nbsp;  - Properties selling fast vs slow

&nbsp;  - Price adjustments needed?

&nbsp;  - New acquisition opportunities?



3\. \*\*Default Review\*\*

&nbsp;  - Defaulted Loans Report

&nbsp;  - Total losses month to date

&nbsp;  - Patterns in defaults (pricing? customer selection?)



\*\*End of Month (30 minutes):\*\*



1\. \*\*Month-End Close\*\*

&nbsp;  - Reconcile Square deposits

&nbsp;  - Match payments to loans

&nbsp;  - Verify balance calculations



2\. \*\*Performance Metrics\*\*

&nbsp;  - Total revenue for month

&nbsp;  - Number of sales

&nbsp;  - Number of defaults

&nbsp;  - Net profit



3\. \*\*Planning Next Month\*\*

&nbsp;  - Properties to acquire

&nbsp;  - Cash flow projections

&nbsp;  - Marketing initiatives



---



\## Troubleshooting



\### Common Issues and Solutions



\*\*Issue: Customer Says They Paid But System Shows Unpaid\*\*



\*\*Check:\*\*

1\. Payment Tracking - Search customer name

2\. Look for payment date they claim

3\. Check status (Completed/Failed)



\*\*If Payment Shows Completed:\*\*

\- Payment processed successfully

\- Loan balance should be updated

\- Check loan detail in Loan Management

\- If balance didn't update: Contact technical support



\*\*If Payment Shows Failed:\*\*

\- Explain to customer card was declined

\- They need to retry payment

\- Check if correct amount

\- Verify card details



\*\*If Payment Doesn't Exist:\*\*

\- Customer may not have completed transaction

\- Ask if they received confirmation email

\- Check Square dashboard for transaction

\- Customer needs to make payment



---



\*\*Issue: Property Shows as Available But Customer Owns It\*\*



\*\*Cause:\*\*

\- Property status not updated after sale

\- Loan created but property status unchanged



\*\*Solution:\*\*

1\. Go to Property Management

2\. Find the property

3\. Click Edit

4\. Change status to "Sold"

5\. Save changes



\*\*Prevention:\*\*

\- System should auto-update when loan created

\- If doesn't happen, manually update immediately after sale



---



\*\*Issue: Customer Past Cure Deadline But Still Wants to Pay\*\*



\*\*Your Decision Points:\*\*



\*\*Option 1: Allow Payment (Recommended for first-time):\*\*

\- Customer shows good faith

\- Extenuating circumstances

\- Long payment history

\- Let them pay (including all fees)

\- Clear default status

\- Continue loan as normal



\*\*Option 2: Proceed with Default:\*\*

\- Multiple defaults before

\- No communication

\- No valid excuse

\- Click "⚠️ Default" button

\- Repo property

\- Resell to new customer



\*\*Document Decision:\*\*

\- Add notes to loan

\- Explain reasoning

\- For future reference

\- Consistency important



---



\*\*Issue: Customer Calls About Fees They Don't Understand\*\*



\*\*Late Fee ($35):\*\*

\- Applied when payment past due date

\- $35 per late payment

\- Shows in payment breakdown

\- Can be waived at your discretion



\*\*Notice Fee ($75):\*\*

\- Applied when default notice sent

\- Covers administrative cost

\- Required after 30 days late

\- Cannot be waived (already incurred cost)



\*\*Postal Fee ($X.XX):\*\*

\- Actual cost of certified mail

\- Exact amount you paid USPS

\- Reimbursement for mailing notice

\- Cannot be waived (already incurred cost)



\*\*Convenience Fee ($5):\*\*

\- Credit card processing fee

\- Covers payment processing costs

\- Standard for all payments

\- Cannot be waived



\*\*Explain Clearly:\*\*

\- Show payment breakdown

\- Explain each line item

\- Refer to loan agreement

\- Most customers understand when explained



---



\*\*Issue: GPS Coordinates Not Working\*\*



\*\*Common Causes:\*\*

\- Wrong format (needs: latitude, longitude)

\- Switched latitude/longitude

\- Missing comma

\- Extra spaces



\*\*Correct Format:\*\*

```

44.2619, -88.4154

```



\*\*Wrong Formats:\*\*

```

44.2619,-88.4154  (space needed after comma)

-88.4154, 44.2619  (longitude first - wrong)

44.2619  (missing longitude)

```



\*\*Solution:\*\*

1\. Edit property

2\. Re-enter coordinates correctly

3\. Test by clicking GPS coordinate in property detail

4\. Should open Google Maps at correct location



---



\*\*Issue: Customer Can't Make Payment\*\*



\*\*Checklist:\*\*

1\. Is loan status "Active"? (Paid Off or Defaulted can't pay)

2\. Is Square payment form loading?

3\. Is customer entering valid card?

4\. Is payment amount correct?



\*\*If Form Not Loading:\*\*

\- Check browser console for errors

\- Try different browser

\- Clear cache

\- Check internet connection



\*\*If Card Declining:\*\*

\- Ask customer to verify card details

\- Sufficient funds?

\- Card not expired?

\- Try different card

\- Contact Square support if persistent



\*\*If Payment Too Small:\*\*

\- Minimum payment = monthly payment amount

\- Cannot pay less than minimum

\- Explain minimum required

\- Can pay more to catch up



---



\*\*Issue: Admin Can't Login\*\*



\*\*Check:\*\*

1\. Correct admin URL? (.../admin/login)

2\. Correct credentials?

3\. Token expired? (24 hours)



\*\*Solution:\*\*

\- Re-enter credentials carefully

\- Check caps lock

\- Verify password correct

\- Contact system admin if persistent



---



\*\*Issue: Reports Showing $0 or Empty\*\*



\*\*Causes:\*\*

\- No data in system yet

\- No completed payments

\- Date filter issue (future feature)



\*\*Check:\*\*

1\. Do you have active loans?

2\. Have customers made payments?

3\. Check Payment Tracking for completed payments



\*\*If Completed Payments Exist But Reports Empty:\*\*

\- Technical issue

\- Contact system support

\- May need database query



---



\## Best Practices



\### Property Management Best Practices



\*\*Always Set Acquisition Cost:\*\*

\- Even rough estimate better than nothing

\- Critical for ROI tracking

\- Helps pricing decisions

\- Documents business performance



\*\*Use Status System Correctly:\*\*

\- Coming Soon = Can't purchase yet

\- Pending = Under contract

\- Sold = Loan active, hide from public

\- Don't leave Available after sale



\*\*GPS Coordinates Matter:\*\*

\- Customers use them heavily

\- Take time to be accurate

\- Test after entering

\- Update if wrong



\*\*Property Descriptions:\*\*

\- Be accurate and honest

\- Highlight positive features

\- Mention any issues

\- Sets proper expectations



\### Customer Management Best Practices



\*\*Document Everything:\*\*

\- Every phone call

\- Every payment arrangement

\- Every broken promise

\- Helps with defaults



\*\*Be Consistent:\*\*

\- Treat all customers same way

\- Same policies for everyone

\- Document exceptions

\- Build reputation for fairness



\*\*Communicate Proactively:\*\*

\- Call before they're too late

\- Friendly reminder at 7 days

\- More serious at 15 days

\- Saves relationships



\### Loan Management Best Practices



\*\*Send Notices on Time:\*\*

\- Exactly at 30 days

\- Don't wait longer

\- Legal protection

\- Clear consequences



\*\*Keep Tracking Numbers:\*\*

\- File all USPS receipts

\- Photograph return receipts

\- Store securely

\- May need for legal action



\*\*Waive Fees Strategically:\*\*

\- First-time lates with good history

\- Valid emergency circumstances

\- Maintains customer goodwill

\- But don't be a pushover



\*\*Document Contact Attempts:\*\*

\- Date and time of calls

\- Who you spoke with

\- What was said

\- Email copies filed



\### Financial Management Best Practices



\*\*Separate Accounts:\*\*

\- Operating account (general)

\- Tax escrow account (property taxes only)

\- HOA holding account (HOA fees only)

\- Prevents commingling



\*\*Monthly Reconciliation:\*\*

\- Square deposits vs system

\- Match every payment

\- Investigate discrepancies

\- Keep accurate books



\*\*Plan for Defaults:\*\*

\- Expect 5-10% default rate

\- Build into pricing

\- Don't overextend

\- Reserve fund for losses



\*\*Track All Expenses:\*\*

\- Recovery costs

\- Property maintenance

\- Acquisition costs

\- Business overhead



\### Legal Compliance Best Practices



\*\*Consult Local Attorney:\*\*

\- Different states different rules

\- Foreclosure procedures vary

\- Redemption periods vary

\- Get proper legal advice



\*\*Keep All Records:\*\*

\- All contracts

\- All payment records

\- All correspondence

\- All notices sent



\*\*Follow Fair Lending:\*\*

\- Don't discriminate

\- Same terms for everyone

\- Document business reasons

\- Transparent practices



\*\*Maintain Insurance:\*\*

\- Business liability

\- Property insurance

\- E\&O insurance

\- Consult insurance agent



---



\## Keyboard Shortcuts \& Tips



\*\*Admin Dashboard:\*\*

\- No shortcuts currently

\- Click navigation cards

\- Use browser back button



\*\*Search Functions:\*\*

\- Start typing to search

\- Real-time filtering

\- Case-insensitive

\- Partial matches work



\*\*Date Entry:\*\*

\- Click calendar icon

\- Or type: YYYY-MM-DD

\- Today's date pre-filled



\*\*Number Entry:\*\*

\- Decimals allowed

\- Don't include $ or commas

\- System formats automatically



---



\## Mobile Admin Access



\*\*Fully Responsive:\*\*

\- All admin sections work on mobile

\- Tables convert to cards

\- Touch-friendly buttons

\- Test on phone/tablet



\*\*Best Practices Mobile:\*\*

\- Portrait mode for most sections

\- Landscape for large tables

\- Zoom if needed

\- External keyboard helpful for lot of typing



---



\## System Architecture Notes



\*\*Security:\*\*

\- All admin routes protected

\- 24-hour JWT token expiry

\- Separate from customer auth

\- HTTPS only



\*\*Data Storage:\*\*

\- PostgreSQL via Supabase

\- Real-time updates

\- Automatic backups

\- Scalable architecture



\*\*Payment Processing:\*\*

\- Square Web SDK

\- PCI compliant

\- Sandbox mode for testing

\- Production mode for real payments



---



\## Support \& Resources



\*\*Documentation Files:\*\*

\- ADMIN-QUICK-REFERENCE.md (this file's companion)

\- PROJECT-SUMMARY.md (technical documentation)

\- README.md (setup instructions)



\*\*System Status:\*\*

\- Frontend: https://www.netlifystatus.com

\- Backend: https://status.railway.app

\- Database: https://status.supabase.com

\- Payments: https://www.issquareup.com/status



\*\*Technical Support:\*\*

Contact system developer with:

\- Specific issue description

\- Screenshots if possible

\- Steps to reproduce

\- User account affected



---



\*\*Document Version:\*\* 2.0  

\*\*Last Updated:\*\* November 7, 2025  

\*\*Next Review:\*\* December 2025



---



\*This guide is maintained alongside system updates. If you notice anything outdated or have suggestions for improvement, please document them for the next revision.\*

