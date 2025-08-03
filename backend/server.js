const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  res.sendStatus(200);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ExpenseAI Backend is running',
    timestamp: new Date().toISOString()
  });
});









// Google OAuth Sign-In endpoint
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('📨 Received Google OAuth request:', req.body);
    const { credential } = req.body;

    if (!credential) {
      console.log('❌ No credential provided');
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    console.log('🔐 Verifying Google token...');
    console.log('🔑 Using Client ID:', process.env.GOOGLE_CLIENT_ID);

    // Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Google token verified for:', payload.email);

    // Extract user information
    const googleUser = {
      googleId: payload.sub,
      email: payload.email,
      fullName: payload.name,
      firstName: payload.given_name,
      lastName: payload.family_name,
      picture: payload.picture,
      emailVerified: payload.email_verified
    };

    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    let user;

    if (existingUser) {
      // Update existing user
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: googleUser.fullName,
          picture_url: googleUser.picture,
          provider: 'google',
          google_id: googleUser.googleId,
          updated_at: new Date().toISOString()
        })
        .eq('email', googleUser.email)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update user profile'
        });
      }

      user = updatedUser;
      console.log('✅ User updated:', user.email);
    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          email: googleUser.email,
          full_name: googleUser.fullName,
          picture_url: googleUser.picture,
          provider: 'google',
          google_id: googleUser.googleId,
          email_verified: googleUser.emailVerified,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        console.error('❌ Error details:', JSON.stringify(createError, null, 2));
        return res.status(500).json({
          success: false,
          message: `Failed to create user profile: ${createError.message}`,
          error: createError
        });
      }

      user = newUser;
      console.log('✅ New user created:', user.email);
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        provider: 'google'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          picture: user.picture_url,
          onboardingCompleted: user.onboarding_completed,
          provider: user.provider
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Google OAuth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// Google OAuth Code Exchange endpoint
app.post('/api/auth/google-code', async (req, res) => {
  try {
    console.log('📨 Received Google OAuth code exchange request');
    const { code } = req.body;

    if (!code) {
      console.log('❌ No authorization code provided');
      return res.status(400).json({
        success: false,
        message: 'Authorization code is required'
      });
    }

    console.log('🔄 Exchanging code for tokens...');

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'postmessage'
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokens.access_token) {
      console.error('❌ Failed to get access token:', tokens);
      return res.status(400).json({
        success: false,
        message: 'Failed to exchange code for tokens'
      });
    }

    // Get user info from Google
    const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
    const googleUser = await userResponse.json();

    console.log('✅ Google user info retrieved:', googleUser.email);

    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', googleUser.email)
      .single();

    let user;

    if (existingUser) {
      // User already exists, just update their info
      const { data: updatedUser, error: updateError } = await supabase
        .from('user_profiles')
        .update({
          full_name: googleUser.name,
          email_verified: true
        })
        .eq('email', googleUser.email)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        return res.status(500).json({
          success: false,
          message: 'Failed to update user profile'
        });
      }

      user = updatedUser;
      console.log('✅ User updated:', user.email);
    } else {
      // Create new user
      console.log('📝 Creating new user with data:', {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        id: googleUser.id
      });

      // Create new user (simplified version)
      const { data: newUser, error: createError } = await supabase
        .from('user_profiles')
        .insert({
          email: googleUser.email,
          full_name: googleUser.name,
          email_verified: googleUser.verified_email || true,
          onboarding_completed: false
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating user:', createError);
        console.error('❌ Error details:', JSON.stringify(createError, null, 2));
        return res.status(500).json({
          success: false,
          message: `Failed to create user profile: ${createError.message}`,
          error: createError
        });
      }

      user = newUser;
      console.log('✅ New user created:', user.email);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        provider: 'google'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Return user data and token
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          picture: googleUser.picture, // Use Google picture directly
          onboardingCompleted: user.onboarding_completed,
          provider: 'google'
        },
        token
      }
    });

  } catch (error) {
    console.error('❌ Google OAuth code exchange error:', error);
    res.status(500).json({
      success: false,
      message: 'Google authentication failed'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 ExpenseAI Backend Server Started');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/health`);
  console.log(`📋 API Base: http://localhost:${PORT}/api`);
  console.log(`🔐 Google OAuth: Configured`);
});
