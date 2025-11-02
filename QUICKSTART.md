# 🚀 Quick Start Guide - Green Acres Land Investments

Get up and running in 5 minutes!

## Prerequisites
✅ Node.js (v16+) installed
✅ Square Developer account created
✅ Git installed (optional)
✅ VS Code or your preferred editor

## Step-by-Step Setup

### 1. Get Square Credentials (2 minutes)

1. Go to https://developer.squareup.com/apps
2. Click "Create App" or select existing app
3. Name it: "Green Acres Land Investments"
4. Copy these 3 credentials:
   - **Application ID** (Credentials → Application ID)
   - **Access Token** (Credentials → Sandbox Access Token)
   - **Location ID** (Locations → Your location → Copy ID)

### 2. Configure Environment Variables (1 minute)

**Server (.env):**
```bash
cd green-acres-land/server
cp .env.example .env
# Edit .env and paste your Square credentials
```

**Client (.env):**
```bash
cd ../client
cp .env.example .env
# Edit .env and paste your Square Application ID and Location ID
```

### 3. Install Dependencies (2 minutes)

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 4. Start the Application (30 seconds)

Open two terminal windows:

**Terminal 1 - Start Server:**
```bash
cd server
npm start
```

**Terminal 2 - Start Client:**
```bash
cd client
npm start
```

## 🎉 You're Done!

- **Client**: http://localhost:3000
- **Server**: http://localhost:5000

## 🧪 Test It Out

1. Register a new account
2. Browse properties
3. Use test card to make a purchase:
   - Card: 4111 1111 1111 1111
   - CVV: 111
   - Exp: Any future date
   - ZIP: Any 5 digits

## 💡 Troubleshooting

**Server won't start:**
- Check if port 5000 is available
- Verify .env file exists with correct values

**Client won't start:**
- Check if port 3000 is available
- Verify .env file exists in client folder

**Payment errors:**
- Make sure you're using Sandbox mode
- Verify Square credentials are correct
- Check browser console for errors

## 📚 Next Steps

- Read the full README.md for detailed documentation
- Customize the property listings in server/database.js
- Update styling in client/src/index.css
- When ready for production, switch Square to production mode

## 🆘 Need Help?

Check the README.md for:
- Complete API documentation
- Deployment instructions
- Detailed troubleshooting

---

**Built with ❤️ for Green Acres Land Investments, LLC**

Making land ownership simple! 🌿
