# 🔐 Password Reset Fix Guide

## **Problem Description:**
When users click "Forgot Password" and receive the email, clicking the reset link shows "not found" even though the user exists in your system.

## **Root Causes:**
1. **Wrong Redirect URLs** in Supabase dashboard
2. **Missing Site URL** configuration
3. **Incorrect Route Handling** in the app

## **✅ Step-by-Step Fix:**

### **1. Fix Supabase Dashboard Configuration**

Go to your Supabase dashboard → **Authentication → Settings**

#### **Site URL Configuration:**
- **Site URL**: `http://localhost:5173` (or your dev server port)
- **Redirect URLs**: Add these URLs:
  ```
  http://localhost:5173/reset-password
  http://localhost:5173/auth/callback
  http://localhost:5173/dashboard
  http://localhost:5173/questionnaire
  ```

#### **Email Settings:**
- ✅ **Enable email confirmations** (turn ON)
- ✅ **Enable email change confirmations** (turn ON)
- ✅ **Enable secure email change** (turn ON)

### **2. Fix Email Templates**

Go to **Authentication → Email Templates**

#### **Reset Password Template:**
```html
<h2>Reset Your Password 🔐</h2>
<p>Click the button below to reset your password:</p>
<p><a href="{{ .ConfirmationURL }}" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset Password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>This link will expire in 24 hours.</p>
```

### **3. Check Your App Routes**

Make sure your app has the correct route for password reset:

```jsx
// In your App.jsx or router configuration
<Route path="/reset-password" element={<ResetPasswordPage />} />
```

### **4. Test the Password Reset Flow**

1. **Request password reset** from the forgot password form
2. **Check your email** for the reset link
3. **Click the reset link** - it should redirect to `/reset-password`
4. **Enter new password** and confirm
5. **Sign in** with the new password

## **🔍 Debugging Steps:**

### **Check Browser Console:**
Look for these log messages:
- `🔍 Processing password reset link...`
- `📍 Current URL: ...`
- `📍 Search params: ...`
- `✅ Session set successfully`

### **Check Network Tab:**
- Look for requests to Supabase
- Check if redirect URLs are correct
- Verify no 404 errors

### **Check Supabase Logs:**
- Go to Supabase dashboard → Logs
- Look for authentication events
- Check for any errors

## **🚨 Common Issues & Solutions:**

### **Issue 1: "Page Not Found" Error**
**Cause**: Wrong redirect URL in Supabase
**Solution**: Update redirect URLs in Supabase dashboard

### **Issue 2: Reset Link Expired**
**Cause**: Link expired (default: 24 hours)
**Solution**: Request a new password reset

### **Issue 3: Wrong Route in App**
**Cause**: App doesn't have `/reset-password` route
**Solution**: Add the route to your router

### **Issue 4: CORS Issues**
**Cause**: Domain not in allowed origins
**Solution**: Add your domain to Supabase CORS origins

## **📱 Production Configuration:**

When deploying to production:

1. **Update Site URL** to your production domain
2. **Add production redirect URLs**:
   ```
   https://yourdomain.com/reset-password
   https://yourdomain.com/auth/callback
   https://yourdomain.com/dashboard
   ```
3. **Update CORS origins** to include production domain
4. **Test the complete flow** in production

## **🧪 Testing Checklist:**

- [ ] Password reset email is sent
- [ ] Email contains correct reset link
- [ ] Clicking link redirects to `/reset-password`
- [ ] User can enter new password
- [ ] Password is updated successfully
- [ ] User can sign in with new password

## **🔧 Code Changes Made:**

1. **Enhanced ResetPasswordPage.jsx** with better URL parameter handling
2. **Improved SupabaseAuthContext.jsx** with better logging
3. **Added comprehensive error handling** for all reset scenarios
4. **Fixed redirect URL processing** for multiple parameter formats

## **📞 Still Having Issues?**

If the problem persists:

1. **Check Supabase logs** for authentication errors
2. **Verify email templates** are configured correctly
3. **Test with a fresh email** (old links may be expired)
4. **Check browser console** for detailed error messages
5. **Verify your Supabase project** is active and accessible

## **🎯 Expected Result:**

After implementing these fixes, users should be able to:
1. Click "Forgot Password"
2. Receive reset email
3. Click reset link
4. Be redirected to password reset page
5. Set new password
6. Sign in successfully 