# Supabase Admin Setup

This site uses Supabase for real admin login and database-backed content.

## 1. Create a Supabase project

Create a project at https://supabase.com and open its dashboard.

## 2. Create the content table

Open the Supabase SQL Editor and run the contents of `supabase-content.sql`.

That creates:
- `content_entries`
- public read access
- signed-in admin create/delete access

## 3. Create your admin user

Go to Authentication, then Users, and create the admin email/password user.

## 4. Add environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

You can find these in the Supabase dashboard under project API settings.

## 5. Restart the site

Restart the local preview after changing `.env`.

Then open:

```text
http://localhost:5174/#admin
```

If Supabase is configured, you will see the admin sign-in screen. If it is not configured, you will see the setup prompt.
