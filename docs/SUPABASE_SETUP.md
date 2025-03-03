# Supabase Setup for Green Compass App

This document provides instructions on how to set up Supabase for authentication in the Green Compass app.

## Prerequisites

- A Supabase account (create one at [supabase.com](https://supabase.com) if you don't have one)
- Node.js and npm installed

## Steps to Set Up Supabase

### 1. Create a Supabase Project

1. Log in to your Supabase account
2. Click on "New Project"
3. Enter a name for your project
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

### 2. Get Your Supabase Credentials

1. In your Supabase project dashboard, go to Project Settings > API
2. Copy the "Project URL" and "anon/public" key
3. Update the `.env` file in the root of the project with these values:

```
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set Up Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure the authentication providers you want to use (Email, OAuth providers, etc.)
3. For email authentication, you can enable "Confirm email" if you want users to verify their email

### 4. Create a User Profile Table

Run the following SQL in the Supabase SQL Editor to create a profiles table:

```sql
-- Create a table for public profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  
  CONSTRAINT proper_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Create a trigger to automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 5. Testing Authentication

After setting up Supabase, you can test authentication using the provided AuthContext in the app:

```typescript
import { useAuth } from '../context/AuthContext';

// In your component
const { signUp, signIn, signOut, user } = useAuth();

// Sign up
const handleSignUp = async () => {
  const { error } = await signUp('test@example.com', 'password123');
  if (error) console.error('Error signing up:', error.message);
};

// Sign in
const handleSignIn = async () => {
  const { error } = await signIn('test@example.com', 'password123');
  if (error) console.error('Error signing in:', error.message);
};

// Sign out
const handleSignOut = async () => {
  const { error } = await signOut();
  if (error) console.error('Error signing out:', error.message);
};
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
