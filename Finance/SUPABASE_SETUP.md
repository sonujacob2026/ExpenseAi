# Supabase Setup Guide

## Environment Variables Required

Create a `.env` file in your `Finance` directory with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Google OAuth (if using backend)
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Backend API URL (if using custom backend)
VITE_API_URL=http://localhost:5000
```

## How to Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project or select existing one
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key
5. Update your `.env` file with these values

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add your domain to authorized origins
6. Copy the Client ID to your `.env` file

## Mobile Testing Configuration

### **For Local Network Testing:**

1. **Update Vite config** (already done):
   ```js
   server: {
     host: '0.0.0.0', // Allow external access
     port: 5173
   }
   ```

2. **Find your computer's IP address:**
   - **Windows**: `ipconfig` in CMD
   - **Mac/Linux**: `ifconfig` or `ip addr` in terminal

3. **Access from mobile:**
   ```
   http://YOUR_IP:5173
   ```

4. **Update Supabase redirect URLs** to include your IP:
   ```
   http://localhost:5173/reset-password
   http://YOUR_IP:5173/reset-password
   http://localhost:5173/auth/callback
   http://YOUR_IP:5173/auth/callback
   ```

### **For Public Testing (ngrok):**

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   ```

2. **Create tunnel:**
   ```bash
   ngrok http 5173
   ```

3. **Use ngrok URL** and add to Supabase redirect URLs

## Testing the Setup

1. Restart your development server after adding environment variables
2. Check browser console for any configuration errors
3. Try signing in with Google - it should now work properly
4. Test password reset on both desktop and mobile

## Troubleshooting

- **DNS Error**: Make sure your Supabase URL is correct and accessible
- **Authentication Error**: Verify your anon key is correct
- **Google Sign-in Fails**: Check that Google OAuth is properly configured in Supabase
- **CORS Error**: Ensure your domain is added to Supabase allowed origins
- **Mobile Access**: Use `host: '0.0.0.0'` in Vite config for network access
