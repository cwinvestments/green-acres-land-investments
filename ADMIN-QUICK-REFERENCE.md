\# 🌿 Green Acres Admin - Quick Reference Guide



\*\*Last Updated:\*\* November 7, 2025  

\*\*For:\*\* Admin Dashboard v2.0



---



\## 🔐 Login



\*\*URL:\*\* https://greenacreslandinvestments.com/admin/login  

\*\*Credentials:\*\* Stored in `.env` file (admin username/password)



---



\## 📊 Dashboard Overview



\*\*5 Main Sections:\*\*

1\. \*\*Property Management\*\* - Add/edit/manage listings

2\. \*\*Customer Management\*\* - View customer accounts \& loans

3\. \*\*Loan Management\*\* - Track payments, send notices, mark defaults

4\. \*\*Payment Tracking\*\* - View all payment history

5\. \*\*Financial Reports\*\* - Revenue, tax, HOA, analytics



---



\## 🏘️ Property Management - Quick Actions



\### Add New Property

1\. Click "Add New Property"

2\. Fill required fields (title, location, price, acres)

3\. Optional: Add tax amount, HOA fee, acquisition cost

4\. Add 5 GPS coordinates (NE, SE, SW, NW, Center)

5\. Set status: Available / Coming Soon / Pending / Sold

6\. Save



\### Edit Property

\- Find property → Click "Edit"

\- Update any fields

\- \*\*Change status\*\* when sold to prevent double-selling



\### Property Statuses

\- \*\*Available\*\* - Shows on public site

\- \*\*Coming Soon\*\* - Purple badge, hides financing calculator

\- \*\*Pending\*\* - Hidden from public (under contract)

\- \*\*Sold\*\* - Hidden from public, shows in Recent Sales



---



\## 👥 Customer Management - Quick Actions



\### View Customer Details

1\. Search by name/email/phone

2\. Click customer row

3\. Modal shows: Contact info, all loans, balances



\### Key Metrics Displayed

\- Active/Total loan count per customer

\- Monthly payment amount

\- Total outstanding balance

\- Contact information (email + phone)



---



\## 💰 Loan Management - Quick Actions



\### Filter Loans

\- \*\*All\*\* - Every loan

\- \*\*Active\*\* - Currently paying

\- \*\*Overdue\*\* - Past due date

\- \*\*Paid Off\*\* - Completed

\- \*\*Defaulted\*\* - Marked as default



\### Send Default Notice (30+ Days Overdue)

1\. Click "📨 Send Notice" button

2\. Fill in:

&nbsp;  - Notice Date

&nbsp;  - Postal Method (Certified Mail recommended)

&nbsp;  - Postal Cost (actual amount)

&nbsp;  - Tracking Number

&nbsp;  - Notes

3\. System automatically:

&nbsp;  - Sets cure deadline (7 days from notice)

&nbsp;  - Adds $75 notice fee

&nbsp;  - Adds postal cost to next payment

&nbsp;  - Shows countdown to customer



\### Waive Late Fee (7+ Days Overdue)

1\. Click "Waive Late Fee"

2\. Confirm

3\. \*\*Remember:\*\* Inform customer on next call



\### Mark Loan as Defaulted

1\. Click "⚠️ Default" button

2\. Fill in:

&nbsp;  - Default Date

&nbsp;  - Recovery Costs (legal, repo, cleanup)

&nbsp;  - Notes

3\. System automatically:

&nbsp;  - Sets loan to "Defaulted" status

&nbsp;  - Sets property back to "Available"

&nbsp;  - Calculates net recovery

&nbsp;  - Tracks in Defaulted Loans Report



\### Change Payment Due Day

\- Select 1st or 15th from dropdown

\- Applies to next payment cycle



\### Toggle Alerts

\- 🔔 On - Customer sees overdue banners

\- 🔕 Off - Alerts disabled (use for special arrangements)



---



\## 💳 Payment Tracking - Quick Actions



\### View Payment History

\- See all transactions

\- Filter by: All / Completed / Failed / Refunded

\- Search by customer name/email

\- Export data (coming soon)



\### Payment Details Shown

\- Customer name \& property

\- Payment amounts (loan, tax, HOA, fees)

\- Processing fees (Square + convenience)

\- Payment method \& date

\- Transaction status



---



\## 📊 Financial Reports - Quick Actions



\### Overview Tab

\*\*Revenue Summary Cards:\*\*

\- Total Revenue

\- Loan Payments

\- Late Fees Collected

\- Notice Fees Collected



\*\*Fee Breakdown:\*\*

\- Tax Collected (escrow)

\- HOA Fees Collected

\- Convenience Fees (your income)

\- Postal Fees Reimbursed

\- Square Processing Fees (your expense)



\*\*Monthly Trends:\*\*

\- Last 12 months of revenue

\- Loan payments vs fees

\- Number of payments per month



\### Tax Escrow Tab

\- Shows each property with annual tax

\- How much collected so far

\- Balance remaining to collect

\- Use to ensure you have funds for tax payments



\### HOA Tracking Tab

\- Shows properties with HOA fees

\- Total collected per property

\- Number of payments made

\- Use to track HOA payments owed to associations



\### Outstanding Balances Tab

\*\*Summary Cards:\*\*

\- Total Outstanding (all active loans)

\- Total Loans (count)

