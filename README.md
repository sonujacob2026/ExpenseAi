# 💰 ExpenseAI - Smart Expense Tracking App

A modern, AI-powered expense tracking application built with React and Node.js.

## 🚀 Features

### ✅ Authentication
- **Email/Password Registration & Login**
- **Google OAuth Integration**
- **JWT-based Authentication**
- **Secure User Management**

### ✅ Expense Management
- **Add Expenses** - Easy form with categories and payment methods
- **Edit Expenses** - Inline editing functionality
- **Delete Expenses** - With confirmation prompts
- **Expense Categories** - 11 predefined categories with icons
- **Payment Method Tracking** - Cash, Credit Card, Debit Card, etc.

### ✅ Analytics & Insights
- **Real-time Statistics** - Total, monthly, weekly breakdowns
- **Category Analysis** - Top spending categories
- **Visual Indicators** - Icons and color-coded stats
- **Transaction History** - Complete expense timeline

### ✅ User Experience
- **Responsive Design** - Works on all devices
- **Modern UI** - Clean, intuitive interface
- **Local Storage** - Fast data persistence
- **Real-time Updates** - Instant feedback

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Context API** - State management

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Supabase** - Database and authentication
- **JWT** - Token-based authentication
- **Google OAuth** - Social login

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### 1. Clone Repository
```bash
git clone https://github.com/sonujacob2026/your-repo-name.git
cd your-repo-name
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend folder:
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Server
PORT=5000
FRONTEND_URL=http://localhost:5174
```

### 3. Frontend Setup
```bash
cd ../Finance
npm install
```

Create `.env` file in Finance folder:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_URL=http://localhost:5000
```

### 4. Start Development Servers

**Backend:**
```bash
cd backend
node server.js
```

**Frontend:**
```bash
cd Finance
npm run dev
```

## 🎯 Usage

1. **Register/Login** - Create account or use Google sign-in
2. **Complete Questionnaire** - Set up your financial profile
3. **Add Expenses** - Click "Add Expense" button
4. **View Analytics** - See real-time statistics
5. **Manage Expenses** - Edit or delete transactions

## 📊 Expense Categories

- 🍽️ Food & Dining
- 🚗 Transportation
- 🛍️ Shopping
- 🎬 Entertainment
- 📄 Bills & Utilities
- 🏥 Healthcare
- 📚 Education
- ✈️ Travel
- 🛒 Groceries
- ⛽ Gas
- 📦 Other

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/google-code` - Google OAuth
- `GET /health` - Health check

### Frontend Routes
- `/` - Landing page
- `/auth` - Login/Register
- `/questionnaire` - Financial profile setup
- `/dashboard` - Main expense dashboard

## 🚀 Deployment

### Backend Deployment
1. Deploy to Heroku, Railway, or similar
2. Set environment variables
3. Update CORS settings

### Frontend Deployment
1. Build: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Update API URLs

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Sonu Jacob**
- GitHub: [@sonujacob2026](https://github.com/sonujacob2026)
- Email: sonujacob2026@mca.ajce.in

## 🙏 Acknowledgments

- Supabase for backend services
- Google for OAuth integration
- Tailwind CSS for styling
- React team for the framework

---

**Built with ❤️ by Sonu Jacob**
