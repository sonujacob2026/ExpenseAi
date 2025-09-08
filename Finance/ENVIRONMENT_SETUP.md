# Environment Setup Guide

## Quick Fix for Payment Button

The Pay button is now working in **Demo Mode**! It will simulate payments without requiring external API keys.

## To Enable Real Payment Processing

Create a `.env` file in the `Finance` directory with the following variables:

```bash
# Supabase Configuration (Required for real payments)
VITE_SUPABASE_URL=https://jiovydnhmelpgoyoqoua.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key_here

# Razorpay Configuration (Required for real payments)
VITE_RAZORPAY_KEY_ID=your_actual_razorpay_key_id_here

# Optional: Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Optional: Backend API URL
VITE_API_URL=http://localhost:5000
```

## How to Get the Required Keys

### 1. Supabase Keys
1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy the **Project URL** and **anon public** key
5. Add them to your `.env` file

### 2. Razorpay Keys
1. Go to [razorpay.com](https://razorpay.com) and sign in
2. Go to **Settings** → **API Keys**
3. Copy your **Key ID** and **Key Secret**
4. Add the Key ID to your `.env` file

## Current Status

✅ **Demo Mode Active**: Pay button works with simulated payments
✅ **Mark Paid**: Works without external APIs
✅ **Delete**: Works without external APIs
✅ **Add Recurring**: Works without external APIs
✅ **Edge Function Error Fixed**: No more "Failed to send a request to the Edge Function" errors

## Testing the Pay Button

1. **In Demo Mode** (current):
   - Click "Pay (Demo)" button
   - Confirm the demo payment dialog
   - Expense will be marked as paid

2. **In Production Mode** (after adding API keys):
   - Click "Pay" button
   - Razorpay checkout will open
   - Complete real payment

## Troubleshooting

- **If you see "Payment system not configured"**: You're in demo mode (this is normal)
- **If you see network errors**: Check your Supabase URL and keys
- **If Razorpay doesn't load**: Check your Razorpay Key ID

## Next Steps

1. The Pay button is now functional in demo mode
2. To enable real payments, add the environment variables above
3. Restart your development server after adding the `.env` file
4. The button will automatically switch from "Pay (Demo)" to "Pay"
