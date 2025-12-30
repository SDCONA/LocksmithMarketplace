# reCAPTCHA v3 Setup Guide

## Overview

This application uses **Google reCAPTCHA v3** to protect user registration and login from bot attacks. reCAPTCHA v3 runs invisibly in the background and scores user interactions (0.0 to 1.0) without requiring user interaction like checkboxes or image challenges.

## Protected Actions

✅ **User Registration (Sign Up)** - Prevents bot account creation  
✅ **User Login (Sign In)** - Prevents credential stuffing attacks

## How It Works

### Client-Side (Frontend)
1. When a user submits a login or signup form, the app requests a reCAPTCHA token
2. The token is generated invisibly without user interaction
3. The token is sent to the server along with the form data

### Server-Side (Backend)
1. Server receives the reCAPTCHA token
2. Verifies the token with Google's reCAPTCHA API
3. Checks the score (minimum threshold: 0.5)
4. Allows or blocks the request based on the score

## Setup Instructions

### Step 1: Get reCAPTCHA Keys

1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Click **"+"** to create a new site
3. Fill in the form:
   - **Label**: Locksmith Marketplace (or your app name)
   - **reCAPTCHA type**: Select **reCAPTCHA v3**
   - **Domains**: Add your domains (e.g., `localhost`, `yourdomain.com`)
   - Accept the terms and click **Submit**
4. You'll receive two keys:
   - **Site Key** (public) - Used in the frontend
   - **Secret Key** (private) - Used in the backend

### Step 2: Configure Frontend (Site Key)

1. Create a `.env` file in your project root (if it doesn't exist)
2. Add your reCAPTCHA Site Key:

```env
VITE_RECAPTCHA_SITE_KEY=your_site_key_here
```

3. **Important**: Add `.env` to your `.gitignore` to prevent committing secrets

### Step 3: Configure Backend (Secret Key)

The backend uses Supabase Edge Functions which store environment variables securely.

1. You should have already been prompted to upload your **RECAPTCHA_SECRET_KEY** via the modal
2. If not, you can set it manually in your Supabase dashboard:
   - Go to **Project Settings** → **Edge Functions**
   - Add a new secret: `RECAPTCHA_SECRET_KEY` with your secret key value

### Step 4: Test the Implementation

1. **Restart your development server** to load the new environment variable:
   ```bash
   npm run dev
   ```

2. Try to sign up or log in - you should see console logs indicating reCAPTCHA verification

3. Check the browser console for reCAPTCHA scores (in development mode)

## Configuration Options

### Score Threshold

The minimum score threshold is set to **0.5** (moderate security). You can adjust this in:

**File**: `/supabase/functions/server/index.tsx`

```typescript
// For signup
const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'signup', 0.5);

// For login  
const recaptchaResult = await verifyRecaptcha(recaptchaToken, 'login', 0.5);
```

**Score Guidelines**:
- `0.0` - Very likely a bot
- `0.1-0.3` - Suspicious activity
- `0.4-0.6` - Moderate risk
- `0.7-1.0` - Very likely a human

**Recommended Values**:
- `0.3` - Loose (fewer false positives, more bot risk)
- `0.5` - **Default** (balanced)
- `0.7` - Strict (more false positives, fewer bots)

## Development Mode (No Keys Required)

If you don't configure reCAPTCHA keys, the app will still work:

- **Frontend**: Skips reCAPTCHA token generation
- **Backend**: Skips verification and allows requests through

This allows development and testing without reCAPTCHA setup.

## Files Modified

### Frontend
- `/utils/recaptcha.ts` - reCAPTCHA utility functions
- `/components/AuthModal.tsx` - Integrated reCAPTCHA into login/signup forms
- `/utils/auth.ts` - Updated to pass reCAPTCHA tokens to backend
- `/.env.example` - Example environment variable configuration

### Backend
- `/supabase/functions/server/recaptcha-verify.tsx` - Server-side verification
- `/supabase/functions/server/index.tsx` - Added verification to auth routes

## Troubleshooting

### Issue: "reCAPTCHA not loaded" in console

**Solution**: The reCAPTCHA script loads dynamically. This warning is normal and the app will continue without reCAPTCHA if keys aren't configured.

### Issue: "Bot detection failed" error on login/signup

**Possible causes**:
1. **Site key not configured** - Add `VITE_RECAPTCHA_SITE_KEY` to `.env`
2. **Secret key not configured** - Add `RECAPTCHA_SECRET_KEY` to Supabase Edge Function secrets
3. **Domain not whitelisted** - Add your domain in reCAPTCHA admin console
4. **Score too low** - User action appears suspicious, try from a different IP or lower the threshold

### Issue: Keys not working

**Checklist**:
- ✅ Created reCAPTCHA v3 site (not v2)
- ✅ Added correct domains to reCAPTCHA admin
- ✅ Restarted development server after adding `.env`
- ✅ Using correct keys (Site Key for frontend, Secret Key for backend)
- ✅ Keys don't have extra spaces or quotes

### Issue: Getting low scores during testing

This is normal. During rapid testing, Google may flag your IP as suspicious. Solutions:
- Use a real browser (not headless/automation)
- Test from different IPs or wait between tests
- Temporarily lower the threshold for testing

## Security Best Practices

1. **Never commit your `.env` file** - Always add it to `.gitignore`
2. **Use environment variables** - Don't hardcode keys in code
3. **Regenerate keys if exposed** - If keys are accidentally committed, regenerate them immediately
4. **Monitor reCAPTCHA analytics** - Check the reCAPTCHA admin dashboard for suspicious activity
5. **Keep threshold reasonable** - Too strict = legitimate users blocked, too loose = bots get through

## Production Deployment

### Vercel/Netlify
Add environment variables in your hosting platform's dashboard:
- `VITE_RECAPTCHA_SITE_KEY` = your site key

### Supabase Edge Functions
Environment variables are already configured via the Supabase dashboard.

### Important
Make sure to add your production domain to the reCAPTCHA admin console's domain list!

## Additional Resources

- [Google reCAPTCHA v3 Documentation](https://developers.google.com/recaptcha/docs/v3)
- [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
- [Best Practices Guide](https://developers.google.com/recaptcha/docs/v3#best_practices)

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check server logs in Supabase Edge Function logs
3. Verify your keys in the reCAPTCHA admin dashboard
4. Test with reCAPTCHA disabled (remove keys) to isolate the issue