\- Overdue Loans (count)

\- In Default (count)



\*\*Loan Details:\*\*

\- Each customer's balance

\- Days overdue (if applicable)

\- Default status

\- Current/Overdue/Default badge



---



\## ⚠️ Default Process - Step by Step



\### When Customer is 8-14 Days Late

\*\*System automatically:\*\*

\- Applies $35 late fee

\- Shows yellow warning banner to customer

\- Customer sees: "Payment Overdue - Please pay ASAP"



\### When Customer is 15-29 Days Late

\*\*System automatically:\*\*

\- Shows orange warning banner to customer

\- Customer sees: "URGENT: Payment Seriously Overdue"

\- Mentions potential default notice coming



\### When Customer is 30+ Days Late

\*\*You should:\*\*

1\. Attempt contact (phone/email)

2\. Document attempts

3\. Send Default/Cure Notice:

&nbsp;  - Click "📨 Send Notice"

&nbsp;  - Mail certified letter

&nbsp;  - Enter tracking info



\*\*System automatically:\*\*

\- Adds $75 notice fee

\- Adds postal costs

\- Sets 7-day cure deadline

\- Shows RED warning to customer:

&nbsp; - "DEFAULT NOTICE - IMMEDIATE ACTION REQUIRED"

&nbsp; - Countdown to cure deadline

&nbsp; - List of consequences (forfeit payments, lose property)

&nbsp; - Your contact information



\### If Customer Doesn't Pay by Cure Deadline

\*\*You should:\*\*

1\. Click "⚠️ Default" button

2\. Enter:

&nbsp;  - Default date

&nbsp;  - Recovery costs (legal, repo, cleanup)

&nbsp;  - Notes about attempts to collect

3\. System sets:

&nbsp;  - Loan status to "Defaulted"

&nbsp;  - Property status to "Available"

&nbsp;  - Tracks net recovery amount



---



\## 🎯 Daily Admin Workflow



\### Morning Routine (5 minutes)

1\. Check Dashboard - Review stats

2\. Check Loan Management - Filter "Overdue"

3\. Review any loans approaching 30 days

4\. Plan contact attempts for seriously overdue



\### Weekly Routine (15 minutes)

1\. Review Financial Reports - Check revenue

2\. Review Tax Escrow - Ensure adequate reserves

3\. Review HOA Tracking - Plan payments to associations

4\. Review Defaulted Loans Report - Track recoveries



\### Monthly Routine (30 minutes)

1\. Review Monthly Trends - Analyze patterns

2\. Review Outstanding Balances - Total exposure

3\. Plan property acquisitions based on cash flow

4\. Review defaulted properties for resale



---



\## 💡 Pro Tips



\### Property Management

\- Always set acquisition cost for ROI tracking

\- Use "Coming Soon" for redemption period properties

\- Update GPS coordinates for accurate mapping

\- Change status promptly when sold



\### Customer Management

\- Search by phone number for quick lookup during calls

\- Use customer detail modal for full payment history

\- Note customers with multiple properties



\### Loan Management

\- Send notices exactly at 30 days (legal requirement)

\- Document all contact attempts in notice notes

\- Use "Waive Late Fee" sparingly but when appropriate

\- Always get tracking numbers for certified mail



\### Financial Reports

\- Review tax escrow monthly to ensure adequate reserves

\- Track HOA fees to avoid late payments to associations

\- Monitor Square fees to understand true profit margins

\- Use Outstanding Balances to assess risk exposure



---



\## 🚨 Emergency Procedures



\### Customer Claims They Paid But System Shows Unpaid

1\. Check Payment Tracking for transaction

2\. Verify Square dashboard shows payment

3\. Check if payment failed (rare)

4\. Contact Square support if needed

5\. Manually update if verified payment exists



\### Property Shows As Available But Customer Owns It

1\. Check loan status in Loan Management

2\. Verify property status in Property Management

3\. Update property status to "Pending" or "Sold"

4\. Should prevent double-selling



\### Customer Past Cure Deadline But Hasn't Defaulted

1\. Verify cure deadline date in Loan Management

2\. Check if payment was made after deadline

3\. Contact customer for immediate payment

4\. If no response, proceed with default process



---



\## 📞 Support Contacts



\*\*Square Payment Issues:\*\*  

\- Square Dashboard: https://squareup.com/dashboard

\- Square Support: 1-855-700-6000



\*\*Technical Issues:\*\*  

\- Netlify Status: https://www.netlifystatus.com

\- Railway Status: https://status.railway.app

\- Supabase Status: https://status.supabase.com



\*\*Customer Service Email:\*\*  

greenacreslandinvestments@gmail.com



\*\*Customer Service Phone:\*\*  

(920) 716-6107



---



\## 🔗 Quick Links



\- \*\*Customer Site:\*\* https://greenacreslandinvestments.com

\- \*\*Admin Login:\*\* https://greenacreslandinvestments.com/admin/login

\- \*\*Square Dashboard:\*\* https://squareup.com/dashboard

\- \*\*Database (Supabase):\*\* https://supabase.com/dashboard

\- \*\*API Status (Railway):\*\* https://railway.app



---



\*\*Need detailed documentation?\*\* See ADMIN-GUIDE.md for comprehensive instructions.



\*\*Questions?\*\* Check PROJECT-SUMMARY.md for complete system documentation.

