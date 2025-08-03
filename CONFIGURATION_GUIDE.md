# ExpenseAI Configuration Guide

## 🚀 **Current Status**

✅ **Backend**: Running on http://localhost:5000  
✅ **Frontend**: Running on http://localhost:5174  
✅ **Database**: Supabase connected with all tables created  
✅ **Authentication**: Email/Username + Password working  
⚠️ **Google OAuth**: Not configured (optional)  

## 🔧 **Configurations Made**

### **1. Backend Configuration**
- ✅ Supabase URL and keys configured
- ✅ JWT secret configured
- ✅ CORS enabled for frontend
- ✅ Rate limiting active
- ✅ Dynamic validation working
- ✅ Database schema deployed

### **2. Frontend Configuration**
- ✅ Real-time validation connected to backend
- ✅ Fallback mode when backend unavailable
- ✅ Clean error handling
- ✅ Password strength indicator
- ✅ Username validation with regex

### **3. Database Configuration**
- ✅ All tables created in Supabase
- ✅ Row Level Security enabled
- ✅ Validation constraints active
- ✅ Indexes for performance
- ✅ Triggers for auto-updates

## 🔐 **Google OAuth Setup (Optional)**

If you want to enable Google sign-in:

### **Step 1: Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set application type to "Web application"
6. Add authorized origins:
   - `http://localhost:5174` (frontend)
   - `http://localhost:5000` (backend)
7. Add authorized redirect URIs:
   - `http://localhost:5174/auth/callback`

### **Step 2: Update Backend Environment**
Add to `backend/.env`:
```env
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
```

### **Step 3: Install Google Auth Library**
```bash
cd backend
npm install google-auth-library
```

## 🧪 **Testing Your Setup**

### **Test Backend API**
```bash
# Health check
curl http://localhost:5000/health

# Username validation
curl "http://localhost:5000/api/auth/validate-username/testuser"

# Password validation
curl -X POST http://localhost:5000/api/auth/validate-password \
  -H "Content-Type: application/json" \
  -d '{"password":"TestPass123!"}'

# User registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User"
  }'
```

### **Test Frontend Features**
1. **Username Validation**: Type invalid usernames to see real-time errors
2. **Password Strength**: Watch the strength meter as you type
3. **Email Validation**: Try invalid email formats
4. **Registration**: Create a new account
5. **Login**: Sign in with created account

## 🛡️ **Security Features Active**

✅ **Rate Limiting**: 5 auth attempts per 15 minutes  
✅ **Input Validation**: All fields validated server-side  
✅ **Password Requirements**: 8+ chars, mixed case, numbers, symbols  
✅ **Username Rules**: Must start with letter, alphanumeric only  
✅ **CORS Protection**: Only frontend domain allowed  
✅ **JWT Tokens**: Secure session management  
✅ **Row Level Security**: Database-level user isolation  

## 🔄 **How It Works**

### **Registration Flow**
1. Frontend validates input in real-time
2. Backend validates all data again
3. Supabase creates auth user
4. Profile created in user_profiles table
5. JWT token generated and returned

### **Login Flow**
1. User enters email/username + password
2. Backend validates credentials with Supabase
3. User profile fetched from database
4. JWT token generated for session
5. User redirected to dashboard

### **Validation Flow**
1. Real-time validation as user types
2. Backend API endpoints for validation
3. Fallback client-side validation if backend unavailable
4. Visual feedback with error messages and strength indicators

## 📱 **Next Steps**

1. **Test the complete authentication flow**
2. **Customize validation rules if needed**
3. **Set up Google OAuth if desired**
4. **Deploy to production when ready**

Your ExpenseAI application is now fully configured and ready to use!
