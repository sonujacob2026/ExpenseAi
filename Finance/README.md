# ExpenseAI - Smart Money Management Made Simple

A professional AI-powered expense tracking and budget management application built with React, Tailwind CSS, and frontend-only authentication.

## Features

- 🏠 **Professional Landing Page** - Walnut-style design with modern UI
- 🔐 **Frontend Authentication** - Simple sign up/sign in with local storage
- 📋 **Smart Onboarding** - 6-step questionnaire to understand user needs
- 💰 **Expense Tracking** - Ready for AI-powered categorization and insights
- 📊 **Budget Planning** - Framework for intelligent budget recommendations
- 📱 **Responsive Design** - Works on all devices
- 👨‍👩‍👧‍👦 **Family Support** - Multi-member household management
- 🌐 **Google Sign-In** - Continue with Google option (frontend demo)

## Frontend-Only Demo

This application is currently set up as a frontend-only demo with:
- Local storage for user data persistence
- Mock authentication system
- Complete user flow from landing page to dashboard
- All data stored in browser localStorage

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd Finance
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

## User Flow

1. **Landing Page** - Professional introduction with "Sign In" buttons
2. **Authentication** - Sign up/sign in with email or "Continue with Google"
3. **Questionnaire** - 6-step onboarding process:
   - Household members
   - Monthly income
   - Debt status
   - Primary expenses
   - Budgeting experience
   - Financial goals
4. **Dashboard** - Personalized financial overview

## Technology Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Authentication**: Frontend-only with localStorage
- **State Management**: React Context API
- **Deployment**: Ready for Vercel, Netlify, or any static host

## Key Changes Made

✅ **Removed Backend Dependencies** - No Supabase or external APIs  
✅ **Frontend Authentication** - Simple email/password with localStorage  
✅ **Google Sign-In UI** - Professional Google sign-in button (demo)  
✅ **Local Data Storage** - All user data stored in browser  
✅ **Updated Button Text** - "Get Started" changed to "Sign In"  
✅ **Complete User Flow** - From landing page to dashboard  

## Development

- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`
- **Lint code**: `npm run lint`

## Future Backend Integration

When ready to add backend functionality:

1. **Choose Backend Service** (Supabase, Firebase, custom API)
2. **Replace AuthContext** with real authentication
3. **Add Database Schema** for user profiles and expenses
4. **Implement Real Google OAuth** 
5. **Add API Integration** for expense tracking
6. **Implement AI Features** for budget recommendations

## License

MIT License - see LICENSE file for details
