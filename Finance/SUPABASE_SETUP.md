# Supabase Setup Guide

## 🔧 Email Authentication Configuration

### 1. Enable Email Confirmation
1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/jiovydnhmelpgoyoqoua
2. Navigate to **Authentication > Settings**
3. Under **User Signups**, ensure:
   - ✅ **Enable email confirmations** is checked
   - ✅ **Enable email change confirmations** is checked

### 2. Configure Email Templates
1. Go to **Authentication > Email Templates**
2. Customize the **Confirm signup** template:
   ```html
   <h2>Confirm your signup</h2>
   <p>Follow this link to confirm your account:</p>
   <p><a href="{{ .ConfirmationURL }}">Confirm your account</a></p>
   ```

### 3. Set Redirect URLs
1. Go to **Authentication > URL Configuration**
2. Add these **Redirect URLs**:
   - `http://localhost:5176/dashboard`
   - `http://localhost:5176/reset-password`
   - `http://localhost:5176/auth/callback`
   - `https://your-domain.com/dashboard` (for production)
   - `https://your-domain.com/reset-password` (for production)

## 🔐 Password Reset Configuration

### 1. Configure Reset Password Email Template
1. Go to **Authentication > Email Templates**
2. Select **Reset Password** template
3. Update the template:
   ```html
   <h2>Reset your password</h2>
   <p>Follow this link to reset the password for your user {{ .Email }}:</p>
   <p><a href="{{ .ConfirmationURL }}">Reset Password</a></a></p>
   <p>If you didn't request this, you can ignore this email.</p>
   ```

### 2. Verify Site URL
1. Go to **Authentication > URL Configuration**
2. Ensure **Site URL** is set to: `http://localhost:5176` (development)

### 3. Test Password Reset
1. Use the forgot password feature
2. Check email for reset link
3. Verify link contains: `access_token`, `refresh_token`, `type=recovery`

## 🚀 Google OAuth Configuration

### 1. Enable Google Provider
1. Go to **Authentication > Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - **Client ID**: `973276495187-ngffqvjuu5sr1ao39baer6ec123pjldo.apps.googleusercontent.com`
   - **Client Secret**: (from Google Cloud Console)

### 2. Configure Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add **Authorized redirect URIs**:
   - `https://jiovydnhmelpgoyoqoua.supabase.co/auth/v1/callback`

## 📊 Database Setup (Optional)

### Create User Profiles Table
```sql
-- Create a table for user profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  onboarding_completed boolean default false,
  financial_profile jsonb,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a trigger to automatically create a profile for new users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## ✅ Testing Checklist

- [ ] Email signup works
- [ ] Email confirmation received
- [ ] Email confirmation link works
- [ ] Google OAuth works
- [ ] User redirected to dashboard after confirmation
- [ ] User metadata saved correctly
