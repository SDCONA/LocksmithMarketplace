# Locksmith Marketplace

A comprehensive automotive key search and marketplace platform with user registration, messaging, admin panel, and retailer deals system.

## Features

- 🔍 **Vehicle Search** - Search across 77 years of vehicle data using JobDataPro structure
- 🛒 **Marketplace** - Buy and sell automotive keys and parts
- 💬 **Messaging System** - In-app messaging between buyers and sellers
- 👤 **User Accounts** - Complete registration and profile management
- 🛡️ **Admin Panel** - Full CRUD functionality and content moderation
- 🏪 **Retailer Deals** - Retailer profiles, deal management, and CSV bulk upload
- 📊 **Reports System** - Content reporting and moderation tools
- 🔒 **Security Testing Suite** - Comprehensive automated security verification
- 📱 **Responsive Design** - Mobile-first design with beautiful UI

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: TailwindCSS 3.4, Radix UI, Lucide Icons
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Vercel account (for deployment)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd locksmith-marketplace
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=https://ifijijocxohjhoznmbry.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

   Get your keys from: https://supabase.com/dashboard/project/ifijijocxohjhoznmbry/settings/api

4. **Add banner images**

   Place promotional banner images in `/public/banners/`:
   - xhorse-mega-sale.png
   - xhorse-tools.png
   - uhs-smart-pro.png
   - uhs-locktoberfest.png
   - yckg-sonata.png
   - yckg-hyundai-kia.png
   - keydirect-xt57b.png
   - keydirect-ford-madness.png
   - transponder-island.png
   - car-truck-remotes.png
   - best-key-supply-prime.png
   - best-key-supply-maverick.png
   - noble-key-supply-refurbishing.png
   - noble-key-supply-shipping.png
   - key-innovations-halloween.png
   - key-innovations-prime-deals.png
   - locksmith-keyless-new-month.png
   - locksmith-keyless-new-week.png

5. **Run development server**

   ```bash
   npm run dev
   ```

   Open http://localhost:5173

## Database Setup

### 1. Run Migrations

Execute SQL migrations in this order:

```bash
# Core schema
migrations/001_initial_schema.sql

# Performance optimizations
migrations/002_performance_optimizations.sql

# Message images
migrations/003_add_message_images.sql

# Banner positions
migrations/004_banner_positions.sql

# Promotional banners
migrations/005_promotional_banners.sql

# Deals system
supabase/migrations/deals_system_schema.sql

# Platform policies
supabase/migrations/20241201_platform_policies_only.sql

# Notifications and reports
supabase/migrations/20241201_fix_notifications_and_reports.sql
```

### 2. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
cd supabase/functions
supabase functions deploy server
```

### 3. Set Environment Variables in Supabase

In your Supabase dashboard under Settings → Edge Functions, add:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Option 2: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click "Deploy"

### Environment Variables for Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://ifijijocxohjhoznmbry.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Project Structure

```
/
├── components/          # React components
│   ├── ui/             # Reusable UI components (Radix)
│   ├── deals/          # Deals-related components
│   └── figma/          # Figma-specific utilities
├── utils/              # Utility functions
│   ├── services/       # API service layers
│   └── supabase/       # Supabase client config
├── supabase/
│   └── functions/
│       └── server/     # Edge function routes
├── migrations/         # SQL migrations
├── public/            # Static assets
│   └── banners/       # Promotional banner images
└── styles/            # Global CSS
```

## Key Files

- `/App.tsx` - Main application component
- `/main.tsx` - React entry point
- `/vite.config.ts` - Vite configuration
- `/vercel.json` - Vercel deployment config
- `/supabase/functions/server/index.tsx` - Edge function server

## Admin Access

To become an admin:

1. Create your user account
2. Run this SQL in Supabase SQL Editor:

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

## Features Overview

### Marketplace

- Browse and search automotive key listings
- Advanced filtering (vehicle type, location, price)
- Save favorite listings
- Contact sellers directly

### Deals System

- Retailer profiles with custom banners
- Deal creation and management
- 2-day expiration timer
- CSV bulk upload (10 deals/day limit)
- Public deals page with filtering

### Admin Panel

- User management
- Content moderation
- Reports review system
- Promotional banner management
- Deal approval/rejection

### Messaging

- Real-time messaging between users
- Image attachments
- Message notifications
- Conversation history

## Building for Production

```bash
npm run build
```

The optimized production build will be in `/build`.

## Troubleshooting

### Issue: Images not loading

- Make sure banner images are in `/public/banners/`
- Check console for 404 errors

### Issue: Supabase connection errors

- Verify environment variables are set correctly
- Check Supabase project is active
- Ensure RLS policies are configured

### Issue: Edge function errors

- Redeploy edge functions: `supabase functions deploy server`
- Check edge function logs in Supabase dashboard
- Verify service role key is set

## Support

For issues or questions:

1. Check existing documentation in `/migrations/` and `/guidelines/`
2. Review SQL schemas for database structure
3. Check Supabase logs for backend errors

## License

Private project - All rights reserved

---

**Built with ❤️ for the automotive locksmith industry**