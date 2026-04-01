# Authentication Setup Guide

This guide covers setting up Supabase authentication for PasBills.

## Prerequisites

- Supabase account (free tier available at https://supabase.com)
- Node.js and npm installed

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name**: PasBills
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
4. Click "Create new project" and wait for setup (2-3 minutes)

## Step 2: Get API Keys

1. Once project is ready, go to **Project Settings** (gear icon)
2. Click **API** in the sidebar
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Step 3: Configure Environment Variables

1. Create `.env.local` file in project root (if not already exists)
2. Add your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Step 4: Configure Email Settings (Optional)

For email confirmations and password resets:

1. Go to **Authentication** > **Providers**
2. Enable "Email"
3. Go to **Email Templates** to customize messages
4. For production: Configure SMTP settings under **Email** settings

## Step 5: Set Redirect URLs

1. Go to **Authentication** > **URL Configuration**
2. Add this redirect URL:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

## Features Implemented

✅ **Sign Up** (`/auth/signup`)

- Email and password registration
- Password validation (8+ chars, uppercase, number)
- Confirmation email sent

✅ **Sign In** (`/auth/signin`)

- Email and password login
- Persistent session
- Remember me functionality

✅ **Forgot Password** (`/auth/forgot-password`)

- Email-based password reset
- Reset link sent via email

✅ **Reset Password** (`/auth/reset-password`)

- New password creation after clicking reset link
- Password strength validation

✅ **Protected Routes**

- Middleware redirects unauthenticated users to signin
- Automatic session persistence across page reloads

✅ **Auth Context**

- Global auth state management
- Easy access to user info via `useAuth()` hook

## Usage in Components

```typescript
import { useAuth } from "@/lib/auth/auth-context";

export function MyComponent() {
  const { user, signIn, signOut, isLoading } = useAuth();

  return (
    <div>
      <p>Logged in as: {user?.email}</p>
      <button onClick={signOut}>Logout</button>
    </div>
  );
}
```

## Testing Authentication

1. Start dev server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signup`
3. Create a test account
4. Check confirmation email
5. Sign in with your credentials
6. You should be redirected to dashboard

## Troubleshooting

### "NEXT_PUBLIC_SUPABASE_URL is not set"

- Add your environment variables to `.env.local`
- Restart the dev server

### Emails not sending

- Check Supabase email settings
- Use test credentials if SMTP not configured
- Check spam folder for emails

### Session not persisting

- Clear browser localStorage/cookies
- Check if auth callback is properly configured
- Verify middleware is running

## File Structure

```
app/
├── auth/
│   ├── signin/page.tsx          # Sign in page
│   ├── signup/page.tsx          # Sign up page
│   ├── forgot-password/page.tsx # Forgot password page
│   ├── reset-password/page.tsx  # Reset password page
│   └── callback/page.tsx        # OAuth callback handler
└── page.tsx                      # Main dashboard (protected)

lib/
├── auth/
│   └── auth-context.tsx         # Auth provider & hooks
└── supabase/
    └── client.ts                # Supabase client config

middleware.ts                     # Route protection middleware
.env.local                        # Environment variables
```

## Next Steps

1. ✅ Authentication working
2. Store user preferences in Supabase
3. Create user profile table
4. Link transactions to users
5. Multi-device session management
6. Two-factor authentication (optional)

## Security Notes

- Never commit `.env.local` to git
- Keep anon key public (it's designed to be)
- Store sensitive operations in authenticated RLS policies
- Use proper database Row Level Security (RLS) policies
- Always validate inputs server-side

## Support

For issues or questions:

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub Issues](https://github.com/supabase/supabase/issues)
