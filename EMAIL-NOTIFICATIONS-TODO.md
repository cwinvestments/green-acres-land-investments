\# Email Notifications - Implementation TODO



\## Overview

Green Acres Land Investments needs a comprehensive email notification system to keep customers informed throughout the loan lifecycle. This document outlines all required email notifications.



\## Email Service Setup (Required First)

\- \[ ] Choose email service provider (SendGrid, AWS SES, Mailgun, etc.)

\- \[ ] Set up email templates with company branding

\- \[ ] Configure email sending from server

\- \[ ] Add email credentials to environment variables

\- \[ ] Test email delivery



\## Priority 1: Account \& Security (CRITICAL)

\### Email Verification on Registration

\- \[ ] Generate verification token on user registration

\- \[ ] Store token in database with expiration (24 hours)

\- \[ ] Send verification email with link

\- \[ ] Prevent login until email is verified

\- \[ ] Add "Resend verification email" option

\- \[ ] Update Register.js to show "Check your email" message

\- \[ ] Add /verify-email/:token endpoint



\*\*Why this matters:\*\* Prevents fake accounts, ensures we can reach customers



\### Welcome Email (After Verification)

\- \[ ] Send welcome email after email is verified

\- \[ ] Include login link, customer support contact

\- \[ ] Brief explanation of platform features



\## Priority 2: Payment Notifications (HIGH)

\### Payment Received Confirmation

\- \[ ] Trigger email immediately after successful payment

\- \[ ] Include: Amount paid, date, confirmation number

\- \[ ] Show payment breakdown (principal, interest, tax, HOA, fees)

\- \[ ] Display new remaining balance

\- \[ ] Next payment due date



\*\*Implementation:\*\* Add to payment processing in server.js after Square payment success



\### Payment Due Reminder

\- \[ ] Send 5 days before due date

\- \[ ] Include: Amount due, due date, payment link

\- \[ ] Show current balance and payment history link



\*\*Implementation:\*\* Create scheduled job (cron) that runs daily, checks loans with upcoming payments



\### Late Payment Notices (Escalating)

\- \[ ] \*\*1 day late:\*\* Friendly reminder with grace period mention

\- \[ ] \*\*7 days late:\*\* Firm notice, late fees applied, request immediate payment

\- \[ ] \*\*15 days late:\*\* Warning of potential default, request to contact office

\- \[ ] \*\*30+ days late:\*\* Final notice, default proceedings may begin



\*\*Implementation:\*\* Daily cron job checks overdue loans, sends appropriate notice based on days overdue



\## Priority 3: Contract \& Loan Lifecycle

\### Contract Ready for Signature (Admin Signed)

\- \[ ] Send when admin signs contract

\- \[ ] Include link to view/sign contract

\- \[ ] Explain what contract covers

\- \[ ] Deadline to sign (if applicable)



\*\*Implementation:\*\* Trigger in contract signing endpoint after admin signs



\### Contract Fully Executed

\- \[ ] Send to customer after they sign

\- \[ ] Attach PDF copy of fully executed contract

\- \[ ] Confirm loan is now active

\- \[ ] Include first payment date and amount



\### Loan Paid Off Congratulations

\- \[ ] Send when final payment is made

\- \[ ] Congratulate customer on owning land free and clear

\- \[ ] Explain next steps for deed transfer

\- \[ ] Request review/referral



\## Priority 4: Account Management

\### Password Reset Confirmation

\- \[ ] Send after password is successfully reset

\- \[ ] Include security tips

\- \[ ] Link to contact support if they didn't request this



\### Account Settings Updated

\- \[ ] Send when customer updates email, address, or payment info

\- \[ ] Confirm what was changed

\- \[ ] Security notice



\## Technical Implementation Notes



\### Email Service Recommendations

\- \*\*SendGrid:\*\* 100 free emails/day, easy setup, great templates

\- \*\*AWS SES:\*\* Cheap at scale ($0.10 per 1000 emails), requires more setup

\- \*\*Mailgun:\*\* Good deliverability, 5000 free emails/month for first 3 months



\### Cron Jobs for Scheduled Emails

```javascript

// Run daily at 8 AM to check for upcoming payments and overdue loans

// Use node-cron or Railway's built-in cron jobs

```



\### Database Schema Additions Needed

```sql

-- Track email verification

ALTER TABLE users ADD COLUMN email\_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE users ADD COLUMN verification\_token VARCHAR(255);

ALTER TABLE users ADD COLUMN verification\_expires TIMESTAMP;



-- Track sent emails (optional but recommended)

CREATE TABLE email\_logs (

&nbsp; id SERIAL PRIMARY KEY,

&nbsp; user\_id INTEGER REFERENCES users(id),

&nbsp; email\_type VARCHAR(50),

&nbsp; sent\_at TIMESTAMP DEFAULT NOW(),

&nbsp; status VARCHAR(20),

&nbsp; error\_message TEXT

);

```



\### Email Template Structure

\- Consistent header with logo

\- Clear subject lines

\- Mobile-responsive design

\- Plain text alternative for all emails

\- Unsubscribe link (for non-critical emails only)

\- Company contact information in footer



\## Current Status

\- ❌ No email system implemented yet

\- ✅ Contract workflow changed to admin-signs-first (Nov 13, 2025)

\- ✅ Payment processing working via Square API



\## Next Steps

1\. Choose email service provider

2\. Set up email templates

3\. Implement email verification on registration (Priority 1)

4\. Add payment confirmation emails (Priority 2)

5\. Set up cron jobs for automated reminders

6\. Test all email flows thoroughly



\## Notes

\- Property tax reminders NOT needed (handled monthly in payment, admin pays county)

\- All payment-related emails are critical for customer trust

\- Email verification reduces fraud and ensures communication reliability

\- Consider adding SMS notifications in future for late payments

