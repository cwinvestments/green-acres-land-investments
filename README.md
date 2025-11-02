# 🌿 Green Acres Land Investments, LLC

A complete full-stack web application for land investment business with flexible financing options and Square payment integration.

## 🎯 Features

### Customer-Facing Features
- **Property Listings**: Browse available land parcels with detailed information
- **Advanced Financing Calculator**: Real-time calculation of monthly payments with multiple down payment options
- **Customer Portal**: Secure login to view loan details and payment history
- **Online Payments**: Square-powered payment processing for down payments and monthly installments
- **Loan Tracking**: Visual progress bars and detailed payment schedules
- **Responsive Design**: Mobile-friendly interface

### Financing Options
- **$99 Down Special**: Available on all properties (18% interest rate)
- **20% Down Payment**: 12% interest rate
- **25% Down Payment**: 8% interest rate
- **35% Down Payment**: 8% interest rate
- **50% Down Payment**: 8% interest rate
- **Loan Terms**: 1-5 years
- **Processing Fee**: $99 on all purchases
- **Minimum Payment**: $50/month
- **No Early Payoff Penalties**

### Technical Features
- JWT-based authentication
- Secure password hashing with bcrypt
- RESTful API architecture
- SQLite database for easy deployment
- Square payment integration (PCI compliant)
- Automatic loan balance tracking

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Square Web SDK for payment processing
- Modern CSS with responsive design

### Backend
- Node.js with Express
- SQLite with better-sqlite3
- JWT for authentication
- bcrypt for password security
- Square API for payment processing

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Square Developer Account** - [Sign up](https://developer.squareup.com/)
- **Git** (optional, for version control)
- **VS Code** (recommended editor)

## 🚀 Installation

### 1. Get Square Credentials

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Create a new application: "Green Acres Land Investments"
3. Copy these credentials:
   - **Application ID** (for frontend)
   - **Access Token** (for backend)
   - **Location ID** (for both)
4. Use **Sandbox** mode for testing

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Configure Environment Variables

**Server Configuration** (`server/.env`):
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Square credentials:
PORT=5000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
SQUARE_ACCESS_TOKEN=your-square-access-token-here
SQUARE_LOCATION_ID=your-square-location-id-here
SQUARE_ENVIRONMENT=sandbox
DATABASE_PATH=./greenacres.db
```

**Client Configuration** (`client/.env`):
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Square credentials:
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SQUARE_APPLICATION_ID=your-square-application-id-here
REACT_APP_SQUARE_LOCATION_ID=your-square-location-id-here
REACT_APP_SQUARE_ENVIRONMENT=sandbox
```

### 4. Start the Application

**Terminal 1 - Start the server:**
```bash
cd server
npm start
```

**Terminal 2 - Start the client:**
```bash
cd client
npm start
```

The app will open at `http://localhost:3000`

## 🧪 Testing

### Test Credit Card (Square Sandbox)
- **Card Number**: 4111 1111 1111 1111
- **CVV**: 111
- **Expiration**: Any future date
- **ZIP Code**: Any 5 digits

### Test Flow
1. Register a new account
2. Browse available properties
3. Use the financing calculator to compare options
4. Make a test purchase with the $99 down option
5. Log in to your dashboard
6. View loan details
7. Make a test monthly payment

## 📁 Project Structure

```
green-acres-land/
├── server/
│   ├── server.js          # Main Express server
│   ├── database.js        # Database initialization
│   ├── package.json       # Server dependencies
│   └── .env.example       # Environment template
├── client/
│   ├── public/
│   │   └── index.html     # HTML with Square SDK
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.js  # Navigation component
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Properties.js
│   │   │   ├── PropertyDetail.js
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── LoanDetail.js
│   │   │   └── PaymentHistory.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── api.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Properties
- `GET /api/properties` - List all properties
- `GET /api/properties/:id` - Get property details

### Loans
- `GET /api/loans` - Get user's loans
- `GET /api/loans/:id` - Get specific loan
- `POST /api/loans` - Create new loan (purchase property)

### Payments
- `POST /api/payments` - Process payment
- `GET /api/loans/:id/payments` - Get payment history

## 💡 Key Features Explained

### Financing Calculator
The calculator automatically determines:
- Monthly payment based on property price, down payment, term, and interest rate
- Total amount to be paid over the loan term
- Interest rate based on down payment percentage
- Includes $99 processing fee in calculations
- Enforces $50 minimum monthly payment

### Customer Dashboard
Users can:
- View all their active loans
- See remaining balance and progress
- Access payment history
- Make online payments securely
- View property details

### Payment Processing
- All payments processed through Square (PCI compliant)
- Automatic loan balance updates
- Payment history tracking
- Support for both down payments and monthly installments

## 🚨 Troubleshooting

### Server won't start
- Check that port 5000 is not in use
- Verify all environment variables are set in server/.env
- Run `npm install` in the server directory

### Client won't start
- Check that port 3000 is not in use
- Verify .env file exists in client directory
- Run `npm install` in the client directory

### Payments failing
- Verify Square credentials are correct
- Ensure you're using Sandbox mode for testing
- Check browser console for errors
- Verify Square SDK loaded (check Network tab)

### Database errors
- Delete greenacres.db and restart server (creates new database)
- Check file permissions in server directory

## 🌐 Deployment

### Preparing for Production

1. **Update Square to Production Mode**
   - Get production credentials from Square
   - Update `.env` files with production tokens
   - Change `SQUARE_ENVIRONMENT=production`

2. **Secure Your Application**
   - Change JWT_SECRET to a strong random string
   - Enable HTTPS
   - Set up proper CORS settings
   - Add rate limiting

3. **Database**
   - Consider migrating from SQLite to PostgreSQL
   - Set up regular backups

4. **Deployment Options**
   - **Frontend**: Vercel, Netlify, or AWS Amplify
   - **Backend**: Heroku, Railway, Render, or AWS EC2
   - **Database**: Railway PostgreSQL, AWS RDS, or Supabase

## 🎯 Future Enhancements

- Admin dashboard for managing properties
- Email notifications for payment reminders
- Document upload for land deeds
- Property image galleries
- Advanced search and filtering
- Autopay setup for recurring payments
- Customer support chat

## 📄 License

This project is proprietary software for Green Acres Land Investments, LLC.

---

**Built with ❤️ for Green Acres Land Investments**

Making land ownership simple and accessible! 🌿🏞️
