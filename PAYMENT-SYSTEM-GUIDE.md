\# 💳 Payment System Guide - Green Acres Land Investments



\*\*Last Updated:\*\* November 7, 2025  

\*\*Version:\*\* 1.0 - Initial Framework  

\*\*Status:\*\* Living Document (Updated as features are built)



---



\## 📋 Table of Contents



1\. \[Payment Types \& Line Items](#payment-types--line-items)

2\. \[Fee Structure \& Calculations](#fee-structure--calculations)

3\. \[Late Payment Process](#late-payment-process)

4\. \[Default/Notice Process](#defaultnotice-process)

5\. \[Tax Collection System](#tax-collection-system)

6\. \[HOA Fee Management](#hoa-fee-management)

7\. \[Admin Controls](#admin-controls)

8\. \[Customer Payment View](#customer-payment-view)

9\. \[Database Structure](#database-structure)

10\. \[Accounting \& Reporting](#accounting--reporting)



---



\## 💰 Payment Types \& Line Items



\### Payment Type Enum

```

\- down\_payment          Initial property purchase

\- monthly\_payment       Regular loan installment

\- tax\_payment          Property tax collection

\- late\_fee             Late payment penalty

\- notice\_fee           Default/cure notice fee

\- hoa\_fee              Homeowners association fee

```



\### Monthly Payment Breakdown (What Customer Sees)

```

Monthly Loan Payment:                  $201.70

Estimated Monthly Property Tax:        $12.50

HOA Fee:                               $25.00   (if applicable)

Late Fee:                              $35.00   (if past due)

Default/Cure Notice Fee:               $75.00   (if notice sent)

Postal/Certified Mail Fee:             $8.50    (actual cost)

──────────────────────────────────────────────

Subtotal:                              $357.70

Square Processing (2.9% + $0.30):      $10.67

Credit Card Processing Fee:            $5.00

──────────────────────────────────────────────

TOTAL DUE TODAY:                       $373.37

```



\*\*Line Items Show Only When Applicable:\*\*

\- HOA Fee: Only if property has HOA

\- Late Fee: Only if past grace period (Day 8+)

\- Notice Fee + Postal: Only after admin sends notice

\- All items clearly labeled for transparency



---



\## 📊 Fee Structure \& Calculations



\### Late Fee

\- \*\*Amount:\*\* $35.00 (configurable per loan)

\- \*\*Grace Period:\*\* 7 days after due date

\- \*\*Trigger:\*\* Day 8 after due date

\- \*\*Frequency:\*\* One-time per missed payment

\- \*\*Waivable:\*\* Yes (admin override)



\### Default/Cure Notice Fee

\- \*\*Notice Fee:\*\* $75.00 (administrative cost)

\- \*\*Postal Fee:\*\* Actual cost (entered by admin)

&nbsp; - Certified Mail: $8-$15 typically

&nbsp; - Certified + Return Receipt: $10-$18 typically

\- \*\*Trigger:\*\* Manual (admin-initiated)

\- \*\*Eligibility:\*\* Day 30+ overdue

\- \*\*One-time:\*\* Per notice event



\### Credit Card Processing Fees

\- \*\*Square Fee:\*\* 2.9% + $0.30 (actual Square charge)

\- \*\*Convenience Fee:\*\* $5.00 flat (your markup)

\- \*\*Applied To:\*\* All payments (down payment + monthly)

\- \*\*Customer Sees:\*\* Both fees separately on breakdown

\- \*\*Calculation:\*\*

```javascript

&nbsp; subtotal = loan + tax + hoa + late + notice + postal

&nbsp; squareFee = (subtotal \* 0.029) + 0.30

&nbsp; convenienceFee = 5.00

&nbsp; total = subtotal + squareFee + convenienceFee

```



\### Monthly Property Tax Calculation

\- \*\*Source:\*\* Property annual tax ÷ 12

\- \*\*Collected:\*\* Monthly with loan payment

\- \*\*Held:\*\* Escrow-style until tax due

\- \*\*Reconciled:\*\* After actual tax paid to county



\### HOA Fee (if applicable)

\- \*\*Source:\*\* Property record (monthly\_hoa\_fee field)

\- \*\*Collected:\*\* Monthly with loan payment

\- \*\*Pass-through:\*\* Paid to HOA on customer's behalf



---



\## ⏰ Late Payment Process



\### Timeline

```

DAY 1 (Due Date)

├─ Payment due (1st or 15th of month)

├─ Customer can pay without penalty

│

DAY 2-7 (Grace Period)

├─ No late fee

├─ Friendly reminder emails (future feature)

│

DAY 8 (Late Fee Triggered)

├─ $35 late fee added automatically

├─ Shows on next payment attempt

├─ Payment form highlights overdue status

│

DAY 30+ (Notice Eligible)

├─ Admin sees "Send Default Notice" button

├─ Admin decides when to send based on:

│  • Customer communication

│  • Payment history

│  • Current circumstances

└─ Manual process (not automatic)

```



\### Late Fee Logic



\*\*Automatic:\*\*

\- System checks daily for overdue payments

\- Day 8 after due date: Late fee added

\- Shows in red on customer dashboard

\- Included in next payment calculation



\*\*Customer View:\*\*

```

⚠️ PAYMENT OVERDUE

Next Payment Due: October 15, 2025

Days Overdue: 12 days

Late Fee Applied: $35.00



Your next payment includes:

\- Missed payment from October 15

\- Current month's payment

\- $35.00 late fee

```



\*\*Admin Override:\*\*

\- Can waive late fee for specific loan

\- Records reason for waiver

\- Audit trail maintained



---



\## 📨 Default/Notice Process



\### When to Send Notice



\*\*Eligibility:\*\*

\- 30+ days past due

\- Communication attempts failed

\- Customer not responding



\*\*Admin Workflow:\*\*



1\. \*\*Admin Views Loan Management Dashboard\*\*

&nbsp;  - Overdue loans highlighted in red

&nbsp;  - "Send Default Notice" button appears (30+ days)



2\. \*\*Admin Clicks "Send Default/Cure Notice"\*\*

&nbsp;  - Modal opens with form:

```

&nbsp;    Notice Type: \[Default/Cure Notice ▼]

&nbsp;    Notice Date: \[2025-11-07]

&nbsp;    Postal Method: \[Certified Mail w/ Return Receipt ▼]

&nbsp;    Postal Cost: \[$10.50]

&nbsp;    Tracking Number: \[12345678901234567890]

&nbsp;    Notes: \[Customer not responding to calls/emails]

```



3\. \*\*System Actions:\*\*

&nbsp;  - Records notice sent date

&nbsp;  - Adds $75.00 notice fee to next payment

&nbsp;  - Adds postal cost to next payment

&nbsp;  - Stores tracking number

&nbsp;  - Flags loan as "Notice Sent"

&nbsp;  - Emails customer (future feature)



4\. \*\*Customer Next Payment:\*\*

```

&nbsp;  Monthly Loan Payment:           $201.70

&nbsp;  Estimated Monthly Property Tax: $12.50

&nbsp;  Late Fee (12 days):             $35.00

&nbsp;  Default/Cure Notice Fee:        $75.00

&nbsp;  Certified Mail Fee:             $10.50

&nbsp;  ─────────────────────────────────────

&nbsp;  Subtotal:                       $334.70

&nbsp;  Square Processing Fee:          $10.01

&nbsp;  Credit Card Processing Fee:     $5.00

&nbsp;  ─────────────────────────────────────

&nbsp;  TOTAL DUE TODAY:                $349.71

```



\### Notice Fee Details



\*\*Components:\*\*

\- \*\*Notice Fee:\*\* $75.00 (your time/admin work)

\- \*\*Postal Fee:\*\* Variable (actual cost passed through)



\*\*Postal Options \& Typical Costs:\*\*

\- Regular Mail: Not recommended for notices

\- Certified Mail: $8-$10

\- Certified + Return Receipt: $10-$15

\- Overnight/Priority: $15-$25



\*\*Tracking:\*\*

\- Admin enters actual postal cost

\- Tracking number stored for reference

\- Can view notice history per loan



\*\*Payment:\*\*

\- Fees added to next payment due

\- If paid, fees clear

\- If not paid, can send second notice

\- Each notice is separate charge



---



\## 🏡 Tax Collection System



\### Setup (Admin - Per Property)



\*\*Property Tax Information:\*\*

```

Annual Tax Amount:        $150.00

1st Payment Due:          January 31

1st Payment Amount:       $75.00

2nd Payment Due:          July 31

2nd Payment Amount:       $75.00

Tax Notes:                Paid to Outagamie County Treasurer

```



\### Monthly Collection



\*\*Calculation:\*\*

```javascript

monthlyTaxAmount = annualTaxAmount / 12

// Example: $150 ÷ 12 = $12.50/month

```



\*\*Customer Loan Payment:\*\*

```

Monthly Loan Payment:           $201.70

Estimated Monthly Property Tax: $12.50  ← Collected monthly

```



\*\*Escrow Tracking:\*\*

\- System tracks total tax collected per property

\- Admin dashboard shows tax balance

\- Tax due dates highlighted



\### Tax Reconciliation (Future Feature)



\*\*Process:\*\*

1\. Admin pays actual tax to county

2\. Enters actual amount paid

3\. System calculates difference:

```

&nbsp;  Collected from customer: $150.00

&nbsp;  Actual tax paid:         $142.00

&nbsp;  ──────────────────────────────

&nbsp;  Refund due to customer:  $8.00

```

4\. Admin issues refund or applies to next payment



\*\*If Customer Owes More:\*\*

```

Collected from customer: $150.00

Actual tax paid:         $165.00

──────────────────────────────

Additional due:          $15.00

```

\- Bill customer for additional amount

\- Or apply to next year's escrow



---



\## 🏘️ HOA Fee Management



\### Setup (Admin - Per Property)



\*\*HOA Information:\*\*

```

Monthly HOA Fee:    $25.00

HOA Name:           Peaceful Meadows HOA

HOA Contact:        hoa@peacefulmeadows.com

HOA Payment Due:    1st of each month

HOA Notes:          Includes common area maintenance

```



\### Collection \& Payment



\*\*Customer Pays:\*\*

```

Monthly Loan Payment:    $201.70

Monthly Property Tax:    $12.50

HOA Fee:                 $25.00  ← Collected with payment

```



\*\*Your Responsibility:\*\*

\- Collect HOA fee from customer

\- Pay HOA on customer's behalf

\- Track payments made to HOA

\- Reconcile monthly



\*\*Admin Dashboard Shows:\*\*

\- Total HOA collected per property

\- HOA payments made

\- Balance (if any discrepancy)



---



\## 🎛️ Admin Controls



\### Loan Management Dashboard



\*\*Per-Loan Controls:\*\*



1\. \*\*Waive Late Fee\*\*

&nbsp;  - Button to remove late fee

&nbsp;  - Requires reason/note

&nbsp;  - Audit trail maintained



2\. \*\*Send Default/Cure Notice\*\*

&nbsp;  - Appears when 30+ days overdue

&nbsp;  - Opens modal with form

&nbsp;  - Records tracking info



3\. \*\*Manual Fee Adjustment\*\*

&nbsp;  - Add/remove any fee

&nbsp;  - Requires explanation

&nbsp;  - Shows in payment history



4\. \*\*View Notice History\*\*

&nbsp;  - All notices sent for this loan

&nbsp;  - Dates, tracking numbers, costs

&nbsp;  - Notes from each notice



5\. \*\*Override Payment Due Date\*\*

&nbsp;  - Change from 1st to 15th (or vice versa)

&nbsp;  - Updates next payment date

&nbsp;  - Notifies customer (future)



\### Global Settings (Future)



\*\*Default Fee Amounts:\*\*

\- Late Fee: $35.00

\- Notice Fee: $75.00

\- Convenience Fee: $5.00

\- Grace Period: 7 days



\*\*Can be customized per loan if needed\*\*



---



\## 👤 Customer Payment View



\### Payment Form Display



\*\*Clean, Itemized Breakdown:\*\*

```

┌──────────────────────────────────────────┐

│  Make a Payment - Loan #1234             │

├──────────────────────────────────────────┤

│                                          │

│  Monthly Loan Payment        $201.70    │

│  Estimated Property Tax      $12.50     │

│  HOA Fee                     $25.00     │

│  Late Fee (12 days overdue)  $35.00 🔴  │

│  ─────────────────────────────────      │

│  Subtotal                    $274.20    │

│                                          │

│  Square Processing Fee       $8.25      │

│  Credit Card Processing Fee  $5.00      │

│  ─────────────────────────────────      │

│  TOTAL DUE TODAY            $287.45     │

│                                          │

│  \[Card Information]                      │

│  \[PAY NOW]                               │

└──────────────────────────────────────────┘

```



\*\*Color Coding:\*\*

\- 🔴 Red: Late fees, overdue items

\- 🟡 Yellow: Upcoming due dates

\- 🟢 Green: Paid, on-time



\*\*Tooltips (Hover for Info):\*\*

\- Property Tax: "Estimated monthly portion. Actual tax reconciled annually."

\- Processing Fees: "Square processes all credit card payments securely."

\- Late Fee: "Applied after 7-day grace period."



\### Receipt After Payment



\*\*Email Receipt Shows:\*\*

```

Payment Confirmation - Loan #1234

Date: November 7, 2025

Amount Paid: $287.45



Breakdown:

&nbsp; Monthly Loan Payment:        $201.70

&nbsp; Property Tax (Monthly):      $12.50

&nbsp; HOA Fee:                     $25.00

&nbsp; Late Fee:                    $35.00

&nbsp; Square Processing:           $8.25

&nbsp; CC Processing Fee:           $5.00



Remaining Balance: $4,523.45

Next Payment Due: December 1, 2025

```



---



\## 💾 Database Structure



\### Updated Tables



\#### Properties Table (Additions)

```sql

-- Tax Information

annual\_tax\_amount DECIMAL(10,2)

tax\_payment\_1\_date DATE

tax\_payment\_1\_amount DECIMAL(10,2)

tax\_payment\_2\_date DATE

tax\_payment\_2\_amount DECIMAL(10,2)

tax\_notes TEXT



-- HOA Information

monthly\_hoa\_fee DECIMAL(10,2) DEFAULT 0

hoa\_name VARCHAR(255)

hoa\_contact VARCHAR(255)

hoa\_notes TEXT

```



\#### Loans Table (Additions)

```sql

-- Late Fee Configuration

late\_fee\_amount DECIMAL(10,2) DEFAULT 35.00

grace\_period\_days INTEGER DEFAULT 7



-- Notice Tracking

notice\_sent\_date DATE

notice\_tracking\_number VARCHAR(100)

notice\_postal\_cost DECIMAL(10,2)

notice\_notes TEXT

```



\#### Payments Table (Complete Breakdown)

```sql

id SERIAL PRIMARY KEY

loan\_id INTEGER REFERENCES loans(id)

user\_id INTEGER REFERENCES users(id)

amount DECIMAL(10,2) NOT NULL          -- Total amount



-- Payment Breakdown

loan\_payment\_amount DECIMAL(10,2)      -- Loan principal+interest

tax\_amount DECIMAL(10,2)               -- Monthly property tax

hoa\_amount DECIMAL(10,2)               -- HOA fee

late\_fee\_amount DECIMAL(10,2)          -- Late fee

notice\_fee\_amount DECIMAL(10,2)        -- Default notice fee

postal\_fee\_amount DECIMAL(10,2)        -- Certified mail cost

square\_processing\_fee DECIMAL(10,2)    -- Actual Square fee

convenience\_fee DECIMAL(10,2)          -- Your $5 markup



-- Metadata

payment\_type VARCHAR(50)               -- Enum type

square\_payment\_id VARCHAR(255)

status VARCHAR(50)

payment\_date TIMESTAMP

```



\#### New: Notices Table (Tracking)

```sql

CREATE TABLE loan\_notices (

&nbsp; id SERIAL PRIMARY KEY,

&nbsp; loan\_id INTEGER REFERENCES loans(id),

&nbsp; notice\_type VARCHAR(50),             -- 'default\_cure', 'final\_notice', etc.

&nbsp; notice\_date DATE NOT NULL,

&nbsp; postal\_method VARCHAR(100),          -- 'Certified Mail', 'Certified + Receipt'

&nbsp; postal\_cost DECIMAL(10,2),

&nbsp; tracking\_number VARCHAR(100),

&nbsp; notice\_fee DECIMAL(10,2),

&nbsp; notes TEXT,

&nbsp; created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

```



---



\## 📈 Accounting \& Reporting



\### Revenue Categories



\*\*What You Collect:\*\*

1\. \*\*Loan Payments\*\* → Your revenue (principal + interest)

2\. \*\*Convenience Fees\*\* → Your revenue ($5 per payment)

3\. \*\*Late Fees\*\* → Your revenue ($35 per occurrence)

4\. \*\*Notice Fees\*\* → Your revenue ($75 per notice)



\*\*What You Pay Out:\*\*

5\. \*\*Property Taxes\*\* → Pass-through (county/state)

6\. \*\*HOA Fees\*\* → Pass-through (HOA)

7\. \*\*Square Fees\*\* → Your expense (2.9% + $0.30)



\*\*What You Recoup:\*\*

8\. \*\*Postal Fees\*\* → Reimbursement (actual cost)



\### Monthly Reports (Future Feature)



\*\*Revenue Report:\*\*

```

Total Collected This Month:     $12,450.00

&nbsp; └─ Loan Payments:             $10,200.00

&nbsp; └─ Convenience Fees:          $1,250.00

&nbsp; └─ Late Fees:                 $700.00

&nbsp; └─ Notice Fees:               $300.00



Expenses This Month:            $3,240.00

&nbsp; └─ Property Taxes Paid:       $2,500.00

&nbsp; └─ HOA Fees Paid:             $400.00

&nbsp; └─ Square Processing:         $340.00



Net Revenue:                    $9,210.00

```



\*\*Tax Escrow Report:\*\*

```

Property: Peaceful 5 Acre Retreat

Annual Tax: $150.00

Collected YTD: $100.00 (8 months × $12.50)

Paid to County: $0.00 (due Jan 31)

Balance: $100.00 ✓

```



---



\## 🔄 Implementation Status



\### Phase 1: Database Structure ⏳ Not Started

\- \[ ] Add tax fields to properties

\- \[ ] Add HOA fields to properties

\- \[ ] Add late fee fields to loans

\- \[ ] Add notice fields to loans

\- \[ ] Update payments table with breakdown

\- \[ ] Create loan\_notices table



\### Phase 2: Payment Calculation ⏳ Not Started

\- \[ ] Calculate monthly tax from annual

\- \[ ] Add HOA fee if applicable

\- \[ ] Check for late fee eligibility

\- \[ ] Calculate Square processing (2.9% + $0.30)

\- \[ ] Add $5 convenience fee

\- \[ ] Generate itemized breakdown



\### Phase 3: Payment Form UI ⏳ Not Started

\- \[ ] Display itemized breakdown

\- \[ ] Color-code overdue items (red)

\- \[ ] Show tooltips for fees

\- \[ ] Calculate total with all fees

\- \[ ] Update Square payment amount



\### Phase 4: Admin Controls ⏳ Not Started

\- \[ ] Add HOA fields to property form

\- \[ ] "Send Notice" button in Loan Management

\- \[ ] Notice modal with tracking form

\- \[ ] Waive late fee button

\- \[ ] Notice history view



\### Phase 5: Reporting ⏳ Not Started

\- \[ ] Tax escrow balance tracking

\- \[ ] HOA payment tracking

\- \[ ] Revenue breakdown reports

\- \[ ] Fee collection summaries



---



\## 📝 Notes \& Best Practices



\### Customer Communication

\- Always explain fees clearly

\- Provide breakdown before payment

\- Send email receipts with itemization

\- Be transparent about tax/HOA pass-through



\### Legal Compliance

\- Check state laws on late fees (caps/limits)

\- Review notice requirements by state

\- Maintain detailed records for all fees

\- Keep copies of all sent notices



\### Business Operations

\- Send notices via certified mail with return receipt

\- Document all customer communication

\- Be consistent with fee application

\- Consider payment plans for hardship cases



---



\## 🔮 Future Enhancements



\### Planned Features

\- \[ ] Automated email reminders (Day 3, 5, 7)

\- \[ ] SMS payment reminders

\- \[ ] Payment plans for past-due accounts

\- \[ ] Auto-pay enrollment option

\- \[ ] Tax reconciliation dashboard

\- \[ ] HOA payment automation

\- \[ ] Customer payment history PDF export

\- \[ ] Admin monthly financial reports



\### Under Consideration

\- \[ ] Partial payment allocation rules

\- \[ ] Early payoff calculator

\- \[ ] Interest rate buydown options

\- \[ ] Seasonal payment plans

\- \[ ] Hardship forbearance tracking



---



\*\*Last Updated:\*\* November 7, 2025  

\*\*Next Update:\*\* After Phase 1 implementation  

\*\*Maintained By:\*\* Claude Weidner \& AI Assistant



\*\*Living Document:\*\* This guide will be updated as features are built and business processes evolve.

