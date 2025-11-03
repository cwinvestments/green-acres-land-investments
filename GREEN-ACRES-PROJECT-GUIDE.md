# 🌿 Green Acres Land Investments - Complete Project Guide

**Last Updated:** November 3, 2025  
**Project Status:** Frontend Deployed | Backend Local | Database Connected (Supabase PostgreSQL) | Core Features Working

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Current Status](#current-status)
4. [Project Structure](#project-structure)
5. [Database Setup](#database-setup)
6. [Environment Configuration](#environment-configuration)
7. [Features Completed](#features-completed)
8. [Features In Progress](#features-in-progress)
9. [Deployment Setup](#deployment-setup)
10. [Logo & Branding](#logo--branding)
11. [Loan Tracking System](#loan-tracking-system)
12. [Known Issues](#known-issues)
13. [Next Steps](#next-steps)
14. [Development Workflow](#development-workflow)
15. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

**Business:** Green Acres Land Investments, LLC  
**Tagline:** "Your Land. Your Terms."  
**Owner:** Claude Weidner

### Business Model
- Purchase raw land at auction
- Resell with flexible owner financing
- Make land ownership accessible to everyone
- Price range: $2,000 - $10,000 typically
- Flexible payment plans with special $99 down option

### Value Proposition
Financing options that traditional lenders don't offer:
- **Special $99 Down:** 18% APR (most accessible option)
- **20% Down:** 12% APR
- **25% Down:** 8% APR
- **35% Down:** 8% APR  
- **50% Down:** 8% APR
- Loan terms: 1-5 years maximum
- $50 minimum monthly payment
- $99 processing fee on all purchases
- No early payoff penalties

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18
- **Routing:** React Router 6
- **HTTP Client:** Axios
- **Payment SDK:** Square Web SDK
- **Styling:** Modern CSS (Flexbox/Grid)
- **Hosting:** Netlify
- **Repository:** GitHub (cwinvestments organization)

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Payment Processing:** Square API
- **Hosting:** Not yet deployed (runs locally)

### Future Integrations
- **Mapping:** Google Maps API or Mapbox
- **Coordinate System:** 5-point GPS boundary system for raw land parcels
- **File Processing:** KML/KMZ/GPX import for property boundaries

### Database
- **Production:** PostgreSQL via Supabase
- **Library:** pg (node-postgres)
- **Connection:** IPv4-enabled (add-on purchased)
- **Project:** db.fywbavjylonrnaipxawn.supabase.co
- **Status:** Fully operational

---

---

## 💻 Code Architecture & Conventions

**CRITICAL FOR FUTURE DEVELOPMENT:** This section documents how the codebase is structured to avoid wasting time redoing work that's already done.

### Backend Architecture

**Server File:** `server/server.js`
- **Database Library:** `pg` (node-postgres) - NOT SQLite
- **Database Access:** Uses `db.pool.query()` with parameterized queries
- **Pattern:** `await db.pool.query('SELECT * FROM table WHERE id = $1', [value])`
- **NO `db.prepare()` calls** - that's SQLite syntax and will cause errors

**Database File:** `server/database.js`
- Exports `{ pool, initDatabase }`
- `pool` is the PostgreSQL connection pool
- `initDatabase()` creates tables if they don't exist
- Uses `pg.Pool` configured with `DATABASE_URL` environment variable

**Key Points:**
- ✅ All queries use `async/await`
- ✅ All queries use parameterized values (`$1, $2, $3...`)
- ✅ Returns `result.rows` array (PostgreSQL format)
- ✅ Use `.rows[0]` for single record, `.rows` for multiple
- ❌ NO synchronous `db.prepare().get()` or `.run()` calls
- ❌ NO `?` placeholders (that's SQLite, use `$1, $2` instead)

**Example Query Patterns:**
```javascript
// Single record
const result = await db.pool.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = result.rows[0];

// Multiple records
const result = await db.pool.query('SELECT * FROM loans WHERE user_id = $1', [userId]);
const loans = result.rows;

// Insert with RETURNING
const result = await db.pool.query(
  'INSERT INTO loans (user_id, amount) VALUES ($1, $2) RETURNING id',
  [userId, amount]
);
const newId = result.rows[0].id;
```

### Frontend Architecture

**All Page Files:** `client/src/pages/`
- Dashboard.js
- LoanDetail.js
- PaymentHistory.js
- PropertyDetail.js
- etc.

**CRITICAL Field Names (Database → Frontend):**

These field names MUST match between database and frontend code:

| Database Column | Frontend Variable | Notes |
|----------------|-------------------|-------|
| `balance_remaining` | `loan.balance_remaining` | NOT `loan.balance` |
| `loan_amount` | `loan.loan_amount` | NOT `loan.principal` |
| `purchase_price` | `loan.purchase_price` | Property price |
| `down_payment` | `loan.down_payment` | Down payment amount |
| `processing_fee` | `loan.processing_fee` | $99 fee |
| `interest_rate` | `loan.interest_rate` | APR percentage |
| `term_months` | `loan.term_months` | Loan term |
| `monthly_payment` | `loan.monthly_payment` | Monthly payment |
| `total_amount` | `loan.total_amount` | Total to be paid |

**Common Mistake to Avoid:**
- ❌ DON'T use `loan.balance` (old SQLite code used this)
- ✅ ALWAYS use `loan.balance_remaining`
- ❌ DON'T use `loan.principal` 
- ✅ ALWAYS use `loan.loan_amount`

### API Integration

**API File:** `client/src/api.js`

**Available Functions:**
- `login(credentials)` - User login
- `register(userData)` - User registration
- `getProperties()` - Get all properties
- `getProperty(id)` - Get single property
- `getLoans()` - Get user's loans (NOT `getUserLoans`)
- `getLoan(id)` - Get single loan
- `createLoan(data)` - Purchase property
- `createPayment(data)` - Make payment
- `getPaymentHistory(loanId)` - Get payment history

**Common Mistake:**
- ❌ DON'T import `getUserLoans` (doesn't exist)
- ✅ Import `getLoans` instead

### Square Payment Integration

**Environment Variables Required:**
- `REACT_APP_SQUARE_APPLICATION_ID` - Application ID (starts with `sandbox-`)
- `REACT_APP_SQUARE_LOCATION_ID` - Location ID
- `REACT_APP_SQUARE_ENVIRONMENT` - `sandbox` or `production`

**Pattern for Square Payments:**
```javascript
// 1. Initialize Square (in component)
const payments = window.Square.payments(
  process.env.REACT_APP_SQUARE_APPLICATION_ID,
  process.env.REACT_APP_SQUARE_LOCATION_ID
);

// 2. Create card instance
const card = await payments.card();
await card.attach('#card-container');

// 3. Tokenize on submit
const result = await card.tokenize();
if (result.status === 'OK') {
  // Send result.token to backend as paymentNonce
}
```

**CRITICAL:** The `#card-container` div must exist in DOM BEFORE calling `card.attach()`. 

**Solution:** Always render it (hidden initially):
```jsx
<div id="card-container" style={{ display: cardInstance ? 'block' : 'none' }}></div>
```

### File Editing Best Practices

**IMPORTANT:** VS Code has been known to cache files incorrectly on this project.

**Safe File Editing:**
1. For critical files (server.js, database.js, page components), use **Notepad** instead of VS Code
2. Always verify changes took effect:
```bash
   type filename | find "specific text"
```
3. If React doesn't pick up changes:
   - Stop client (Ctrl+C)
   - Restart: `npm start`
   - Hard refresh browser (Ctrl+Shift+R)

### Development Gotchas

1. **Two .env Files Required:**
   - `server/.env` - Backend config
   - `client/.env` - Frontend config (REACT_APP_ prefix)
   - They're different! Don't mix them up.

2. **Terminal Setup:**
   - Need 2-3 terminals running simultaneously
   - Terminal 1: Server (`cd server && npm start`)
   - Terminal 2: Client (`cd client && npm start`)
   - Terminal 3: Commands (optional)
   - Use Command Prompt, NOT PowerShell

3. **Port Management:**
   - Server: 5000
   - Client: 3000
   - If "port in use" error, close other instances

4. **PostgreSQL Connection:**
   - Requires Supabase IPv4 add-on ($4/month)
   - Connection string uses URL-encoded password
   - Test connection: Check server startup logs for "✅ Database initialized successfully"

---
```

## **Now Update the "Next Steps" Section**

Press **Ctrl+F**, search for:
```
## 📊 Current Status

### ✅ Completed

1. **Frontend**
   - Fully built and operational
   - Deployed to Netlify
   - Logo integration complete
   - Responsive design implemented
   - All pages created and tested
   - Mobile optimization complete

2. **Backend**
   - API fully built
   - Converted to PostgreSQL (from SQLite)
   - Square payment integration working
   - Authentication system complete
   - Runs locally on port 5000
   - Property status system implemented

3. **Database**
   - Supabase PostgreSQL connected and operational
   - IPv4 add-on purchased and configured ($4/month)
   - All tables created with status tracking
   - Sample properties loaded
   - Full CRUD operations working

4. **Branding**
   - Complete logo package (20 files)
   - Brand colors established
   - Navbar logo (responsive)
   - Hero section logo
   - Favicons

5. **Core Loan Features (Tested & Working)**
   - User registration and login
   - Property browsing with status filtering
   - Affordability-first calculator with live updates
   - Purchase with Square payments (with billing info)
   - Loan creation and tracking
   - Dashboard displaying active loans
   - Loan detail page with full information
   - Monthly payment processing via Square
   - Payment history tracking
   - Balance updates after payments

6. **Property Status System (November 3, 2025)**
   - ✅ Status tracking (available, pending, under_contract, sold)
   - ✅ Auto-set to "pending" on purchase
   - ✅ Filter properties by status on backend
   - ✅ "Recent Sales" public showcase page
   - ✅ Status badges with filtering (All/Pending/Under Contract/Sold)
   - ✅ Prevents double-selling of properties

7. **Advanced Calculator (November 3, 2025)**
   - ✅ Customer affordability-first design
   - ✅ All 5 payment options displayed simultaneously
   - ✅ Real-time updates based on term selection
   - ✅ Green glow highlighting closest match to desired payment
   - ✅ Smart warnings when desired payment is too far off
   - ✅ Helpful suggestions (longer/shorter terms)
   - ✅ "Your Cost Today" prominent display box
   - ✅ "Ready to Purchase" detailed summary section
   - ✅ Mobile-responsive layout

8. **Billing & Payments (November 3, 2025)**
   - ✅ Complete billing information collection
   - ✅ Name, address, city, state, ZIP required
   - ✅ State dropdown with common states
   - ✅ Validation before payment processing
   - ✅ Square card form integration
   - ✅ Professional checkout flow

9. **UI/UX Improvements (Complete)**
   - ✅ Fixed all currency formatting (decimals + commas) - 40+ changes
   - ✅ Created formatCurrency() helper function
   - ✅ Minimum payment logic fixed
   - ✅ Improved success messages
   - ✅ Button highlighting for payment selection
   - ✅ Fixed all React Hook warnings
   - ✅ Dashboard - Professional card design with hover effects
   - ✅ Properties - Beautiful cards with light green background
   - ✅ Property Detail - Two-column layout, styled calculator
   - ✅ Loan Detail - Clean info display, sticky payment form
   - ✅ Payment History - Professional table with row hover
   - ✅ Login/Register - Polished forms with focus states
   - ✅ Recent Sales - Centered cards, status badges, professional layout
   - ✅ 500+ lines of professional CSS added
   - ✅ All 7 customer-facing pages fully styled

### 🚧 In Progress

1. **Backend Deployment** (Next Major Task)
   - Need to deploy to hosting service
   - Options: Railway, Render, or Heroku
   - Environment variables configuration
   - SSL/HTTPS setup

2. **Admin Dashboard**
   - Property status management (toggle pending/contract/sold/available)
   - Property addition/editing
   - Loan oversight
   - Customer management

### ⌛ Not Started

1. **Enhanced Loan Tracking**
   - Daily interest calculation
   - Detailed payment breakdown (fees → interest → principal)
   - Admin-level tracking with all Excel columns
   - Automatic interest accrual

2. **Advanced Admin Features**
   - Property coordinate system (5-point GPS coordinates for boundaries)
   - Map integration for property boundaries
   - Detailed tracking views (all 13 Excel columns)
   - Reporting capabilities
   - Manual payment entry

3. **Additional Features**
   - Loan contract generation/viewing (DocuSign integration - Option B, or manual upload - Option A)
   - Print functionality for customer documents
   - Email notifications
   - Document upload for land deeds
   - Autopay setup

---

## 📁 Project Structure
```
C:\Projects\GreenAcres\
├── client/                      # React Frontend
│   ├── public/
│   │   ├── images/             # Logo files
│   │   │   ├── green-acres-full-logo.svg
│   │   │   ├── green-acres-horizontal.svg
│   │   │   ├── green-acres-icon.svg
│   │   │   └── green-acres-full-512.png
│   │   ├── favicon-16.png
│   │   ├── favicon-32.png
│   │   ├── favicon-64.png
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js       # Navigation with logo
│   │   ├── pages/
│   │   │   ├── Home.js         # Landing page
│   │   │   ├── Properties.js   # Property listings
│   │   │   ├── PropertyDetail.js # Property detail + calculator
│   │   │   ├── Login.js        # User login
│   │   │   ├── Register.js     # User registration
│   │   │   ├── Dashboard.js    # Customer dashboard
│   │   │   ├── LoanDetail.js   # Individual loan view
│   │   │   └── PaymentHistory.js # Payment history
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication state
│   │   ├── App.js              # Main app with routing
│   │   ├── api.js              # API helper functions
│   │   ├── index.js            # React entry point
│   │   └── index.css           # All styles
│   ├── .env                    # Client environment variables
│   └── package.json
│
├── server/                      # Node.js Backend
│   ├── server.js               # Main Express server
│   ├── database.js             # Database operations
│   ├── .env                    # Server environment variables
│   └── package.json
│
├── README.md                    # Setup instructions
├── QUICKSTART.md               # Quick start guide
├── PROJECT-SUMMARY.md          # Project summary
└── .gitignore                  # Git ignore rules
```

---

## 💾 Database Setup

### PostgreSQL via Supabase (Production)

**Connection Details:**
- **Host:** db.fywbavjylonrnaipxawn.supabase.co
- **Port:** 5432
- **Database:** postgres
- **User:** postgres
- **Password:** AlyssaMatthew0211$$!$! (URL encoded in connection string)

**Connection String Format:**
```
postgresql://postgres:AlyssaMatthew0211%24%24%21%24%21@db.fywbavjylonrnaipxawn.supabase.co:5432/postgres
```

**Note:** Special characters in password must be URL encoded:
- `$` → `%24`
- `!` → `%21`

**Status:**
- ✅ Supabase project active and healthy
- ✅ IPv4 add-on purchased and enabled
- ✅ Connection working properly
- ✅ All tables created and populated
- ✅ Full CRUD operations tested

**Tables:**
1. **users** - Customer accounts
2. **properties** - Land listings
3. **loans** - Customer loans
4. **payments** - Payment records

**Sample Properties Included:**
- Peaceful 5 Acre Retreat - $4,500
- 10 Acre Investment Property - $8,900
- 2.5 Acre Homesite - $2,200
- 20 Acre Ranch Land - $15,000
- 3 Acre Wooded Lot - $3,200
- 7.5 Acre Corner Lot - $6,800

---

🗺️ Property Coordinate System
Overview
Since Green Acres deals with raw land parcels (not traditional residential properties), properties are identified by GPS coordinates rather than street addresses. Each property requires a 5-point coordinate system for accurate boundary definition and mapping.
Coordinate Requirements
5-Point System:

Corner 1 (NE): Northeast corner latitude/longitude
Corner 2 (SE): Southeast corner latitude/longitude
Corner 3 (SW): Southwest corner latitude/longitude
Corner 4 (NW): Northwest corner latitude/longitude
Center Point: Property center latitude/longitude

Coordinate Format:

Latitude: Decimal degrees (e.g., 44.2619° N)
Longitude: Decimal degrees (e.g., -88.4154° W)
Precision: 8 decimal places for latitude, 8 for longitude (±1.1mm accuracy)

Database Schema (Future Implementation)
Properties Table - Additional Columns:
sql-- Corner 1 (Northeast)
corner1_lat DECIMAL(10, 8),
corner1_lng DECIMAL(11, 8),

-- Corner 2 (Southeast)
corner2_lat DECIMAL(10, 8),
corner2_lng DECIMAL(11, 8),

-- Corner 3 (Southwest)
corner3_lat DECIMAL(10, 8),
corner3_lng DECIMAL(11, 8),

-- Corner 4 (Northwest)
corner4_lat DECIMAL(10, 8),
corner4_lng DECIMAL(11, 8),

-- Center Point
center_lat DECIMAL(10, 8),
center_lng DECIMAL(11, 8),

-- Optional: Keep location field for general area description
location VARCHAR(255)  -- e.g., "Near Appleton, WI" or "Waupaca County"
Why DECIMAL(10,8) and DECIMAL(11,8)?

Latitude range: -90 to +90 (needs 10 digits total, 8 after decimal)
Longitude range: -180 to +180 (needs 11 digits total, 8 after decimal)
Provides millimeter-level precision

Display Options
Phase 1: Text Display (Current)
📍 Location: Near Appleton, WI
📍 Center: 44.2619° N, 88.4154° W
Phase 2: Map Link
📍 [View Property Boundaries on Map]

Links to Google Maps with polygon overlay
Uses 4 corner coordinates to draw boundary
Centers map on center_lat/center_lng

Phase 3: Embedded Map (Future)

Interactive map embedded in property detail page
Property boundary highlighted
Satellite/terrain view toggle
Nearby amenities layer

Use Cases
1. Admin Property Entry

Upload property deed/survey
Enter 5 coordinate points
System validates coordinates form a valid polygon
System calculates property acreage from coordinates

2. Customer Property View

Display center coordinates
"View on Map" button opens Google Maps
Property boundary outlined
Download KML file for GPS devices

3. Property Search (Future Enhancement)

Search properties by area
Filter by distance from location
View all properties on interactive map
Draw custom search boundary

Integration with Mapping Services
Google Maps API:

Display property boundaries
Create shareable map links
Generate static map images for documents

Potential Services:

Google Maps Platform
Mapbox
OpenStreetMap
What3Words (for easy verbal communication of locations)

Data Entry Tools (Admin Dashboard)
Planned Features:

Manual Entry: Input lat/long for each corner
Map Click: Click corners on interactive map
File Upload: Import KML/KMZ files from surveys
GPS Import: Import GPX tracks from handheld GPS units
Survey PDF Parser: Extract coordinates from PDF surveys (advanced)

Coordinate Validation
System should validate:

✅ All coordinates within valid lat/long ranges
✅ Corners form a valid quadrilateral (no crossing boundaries)
✅ Acreage calculated from coordinates matches listed acreage (±5%)
✅ Property is within service area (e.g., Wisconsin)
✅ Center point is actually inside the boundary polygon

Mobile Considerations
For customers viewing on mobile:

"Open in Google Maps" button (uses native app)
"Get Directions to Property Center" button
One-tap to call for questions about property location
Download offline map area

Privacy & Security
Coordinate data is:

✅ Public information (from county records)
✅ Necessary for property identification
✅ Already available via county GIS systems
✅ Not considered private/sensitive

Implementation Priority
When to Implement:

MVP: Not required (can use general "location" field)
Phase 2: Add coordinate fields to database
Phase 3: Build admin coordinate entry interface
Phase 4: Add customer map viewing
Phase 5: Advanced map features (search, filters, interactive maps)

Current Status:

Using text-based location field
Coordinates system documented for future implementation
Database schema designed and ready

# MULTI-STATE PROPERTY SYSTEM - ADD TO PROJECT GUIDE

## INSTRUCTIONS:
Add this as a NEW section to GREEN-ACRES-PROJECT-GUIDE.md

---

## 🗺️ Multi-State Property Management System

### Overview
As Green Acres expands into multiple states, the property system needs to support:
- Multiple images per property (up to 10)
- State and county organization
- Dynamic navigation dropdown with state/county filtering
- Admin controls to enable/disable markets as they expand
- Automatic hiding of areas with no active properties

### Target Markets

**Initial States:**
- **Arizona** - Desert land parcels
- **Colorado** - Mountain and rural properties  
- **Arkansas** - Wooded and recreational land

**Future Expansion:**
- Additional states as business grows
- Multiple counties per state
- "Coming Soon" status for planned markets

---

## 📊 Database Schema Changes

### New Table: `states`
Manages active states and display settings.

```sql
CREATE TABLE states (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  abbreviation VARCHAR(2) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT false,
  coming_soon BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial data
INSERT INTO states (name, abbreviation, is_active, sort_order) VALUES
('Arizona', 'AZ', true, 1),
('Arkansas', 'AR', true, 2),
('Colorado', 'CO', true, 3);
```

### New Table: `counties`
Manages counties within states.

```sql
CREATE TABLE counties (
  id SERIAL PRIMARY KEY,
  state_id INTEGER REFERENCES states(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(state_id, name)
);

-- Examples (add as you acquire properties):
INSERT INTO counties (state_id, name, is_active, sort_order) VALUES
(1, 'Mohave County', true, 1),     -- Arizona
(1, 'Yavapai County', true, 2),
(2, 'Baxter County', true, 1),     -- Arkansas
(3, 'Fremont County', true, 1);    -- Colorado
```

### New Table: `property_images`
Manages multiple images per property.

```sql
CREATE TABLE property_images (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  caption VARCHAR(255),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_property_images_property ON property_images(property_id);
CREATE INDEX idx_property_images_primary ON property_images(property_id, is_primary);
```

### Update: `properties` table
Replace text fields with foreign keys.

```sql
-- Add new columns
ALTER TABLE properties ADD COLUMN state_id INTEGER REFERENCES states(id);
ALTER TABLE properties ADD COLUMN county_id INTEGER REFERENCES counties(id);

-- Remove old columns (after data migration)
-- ALTER TABLE properties DROP COLUMN state;
-- ALTER TABLE properties DROP COLUMN county;

-- Add indexes
CREATE INDEX idx_properties_state ON properties(state_id);
CREATE INDEX idx_properties_county ON properties(county_id);
CREATE INDEX idx_properties_status ON properties(status);
```

---

## 🖼️ Image Upload System

### Requirements

**Maximum Images:** 10 per property
**File Formats:** JPG, PNG, WebP
**Max File Size:** 5MB per image
**Recommended Resolution:** 1920x1080px (will be auto-resized)

### Image Storage Options

**Option 1: Cloud Storage (Recommended)**
- AWS S3 / Cloudflare R2 / DigitalOcean Spaces
- Automatic CDN delivery
- Scalable and reliable
- Cost: ~$5-10/month for 1000s of images

**Option 2: Server Storage**
- Store in `/server/uploads/properties/`
- Serve via Express static middleware
- Cheaper but less scalable

**Option 3: Third-Party Service**
- Cloudinary / Uploadcare
- Automatic image optimization
- Built-in transformations
- Cost: ~$0-25/month

### Admin Upload Interface

**Features:**
1. **Drag & Drop Upload**
   - Multiple images at once
   - Progress bar for each upload
   - Preview thumbnails

2. **Image Management**
   - Reorder with drag & drop
   - Set primary image (for card thumbnail)
   - Add optional captions
   - Delete individual images

3. **Image Display**
   - Grid view of all images
   - Primary image marked with badge
   - Click to enlarge preview

### Database Operations

**Insert Image:**
```sql
INSERT INTO property_images (property_id, image_url, is_primary, sort_order, caption)
VALUES ($1, $2, $3, $4, $5);
```

**Set Primary Image:**
```sql
-- First, unset all primary flags for this property
UPDATE property_images 
SET is_primary = false 
WHERE property_id = $1;

-- Then set the new primary
UPDATE property_images 
SET is_primary = true 
WHERE id = $2;
```

**Get Property Images:**
```sql
SELECT * FROM property_images 
WHERE property_id = $1 
ORDER BY is_primary DESC, sort_order ASC;
```

---

## 🎨 Navigation Dropdown Design

### Desktop Navigation

**HTML Structure:**
```html
<nav>
  <div class="nav-dropdown">
    <button class="nav-link dropdown-toggle">
      Properties ▼
    </button>
    <div class="dropdown-menu">
      <div class="dropdown-header">Browse by State</div>
      
      <!-- State with hover submenu -->
      <div class="dropdown-item has-submenu">
        <span>Arizona</span>
        <span class="badge">8</span>
        <div class="submenu">
          <a href="/properties?state=AZ&county=mohave">Mohave County (5)</a>
          <a href="/properties?state=AZ&county=yavapai">Yavapai County (3)</a>
        </div>
      </div>
      
      <!-- Repeat for other states -->
      
      <div class="dropdown-divider"></div>
      <a href="/properties" class="dropdown-item">View All Properties</a>
    </div>
  </div>
</nav>
```

**Features:**
- Hover to expand state submenu
- Property count badges
- Auto-hide states/counties with 0 properties
- "Coming Soon" badge for planned markets
- Mobile-friendly (tap to expand)

### Mobile Navigation

**Approach:**
- Full-page overlay on mobile
- Collapsible accordions for states
- Touch-friendly tap targets
- Swipe to dismiss

---

## 🎛️ Admin Controls

### State Management

**Admin Interface:**
```
States & Counties Management
┌─────────────────────────────────────┐
│ State: Arizona (AZ)                 │
│ [ ] Active  [ ] Coming Soon         │
│ Sort Order: [1]                     │
│                                     │
│ Counties:                           │
│ - Mohave County [✓] Active          │
│ - Yavapai County [✓] Active         │
│ - Coconino County [ ] Inactive      │
│ + Add County                        │
└─────────────────────────────────────┘
```

**Features:**
1. **Enable/Disable States**
   - Toggle active status
   - Automatically hides from navigation when disabled
   - Existing properties remain but aren't visible to customers

2. **Enable/Disable Counties**
   - Fine-grained control within states
   - Automatically hides counties with 0 active properties

3. **Coming Soon Status**
   - Shows "Coming Soon" badge
   - Displays in navigation but not clickable
   - Marketing tool for future markets

4. **Sort Order**
   - Control display order in dropdown
   - Alphabetical or custom ordering

### Property Management

**Enhanced Property Form:**
```
Add/Edit Property
┌─────────────────────────────────────┐
│ State: [Arizona ▼]                  │
│ County: [Mohave County ▼]           │
│                                     │
│ Images (0/10 uploaded)              │
│ [Drag & Drop or Click to Upload]   │
│                                     │
│ [ Image 1 ] [PRIMARY] [✕]          │
│ [ Image 2 ] [Set Primary] [✕]      │
│                                     │
│ Property Details...                 │
└─────────────────────────────────────┘
```

---

## 🔄 Customer Property Filtering

### URL-Based Filtering

**Examples:**
- `/properties` - All properties
- `/properties?state=AZ` - All Arizona properties
- `/properties?state=AZ&county=mohave` - Mohave County, Arizona
- `/properties?state=CO` - All Colorado properties

### Property List Display

**Filtered View:**
```
Properties > Arizona > Mohave County

Showing 5 properties in Mohave County, Arizona

[Property Cards...]
```

**Breadcrumbs:**
- Home > Properties > Arizona > Mohave County
- Clickable navigation back up the hierarchy

---

## 🖼️ Customer Image Display

### Property Card (List View)
- Shows **primary image only**
- 250px height, cover fit
- Hover effect: slight zoom

### Property Detail Page (Detail View)

**Option 1: Image Gallery (Recommended)**
```
[  Main Large Image  ]
[📷] [📷] [📷] [📷] [📷]  ← Thumbnails
```
- Click thumbnail to change main image
- Full-screen lightbox on click
- Swipe navigation on mobile

**Option 2: Image Carousel**
```
← [Current Image 1 of 8] →
● ○ ○ ○ ○ ○ ○ ○  ← Dots
```
- Auto-play option
- Touch swipe on mobile

**Option 3: Simple Grid**
```
[Image 1] [Image 2]
[Image 3] [Image 4]
```
- Click to enlarge
- Simpler but less engaging

---

## 📱 Mobile Considerations

### Navigation
- Full-screen dropdown on mobile
- Large tap targets
- Swipe to dismiss
- Back button closes menu

### Images
- Optimized sizes for mobile
- Lazy loading
- Touch-friendly gallery
- Pinch to zoom in lightbox

---

## 🚀 Implementation Phases

### **Phase 1: Database Setup** (1 session)
- Create `states`, `counties`, `property_images` tables
- Add initial state data (AZ, AR, CO)
- Update `properties` table with foreign keys
- Write migration script for existing data

### **Phase 2: Image Upload System** (2 sessions)
**Backend:**
- File upload endpoint (multipart/form-data)
- Image validation and resizing
- Save to storage (S3 or local)
- CRUD operations for `property_images`

**Admin Frontend:**
- Drag & drop upload component
- Image preview and reordering
- Set primary image
- Delete images

**Customer Frontend:**
- Display multiple images on property detail
- Image gallery/carousel component

### **Phase 3: State/County Filtering** (2 sessions)
**Backend:**
- Update property endpoints with filtering
- Add state/county management endpoints
- Property count aggregation

**Frontend:**
- Filter properties by state/county
- Breadcrumb navigation
- Query parameter handling

### **Phase 4: Navigation Dropdown** (2 sessions)
**Frontend:**
- Multi-level dropdown component
- Desktop hover behavior
- Mobile tap/accordion behavior
- Dynamic property counts
- Auto-hide empty areas

**Backend:**
- API endpoint for navigation data
- Active states/counties with counts

### **Phase 5: Admin Controls** (1-2 sessions)
**Admin Dashboard:**
- State/county management interface
- Enable/disable toggles
- Sort order controls
- "Coming Soon" status
- Bulk operations

---

## 🎯 Success Criteria

### Must Have
- ✅ Upload up to 10 images per property
- ✅ Set one image as primary (for thumbnails)
- ✅ Filter properties by state
- ✅ Filter properties by county within state
- ✅ Navigation dropdown with state/county hierarchy
- ✅ Admin can enable/disable states/counties
- ✅ Property counts in navigation

### Nice to Have
- ✅ Image captions
- ✅ Image gallery with lightbox
- ✅ "Coming Soon" markets
- ✅ Custom sort orders
- ✅ Drag & drop image reordering
- ✅ Automatic image optimization
- ✅ Mobile-optimized image sizes

---

## 💡 Future Enhancements

### Advanced Filtering
- Price range slider
- Acreage range
- Sort by: Price, Acreage, Date Added
- "New Listings" badge

### Map Integration
- Interactive map showing all properties
- Cluster markers by county
- Click marker to see property
- Draw search boundary

### Marketing Features
- "Hot Deals" section
- "Recently Reduced" properties
- Email alerts for new properties in favorite states
- Saved searches

---

## 📝 Notes & Considerations

### SEO Considerations
- State-specific landing pages
- `/properties/arizona` URLs
- Unique meta descriptions per state
- Schema.org markup for real estate

### Performance
- Lazy load images
- CDN for image delivery
- Cache navigation data
- Index database properly

### Data Migration
When implementing:
1. Backup existing database
2. Create new tables
3. Migrate existing properties to new structure
4. Test thoroughly before switching
5. Keep old columns temporarily for rollback

---

## 🔗 Related Systems

This system integrates with:
- **Property Coordinate System** - GPS boundaries for raw land
- **Admin Dashboard** - Property and image management
- **Search & Filter** - Advanced property discovery

---

**Implementation Status:** Documented, not yet implemented  
**Priority:** Medium (after core UI/UX improvements and backend deployment)  
**Estimated Time:** 8-10 development sessions total

## ⚙️ Environment Configuration

### Server `.env` (Current - PostgreSQL)
```bash
PORT=5000
NODE_ENV=development

JWT_SECRET=greenacres2024secret

SQUARE_ACCESS_TOKEN=EAAAl-xyuDPWomRmbMCymBKObesnG-a21FhuUBpm2yuCwnqOmnrhFpxiIVtjkwlo
SQUARE_LOCATION_ID=L9A04D6JXFCJT
SQUARE_ENVIRONMENT=sandbox

DATABASE_URL=postgresql://postgres:AlyssaMatthew0211%24%24%21%24%21@db.fywbavjylonrnaipxawn.supabase.co:5432/postgres
```

### Client `.env`
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SQUARE_APPLICATION_ID=sandbox-sq0idb-0BG_cYjZ1Wl8c1shtmSkZw
REACT_APP_SQUARE_LOCATION_ID=L9A04D6JXFCJT
REACT_APP_SQUARE_ENVIRONMENT=sandbox
```

### Netlify Environment Variables (Frontend)
```
REACT_APP_SQUARE_APPLICATION_ID=sandbox-sq0idb-0BG_cYjZ1Wl8c1shtmSkZw
REACT_APP_SQUARE_LOCATION_ID=L9A04D6JXFCJT
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SQUARE_ENVIRONMENT=sandbox
NODE_VERSION=18
```

**Note:** When backend is deployed, update `REACT_APP_API_URL` to production backend URL.

---

## ✅ Features Completed

### Customer-Facing Features

1. **Landing Page**
   - Hero section with logo
   - Feature cards (hover effects)
   - How It Works section
   - Financing options display
   - Call-to-action section

2. **Property Browsing**
   - Grid layout of available properties
   - Property cards with images
   - Price, acreage, location display
   - Click to view details

3. **Property Details**
   - Full property information
   - Image display
   - Interactive financing calculator
   - Down payment options (5 tiers)
   - Real-time monthly payment calculation
   - Term length selection (1-5 years)
   - Total cost breakdown
   - Purchase button with Square integration

4. **User Authentication**
   - Registration form
   - Login form
   - JWT token management
   - Secure password hashing
   - Protected routes

5. **Customer Dashboard**
   - Active loans display
   - Summary cards (Active, Total, Paid Off)
   - Loan cards with property details
   - Remaining balance display
   - Monthly payment amount
   - Progress bars showing % paid
   - Payments remaining counter
   - Links to loan details

6. **Loan Detail Page**
   - Complete loan information
   - Purchase price and down payment
   - Processing fee display
   - Loan amount and interest rate
   - Term and monthly payment
   - Total amount to be paid
   - Current balance remaining
   - Payments remaining counter
   - Progress bar (% paid off)
   - Payment form with Square integration
   - Quick payment buttons (Monthly / Pay Off)
   - Link to payment history

7. **Payment History**
   - Complete payment log
   - Date, type, amount, status
   - Down payment and monthly payments
   - Total paid calculation
   - Current balance display
   - Back navigation to loan details

8. **Payment Processing**
   - Square Web SDK integration
   - Test card support (Sandbox)
   - Down payment processing
   - Monthly payment processing
   - Payment confirmation
   - Transaction records
   - Automatic balance updates

   9. **Property Status System (November 3, 2025)**
   - Status column in properties table (available, pending, under_contract, sold)
   - Backend filtering by status
   - Auto-update to "pending" on purchase
   - Admin-ready for manual status toggles
   - Prevents double-selling of properties
   - API endpoints for status-based queries

10. **Recent Sales Showcase Page (November 3, 2025)**
    - Public page displaying sold/under contract properties
    - Filter tabs: All, Pending, Under Contract, Sold
    - Property cards with status badges
    - Professional gradient placeholder for missing images
    - Sale/contract dates displayed
    - Prices hidden for privacy
    - Centered, responsive layout
    - Automatic property count badges

11. **Advanced Affordability Calculator (November 3, 2025)**
    - Customer-centric "What can you afford?" design
    - Optional monthly payment input field
    - All 5 financing options displayed simultaneously
    - Real-time calculations as term changes
    - Green glow highlighting closest match to desired payment
    - Smart warnings when desired payment is ±$30 from available options
    - Helpful term adjustment suggestions
    - "Your Cost Today" prominent box (down payment + fee)
    - "Ready to Purchase" detailed summary at bottom
    - Mobile-responsive layout with proper spacing

12. **Billing Information Collection (November 3, 2025)**
    - Complete billing form integration
    - Cardholder name field (required)
    - Full billing address (required)
    - City, State, ZIP fields (required)
    - State dropdown with 28 common states
    - Form validation before payment processing
    - Professional layout with clear labels
    - Error handling for incomplete information
    - Integration with Square payment flow

### Technical Features

1. **Responsive Design**
   - Mobile-friendly navbar (icon vs horizontal logo)
   - Flexible grid layouts
   - Touch-friendly buttons
   - Breakpoints at 600px, 768px

2. **Security**
   - JWT authentication
   - bcrypt password hashing
   - Protected API routes
   - CORS configuration
   - Environment variable security

3. **Database Operations**
   - PostgreSQL connection pooling
   - Parameterized queries (SQL injection prevention)
   - Async/await patterns
   - Error handling
   - Transaction support

4. **Styling**
   - Brand colors throughout
   - Hover effects on cards and links
   - Shadow effects
   - Smooth transitions
   - Professional appearance

---

## 🚧 Features In Progress

### Enhanced Loan Tracking System

Based on actual loan tracking spreadsheet requirements:

#### Customer View (Simplified)
- Current loan balance ✅
- Payment history (date, amount) ✅
- Next payment due date (not yet implemented)
- Total paid to date ✅
- Remaining payments ✅
- **Print button** for records (not yet implemented)
- **Loan contract/agreement** view (not yet implemented)

#### Admin View (Detailed - Not Yet Built)
Based on Excel loan tracker columns:
1. **Payment Number**
2. **Date**
3. **Payment Amount**
4. **Principal Only Payments**
5. **Interest Accrued** (daily calculation)
6. **Fees Charged**
7. **Fees Paid**
8. **Fee Balance**
9. **Interest Paid**
10. **Interest Balance**
11. **Principal Paid**
12. **Principal Balance**
13. **Total Owed**

**Summary Calculations Needed:**
- Daily Interest Rate
- Total Payments
- Total Interest Accrued
- Current Total Owed

**Auto-Update on Payment:**
- When customer makes payment online
- Automatically update loan tracking
- Calculate daily interest accrual
- Update all balances
- Track payment application (fees → interest → principal)

---

## 🌐 Deployment Setup

### Frontend Deployment (Netlify)

**Live URL:** https://[your-site].netlify.app  
**Custom Domains:**
- greenacreslandinvestments.com
- wefinancelandforyou.com

**Configuration:**
- **Base directory:** `client`
- **Build command:** `npm run build`
- **Publish directory:** `client/build`
- **Node version:** 18

**GitHub Integration:**
- **Repository:** cwinvestments/green-acres-land-investments
- **Branch:** main
- **Auto-deploy:** Enabled

**Build Process:**
1. Push to GitHub
2. Netlify auto-detects changes
3. Builds React app
4. Deploys to CDN
5. Takes ~3-5 minutes

**Previous Issues Resolved:**
- ✅ ESLint warnings fixed (removed unused variables)
- ✅ React Hook dependencies corrected
- ✅ Node version set to 18 (.nvmrc file)
- ✅ Environment variables configured
- ✅ Field name mismatches fixed (balance vs balance_remaining)

### Backend Deployment (Pending)

**Options:**
1. **Railway** (recommended)
   - Free tier available
   - Easy PostgreSQL integration
   - Auto-deploy from GitHub
   - Buildpacks for Node.js

2. **Render**
   - Free tier available
   - Native PostgreSQL support
   - GitHub integration

3. **Heroku**
   - Paid ($7/month minimum)
   - Most established
   - Add-on ecosystem

**Requirements:**
- Node.js environment
- PostgreSQL database connection (already configured)
- Environment variables
- SSL/HTTPS support

**Deployment Steps (When Ready):**
1. Choose hosting platform
2. Connect GitHub repository
3. Configure environment variables
4. Set build/start commands
5. Deploy backend
6. Update frontend API URL
7. Test end-to-end

---

## 🎨 Logo & Branding

### Logo Package (20 Files)

**Location:** `client/public/images/`

**File Types:**

**SVG (Scalable Vector):**
- `green-acres-full-logo.svg` - Full logo with tagline
- `green-acres-horizontal.svg` - Horizontal layout
- `green-acres-icon.svg` - Circular icon only
- `green-acres-full-light.svg` - Light version for dark backgrounds

**PNG (Raster):**
- Small: 256×256px + favicons (16, 32, 64, 128px)
- Medium: 512×512px
- Large: 1024×1024px
- X-Large: 2048×2048px

**Plus:** manifest.json for PWA support

### Logo Usage

**Navbar:**
- Desktop (>600px): `green-acres-horizontal.svg`
- Mobile (≤600px): `green-acres-icon.svg`
- Height: 50px

**Hero Section:**
- `green-acres-full-512.png`
- Max-width: 400px (desktop), 300px (mobile)
- Centered

**Browser Favicon:**
- `favicon-16.png`, `favicon-32.png`, `favicon-64.png`
- Shows in browser tabs, bookmarks

### Brand Colors

**CSS Variables:**
```css
--forest-green: #2c5f2d    /* Primary brand color */
--dark-forest: #1e4620     /* Darker shade */
--sandy-gold: #f4a460      /* Accent color */
--muted-gold: #d4873e      /* Muted accent */
--light-green: #f0f8f0     /* Background tint */
```

**Usage:**
- Primary buttons: Forest Green
- Accents/highlights: Sandy Gold
- Backgrounds: Light Green
- Dark backgrounds: Dark Forest

### Logo Design Elements

**Circular Badge Design:**
- Twin peaks mountains
- Rising sun
- Tagline: "Your Land. Your Terms."
- Professional, outdoor aesthetic

---

## 📊 Loan Tracking System

### Current Implementation (Basic)

**Database Tables:**
- `loans` - Loan info with all financial fields
- `payments` - Payment records

**Tracked Data:**
- Purchase price
- Down payment
- Processing fee
- Loan amount
- Interest rate
- Term (months)
- Monthly payment
- Total amount
- Balance remaining
- Payment dates and amounts
- Status (active/paid_off)

**Current Calculation:**
- Simple principal tracking
- Balance decreases by payment amount
- Percentage paid = (loan_amount - balance_remaining) / loan_amount

### Required Enhancement (Advanced)

Based on actual Excel loan tracker used by business:

#### Daily Interest Calculation
```
Daily Interest = (Days Since Last Payment) × Daily Rate × Principal Balance
Daily Rate = Annual Rate / 365
```

#### Payment Application Order
1. Outstanding fees (if any)
2. Accrued interest
3. Principal balance

#### Data Structure Needed

**Loan Record (Enhanced):**
- Loan amount
- Annual interest rate
- Loan issue date
- Days in year (365)
- Current principal balance
- Current interest balance
- Current fee balance
- Last payment date
- Next payment due date
- Payment reference amount

**Payment Record (Enhanced):**
- Payment number
- Payment date
- Payment amount
- Principal-only flag
- Interest accrued since last payment
- Fees charged
- Fees paid
- Fee balance after payment
- Interest paid
- Interest balance after payment
- Principal paid
- Principal balance after payment
- Total owed after payment
- Square transaction ID

**Summary Calculations:**
- Daily interest rate
- Total payments made to date
- Total interest accrued to date
- Current total owed

### Customer Portal Features Implemented

1. **Loan Overview** ✅
   - Property details
   - Original loan amount
   - Current balance
   - Interest rate
   - Monthly payment amount
   - Payment progress bar

2. **Payment History** ✅
   - Date
   - Amount paid
   - Payment type (down/monthly)
   - Status
   - Total paid to date

3. **Make Payment** ✅
   - Amount input (default to monthly payment)
   - Square payment form
   - Quick payment buttons
   - Confirmation and balance update

### Customer Portal Features Needed

1. **Next payment due date** display
2. **Loan contract/agreement** viewing (PDF)
3. **Print button** for all documents
4. **Detailed breakdown** of how payment was applied

### Admin Dashboard Features Needed (Not Yet Built)

1. **Loan Management**
   - All active loans
   - Search by customer/property
   - Filter by status
   - Sort by various fields

2. **Detailed Loan View**
   - All 13 columns from spreadsheet
   - Daily interest accrual display
   - Fee tracking
   - Payment history with full detail
   - Export to Excel

3. **Payment Processing**
   - Manual payment entry
   - Adjust principal/interest/fees
   - Fee assessment
   - Generate statements

4. **Reporting**
   - Total portfolio value
   - Outstanding balances
   - Payment due dates
   - Late payments
   - Interest earned
   - Custom date ranges

5. **Property Management**
   - Add new properties
   - Edit existing properties
   - Upload images
   - Mark as sold/available
   - Link to loans

---

## ⚠️ Known Issues

### Resolved Issues ✅

- ✅ **Supabase Connection** - Fixed by purchasing IPv4 add-on
- ✅ **SQLite to PostgreSQL Migration** - Complete server conversion done
- ✅ **Field Name Mismatches** - Fixed in Dashboard.js, LoanDetail.js, PaymentHistory.js
- ✅ **Square Payment Integration** - Working in sandbox mode
- ✅ **Environment Variable Issues** - .env files properly configured
- ✅ **VS Code Caching Issues** - Used Notepad for reliable file editing
- ✅ **React Build Errors** - All component errors fixed

### Active Issues

**None at this time!** All core features are working.

### Future Considerations

1. **Daily Interest Calculation** - Need to implement proper accrual
2. **Backend Deployment** - Choose hosting platform
3. **Admin Dashboard** - Build from scratch
4. **Email Notifications** - Set up email service
5. **Loan Contracts** - PDF generation system

---

## 📋 Next Steps

### Immediate (Next Session)

1. **✅ COMPLETED: UI/UX Improvements** 
   - ✅ All currency formatting fixed (decimals + commas)
   - ✅ All 6 customer-facing pages professionally styled
   - ✅ Dashboard, Properties, Property Detail, Loan Detail, Payment History, Auth pages
   - ✅ 400+ lines of CSS added
   - ✅ Removed inline styles, proper CSS architecture
   - ✅ Button highlighting, form focus states, hover effects

2. **📱 Optional: Mobile Testing**
   - Test all pages on mobile devices
   - Verify responsive layouts work correctly
   - Check touch target sizes
   - Test forms on mobile keyboards

### Short Term (1-2 Weeks)

1. **Admin Dashboard**
   - Property management interface
   - Loan oversight dashboard
   - Detailed tracking views
   - Reporting capabilities

2. **Deploy Backend**
   - Choose hosting (Railway/Render/Heroku)
   - Configure environment variables
   - Deploy to production
   - Update frontend API URL
   - Test end-to-end

3. **Implement Email Notifications**
   - Payment reminders
   - Payment confirmations
   - Late payment notices
   - Statement delivery

### Medium Term (1-2 Months)

1. **Production Launch**
   - Switch Square to production mode
   - Set up custom domains
   - SSL certificates
   - Final testing with real data

2. **Advanced Features**
   - Document upload/download
   - Autopay setup
   - Account settings
   - Customer support system

### Long Term (3-6 Months)

1. **Mobile App**
   - React Native version
   - Push notifications
   - Offline capability

2. **Advanced Features**
   - Automated property import
   - GIS/mapping integration
   - Document e-signing
   - Chat support
   - Analytics dashboard

---

## 💻 Development Workflow

### Local Development Setup

1. **Clone Repository**
```bash
   git clone https://github.com/cwinvestments/green-acres-land-investments.git
   cd green-acres-land-investments
```

2. **Install Dependencies**
```bash
   # Server
   cd server
   npm install
   
   # Client
   cd ../client
   npm install
```

3. **Configure Environment**
```bash
   # Server
   cd server
   cp .env.example .env
   # Edit .env with your credentials
   
   # Client
   cd ../client
   cp .env.example .env
   # Edit .env with your credentials
```

4. **Start Development Servers**
```bash
   # Terminal 1 - Server
   cd server
   npm start
   
   # Terminal 2 - Client  
   cd client
   npm start
```

5. **Access Application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - API Health: http://localhost:5000/api/health

### Git Workflow
```bash
# Make changes
git add .
git commit -m "Description of changes"
git push origin main
```

**Important:**
- Netlify auto-deploys on push to main branch
- Always test locally before pushing
- Use descriptive commit messages
- Don't commit `.env` files (in .gitignore)

### Development Tools

**Editor:** VS Code (but use Notepad for critical file edits to avoid caching)

**Recommended Extensions:**
- ES7+ React/Redux/React-Native snippets
- Prettier - Code formatter
- GitLens

**Terminal Setup:**
- Use Command Prompt (not PowerShell) to avoid execution policy issues
- Keep 2-3 terminals open (server, client, commands)

### Testing Workflow

1. **Test Locally First**
   - All features work on localhost
   - No console errors
   - Responsive design works
   - Payments process correctly

2. **Test on Netlify**
   - Push to GitHub
   - Wait for deployment
   - Test live site
   - Check for production issues

3. **Square Testing**
   - Use sandbox environment
   - Test card: 4111 1111 1111 1111
   - CVV: 111
   - Any future date
   - Any 5-digit ZIP

---

## 🔧 Troubleshooting

### Common Issues

#### Server Won't Start

**Error:** `Cannot find module 'X'`
```bash
cd server
npm install
```

**Error:** `Port 5000 already in use`
- Close other applications using port 5000
- Or change PORT in server/.env

**Error:** `Database connection failed`
- Check DATABASE_URL in .env
- Verify Supabase project is active
- Check network/firewall settings
- Verify IPv4 add-on is enabled

#### Client Won't Start

**Error:** `Port 3000 already in use`
- Close other React apps
- Or change port: `PORT=3001 npm start`

**Error:** `Cannot connect to server`
- Verify server is running on port 5000
- Check REACT_APP_API_URL in client/.env
- Check CORS configuration in server

#### Payment Issues

**Error:** `Square payment failed`
- Verify Square credentials in .env
- Ensure using sandbox environment
- Check Square SDK loaded in browser (Network tab)
- Verify card details are correct

**Error:** `Payment successful but balance not updated`
- Check server logs for errors
- Verify database update logic
- Check payment record in database

#### Database Issues

**PostgreSQL/Supabase:**
- Verify connection string format
- Check password encoding
- Verify Supabase project is active
- Check network/firewall settings
- Ensure IPv4 add-on is enabled

#### Netlify Build Failures

**Check:**
1. Build logs for specific errors
2. Environment variables set correctly
3. Node version set to 18
4. Dependencies all installed
5. No syntax errors in code

**Common Fixes:**
- Clear Netlify cache and redeploy
- Verify all env vars are set
- Check for unused imports/variables

### File Editing Issues

**VS Code Caching:**
- If changes don't take effect, use Notepad instead
- VS Code can cache old file contents
- Always verify changes with `type filename` command

**React Not Picking Up Changes:**
- Stop client (Ctrl+C)
- Restart: `npm start`
- Hard refresh browser (Ctrl+Shift+R)
- Clear browser cache if needed

### Windows-Specific Issues

**PowerShell Execution Policy:**
- Use Command Prompt instead of PowerShell
- Avoids npm.ps1 execution errors

**Line Ending Warnings:**
```
warning: LF will be replaced by CRLF
```
This is normal on Windows and can be ignored.

---

## 📞 Support & Resources

### Developer Preferences
- **Editor:** VS Code (Notepad for critical edits)
- **Terminal:** Command Prompt (not PowerShell)
- **Workflow:** Small, simple steps, one at a time
- **Project Location:** `C:\Projects\GreenAcres`

### External Resources

**Square Developer:**
- Dashboard: https://developer.squareup.com/apps
- Documentation: https://developer.squareup.com/docs
- Sandbox testing: Use test cards for development

**Supabase:**
- Dashboard: https://supabase.com
- Documentation: https://supabase.com/docs

**Netlify:**
- Dashboard: https://app.netlify.com
- Documentation: https://docs.netlify.com

**React:**
- Documentation: https://react.dev
- Router: https://reactrouter.com

**Node.js/Express:**
- Node: https://nodejs.org/docs
- Express: https://expressjs.com

### Project Files

**Key Documentation:**
- `README.md` - Comprehensive setup guide
- `QUICKSTART.md` - 5-minute setup
- `PROJECT-SUMMARY.md` - Overview
- This file - Complete project guide

---

## 📝 Notes & Reminders

### Important Credentials

**Supabase Database Password:** AlyssaMatthew0211$$!$!  
(Store securely, don't commit to git)

**URL Encoding Reference:**
- `$` = `%24`
- `!` = `%21`
- `@` = `%40`
- `:` = `%3A`

### Square Environments

**Sandbox (Testing):**
- Free to use
- Test cards work
- No real money processed
- Application ID: sandbox-sq0idb-0BG_cYjZ1Wl8c1shtmSkZw

**Production:**
- Real money processed
- Real credit cards
- Fees apply
- Switch when ready to go live

### Git Reminders

**Don't Commit:**
- `.env` files
- `node_modules/` directories
- `*.db` database files
- Passwords or secrets

**Do Commit:**
- `.env.example` files (templates)
- All source code
- Documentation
- Logo files

---

## 🎯 Success Criteria

### MVP Complete ✅
- ✅ Frontend deployed and accessible
- ⌛ Backend deployed and connected (pending)
- ✅ Database in production (PostgreSQL/Supabase)
- ✅ Users can register and login
- ✅ Users can browse properties
- ✅ Users can purchase with financing
- ✅ Users can make monthly payments
- ✅ Payments are tracked accurately
- ⌛ Admin can view all loans (dashboard not built yet)

### Full Feature Complete When:
- ✅ All MVP items (except backend deployment and admin dashboard)
- ⌛ Daily interest calculation working
- ⌛ Detailed loan tracking for admin
- ⌛ Print functionality for customers
- ⌛ Loan contracts viewable
- ⌛ Email notifications sent
- ⌛ Admin dashboard operational
- ⌛ Custom domains active
- ⌛ Production Square environment

---

## 📅 Version History

**v1.0 - Initial Build (October 2024)**
- Complete frontend created
- Backend API built
- Square integration added
- SQLite database implemented
- Basic loan tracking
- All pages functional

**v1.1 - Logo Integration (November 2024)**
- Logo package created (20 files)
- Navbar logo added (responsive)
- Hero section logo added
- Favicons implemented
- Brand colors applied
- Hover effects added

**v1.2 - Netlify Deployment (November 2024)**
- Frontend deployed to Netlify
- GitHub integration setup
- Environment variables configured
- Custom domains prepared
- Build issues resolved

**v1.4 - Database Migration Complete (November 3, 2025)**
- Purchased Supabase IPv4 add-on ($4/month)
- Successfully connected to PostgreSQL
- Converted entire server.js from SQLite to PostgreSQL
- Updated all database queries to use pg library
- Fixed field name mismatches across all pages
- All CRUD operations working properly

**v1.5 - Core Features Tested & Working (November 3, 2025)**
- ✅ User registration and login tested
- ✅ Property browsing working
- ✅ Purchase flow with Square tested ($99 down payment)
- ✅ Loan creation in database verified
- ✅ Dashboard displaying loans correctly
- ✅ Loan detail page showing all information
- ✅ Monthly payment processing tested ($79.54 payment)
- ✅ Payment history showing all transactions
- ✅ Balance updates after payments verified
- ✅ All field name issues resolved (balance_remaining, loan_amount, etc.)
- 🎉 **Complete loan flow working end-to-end!**

**v1.6 - UI/UX Improvements Complete (November 3, 2025)**

**Phase 1 - Currency & Logic (Morning):**
- Fixed all decimal places on currency displays (32 changes across 5 files)
- Created formatCurrency() helper function in api.js
- Added comma separators to all currency (additional 8 changes)
- Updated PropertyDetail.js, Dashboard.js, LoanDetail.js, PaymentHistory.js, Properties.js
- Minimum payment now uses actual monthly payment amount (not flat $50)
- Improved success messages (clearer, multi-line format)
- Added button highlighting for payment selection (UX improvement)
- Fixed all React Hook warnings (useCallback implementations)

**Phase 2 - Professional Styling (Afternoon/Evening):**
- Dashboard page: Professional card design, summary stats, progress bars with gradients
- Properties page: Beautiful property cards with light green background, hover effects
- Property Detail page: Two-column layout, styled calculator, price box
- Loan Detail page: Clean info card, sticky payment card, currency input with $ symbol
- Payment History page: Professional table with green header, row hover effects
- Login/Register pages: Polished forms with focus glow effects, cleaner layout
- Background color system: Light green (#f0f8f0) applied consistently
- Removed all inline styles, moved to proper CSS classes
- Added 400+ lines of professional CSS

**Total Changes:** 60+ across 6 page files, 1 API file, and index.css

**Pages Now Fully Styled:**
✅ Dashboard
✅ Properties (Browse)
✅ Property Detail
✅ Loan Detail  
✅ Payment History
✅ Login/Register

**v2.0 - Target (To Be Determined)**
- Backend deployed to production
- Enhanced loan tracking with daily interest
- Admin dashboard
- Email notifications
- Print functionality
- Loan contracts viewable
- Full feature set complete

---

## 🔒 Security Checklist

### Development ✅
- [x] Passwords hashed with bcrypt
- [x] JWT tokens for authentication
- [x] Environment variables for secrets
- [x] CORS configured
- [x] .gitignore configured correctly
- [x] Parameterized database queries (SQL injection prevention)

### Production (When Deploying)
- [ ] Strong JWT secret (not default)
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting implemented
- [ ] Input validation everywhere
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Security headers configured
- [ ] Dependency audit run (`npm audit`)
- [ ] Error handling doesn't expose internals

---

---

## 📅 Development Sessions Log

### Session: November 3, 2025 (UI/UX Complete)

**Duration:** Full day session  
**Focus:** UI/UX improvements and professional styling  
**Developer:** Claude Weidner with AI Assistant

**Morning Accomplishments:**
- Fixed all currency decimal place issues (32 changes)
- Created formatCurrency() helper function
- Updated minimum payment logic
- Improved success messages
- Added button highlighting for UX
- Fixed React Hook warnings

**Afternoon/Evening Accomplishments:**
- Styled Dashboard page (professional cards, stats, progress bars)
- Styled Properties page (hover effects, background color)
- Styled Property Detail page (two-column layout, calculator)
- Styled Loan Detail page (sticky payment card, info rows)
- Styled Payment History page (professional table design)
- Polished Login/Register forms (focus states, clean layout)
- Added 400+ lines of professional CSS
- Removed inline styles for proper architecture

**Documentation Updates:**
- Property Coordinate System documented
- Multi-State Property Management System documented
- Version history updated (v1.6 complete)
- UI-IMPROVEMENT-PLAN.md completed

**Total Changes:** 60+ across 8 files  
**Lines of CSS Added:** 400+  
**Pages Styled:** 6 (all customer-facing pages)

**Status:** UI/UX Phase 1 is COMPLETE ✅

**Next Priority:** Backend deployment to production

**Document End**

*This document reflects the current state of the project as of November 3, 2025. Keep updated as development progresses.*

**Last Updated By:** Claude Weidner & AI Assistant  
**Next Update:** After enhanced loan tracking implementation or backend deployment