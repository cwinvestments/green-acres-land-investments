\# 🌿 Green Acres Project - New Chat Session Prompt



\*\*Copy and paste this into a new chat to onboard the AI assistant:\*\*



---



I'm continuing work on my Green Acres Land Investments website with Claude Weidner.



\## 📚 CRITICAL: Read These Documents First



\*\*BEFORE responding, please read these files using the view tool:\*\*



1\. \*\*C:\\Projects\\GreenAcres\\GREEN-ACRES-PROJECT-GUIDE.md\*\*

&nbsp;  - Complete project status, history, and architecture

&nbsp;  - Contains CRITICAL "Code Architecture \& Conventions" section

&nbsp;  - Shows what's completed vs what needs work



2\. \*\*C:\\Projects\\GreenAcres\\UI-IMPROVEMENT-PLAN.md\*\*  

&nbsp;  - Current priority: UI/UX improvements

&nbsp;  - Known issues and improvement roadmap



\## 📊 Quick Project Status



\*\*What's Working:\*\*

\- ✅ Complete loan purchase flow with Square payments

\- ✅ User registration and login

\- ✅ Dashboard showing active loans

\- ✅ Loan details with payment processing

\- ✅ Payment history tracking

\- ✅ Supabase PostgreSQL database (IPv4 enabled)

\- ✅ Backend converted to PostgreSQL (NOT SQLite)



\*\*What Needs Work:\*\*

\- 🎨 UI/UX improvements (TOP PRIORITY)

\- 📊 Enhanced loan tracking with daily interest calculation

\- 👨‍💼 Admin dashboard (not built yet)

\- 📄 Loan contracts and print functionality

\- 📧 Email notifications



\## 🔧 Technical Architecture (CRITICAL)



\*\*Database:\*\*

\- PostgreSQL via Supabase (NOT SQLite)

\- Uses `db.pool.query()` with `$1, $2` placeholders

\- Returns `result.rows` array



\*\*Critical Field Names:\*\*

\- `balance\_remaining` (NOT `balance`)

\- `loan\_amount` (NOT `principal`)

\- `purchase\_price`, `down\_payment`, `processing\_fee`



\*\*File Editing:\*\*

\- Use Notepad for critical files (VS Code caches incorrectly)

\- Always verify changes: `type filename | find "text"`



\## 💻 Development Setup



\*\*Project Location:\*\* `C:\\Projects\\GreenAcres`



\*\*Running Servers:\*\*

\- Terminal 1: `cd server \&\& npm start` (port 5000)

\- Terminal 2: `cd client \&\& npm start` (port 3000)

\- Terminal 3: Commands (use Command Prompt, NOT PowerShell)



\*\*Environment Files:\*\*

\- `server/.env` - Backend config (PostgreSQL connection)

\- `client/.env` - Frontend config (Square credentials)



\## 🎯 What I Need Help With



\[Describe what you want to work on - examples below]



\*\*Option 1 - UI Improvements:\*\*

"I want to improve the UI/UX. Let's start with fixing decimal places on currency and then review the Dashboard page styling."



\*\*Option 2 - Enhanced Loan Tracking:\*\*

"I want to implement daily interest calculation for the loan tracking system."



\*\*Option 3 - Admin Dashboard:\*\*

"I want to start building the admin dashboard to manage all loans and properties."



\*\*Option 4 - Testing/Bug Fixes:\*\*

"I want to test edge cases and fix any bugs in the loan payment system."



\## 👤 My Work Preferences



\- \*\*Take it ONE step at a time\*\* - Don't give me 5 steps at once

\- \*\*Use Command Prompt\*\* (not PowerShell)

\- \*\*Give me EXACT commands to paste\*\* - No extra text, just what to type

\- \*\*I work in VS Code\*\* with multiple terminals

\- \*\*I like to understand what I'm doing\*\* - Explain briefly, but focus on action



\## 🚨 Common Mistakes to Avoid



1\. ❌ Don't use SQLite syntax (`db.prepare()`)

2\. ❌ Don't use wrong field names (`loan.balance` instead of `loan.balance\_remaining`)

3\. ❌ Don't give me PowerShell commands

4\. ❌ Don't assume VS Code saved files correctly - always verify with `type` command

5\. ❌ Don't code from scratch what's already working - read the docs first!



---



\*\*After reading the documentation, acknowledge you understand the project and ask what I want to work on today.\*\*

