# Next Session Handoff Prompt

**Copy this entire message to start the next session:**

---

Hi Claude! I'm continuing work on my Green Acres Land Investments platform. Here's what you need to know:

## Quick Context
- **Project:** Land financing platform (React/Node.js/PostgreSQL)
- **Location:** C:\Projects\GreenAcres
- **Stack:** React (Netlify) + Node.js/Express (Railway) + PostgreSQL (Supabase)
- **Last Session:** November 14, 2025

## What We Just Completed
1. ✅ **Mobile Responsiveness Overhaul** - All admin and client pages now fully responsive
2. ✅ **Eliminated Horizontal Scrolling** - Desktop tables now have mobile card alternatives
3. ✅ **Standardized Code Patterns** - Consistent `flexWrap: 'wrap', gap: '1rem'` across all pages
4. ✅ **Fixed Grid Layouts** - Changed rigid grids to `repeat(auto-fit, minmax(250px, 1fr))`
5. ✅ **Button Layout Consistency** - All client-side buttons now full-width on mobile

## High Priority Items for Next Session

### 1. Email Notifications System
**Priority:** HIGH - Needed for customer communication
**What's Needed:**
- Payment confirmation emails (to customer)
- Payment received notifications (to admin)
- Late payment reminders (automated)
- Default notice emails
- Password reset emails

**Current State:** No email system implemented yet

### 2. Financial Reports - Revenue Breakdown Enhancement
**File:** `client/src/pages/AdminReports.js`
**Issue:** "Fee Breakdown" section incomplete
**Fix Needed:** Rename to "Revenue Breakdown" and include:
  - Down Payments
  - Processing Fees (Doc Fees)
  - Loan Payments
  - Convenience Fees
  - Late Fees
  - Notice Fees
  - Should sum to "Total Revenue"

### 3. Custom Loan Creator Enhancements
**File:** `client/src/pages/CreateCustomLoan.js`
**Enhancements Needed:**
  - Add Square payment collection option (checkbox)
  - Auto-calculate loan term from monthly payment
  - Add optional Tax/HOA fields
  - Mobile UI polish (works but not pretty)

## Important Files to Know

### Backend (Railway)
- `server/server.js` - Main API
- `server/database.js` - PostgreSQL connection

### Frontend (Netlify)
- `client/src/pages/CustomerManagement.js` - Recently updated for mobile ✅
- `client/src/pages/AccountSettings.js` - Recently updated for mobile ✅
- `client/src/pages/CreateCustomLoan.js` - Custom loan form (needs enhancements)
- `client/src/pages/ImportLoan.js` - Recently updated for mobile ✅
- `client/src/pages/PropertyManagement.js` - Recently updated for mobile ✅
- `client/src/pages/TaxSummary.js` - Recently updated for mobile ✅
- `client/src/pages/AdminReports.js` - Needs revenue breakdown fix
- `client/src/pages/PaymentTracking.js` - Working correctly
- `client/src/api.js` - API functions

## Mobile Responsiveness - Now Complete ✅

**Standard Patterns Established:**

**Responsive Header:**
```javascript
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '1rem' }}>
```

**Responsive Grid:**
```javascript
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
```

**Full-Width Buttons (Client Pages):**
```javascript
<button className="btn" style={{ flex: '1 1 auto' }}>
```

**CSS Classes:**
- `.desktop-only` - Hidden on mobile (< 768px)
- `.mobile-only` - Visible only on mobile

## My Preferences
- Work on ONE task at a time
- Provide complete file contents for copy-paste
- Use exact FIND/REPLACE format
- Command Prompt syntax (not PowerShell)
- No explanatory text after code blocks
- Working directory: C:\Projects\GreenAcres

## Testing Setup
- Admin login: admin@greenacres.local
- Customer login: test customers in system
- Square API: Production mode (live payments)
- Database: Supabase PostgreSQL

## What to Start With

Please read the full session summary in `SESSION-HANDOFF-2025-11-14.md`, then let's discuss priorities:

1. **Email Notifications** - Most important for customer experience
2. **Revenue Breakdown Fix** - Quick win, highly visible
3. **Custom Loan Enhancements** - Nice to have

Which would you recommend tackling first?

Ready to work!