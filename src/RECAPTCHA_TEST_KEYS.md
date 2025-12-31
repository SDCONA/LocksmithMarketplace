# ⚠️ reCAPTCHA Test Keys - DEVELOPMENT ONLY

## Current Status
Your app is currently using **Google's official test keys** for reCAPTCHA v3.

### Why?
Test keys work on **ALL domains** including Figma Make preview environments, localhost, and any testing environment. This solves the "Bot detection failed" error in Figma Make.

---

## Test Keys Currently In Use

**Frontend Site Key** (in `/utils/recaptcha.ts`):
```
6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
```

**Backend Secret Key** (in `/supabase/functions/server/recaptcha-verify.tsx`):
```
6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe
```

---

## ⚠️ BEFORE PRODUCTION DEPLOYMENT

You **MUST** replace these test keys with your real production keys:

### Your Real Keys
**Site Key:** `6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW`  
**Secret Key:** (stored in `RECAPTCHA_SECRET_KEY` environment variable)

### How to Switch Back

1. **Update Frontend** (`/utils/recaptcha.ts`):
   ```typescript
   const HARDCODED_SITE_KEY = '6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW';
   ```

2. **Update Backend** (`/supabase/functions/server/recaptcha-verify.tsx`):
   - Remove the `TEST_SECRET_KEY` constant
   - Make sure `RECAPTCHA_SECRET_KEY` environment variable is set with your real secret key

3. **Update reCAPTCHA Domains** (at https://www.google.com/recaptcha/admin):
   - Add your production domain
   - Add any staging/preview domains
   - **Remove** `localhost` and test domains for production

---

## How Test Keys Work

**Benefits:**
- ✅ Work on ALL domains (no domain restrictions)
- ✅ Always pass validation
- ✅ Perfect for development and testing
- ✅ No setup required

**Limitations:**
- ❌ **NO BOT PROTECTION** - any request will pass
- ❌ **NOT SECURE** - do not use in production
- ❌ Always return score of 1.0 (perfect human score)
- ❌ Will not actually protect your app from bots

---

## Testing Checklist

✅ **Development (Current State)**
- Test keys working in Figma Make ✓
- Test keys working in browser ✓
- Sign up/login working everywhere ✓

⚠️ **Before Production**
- [ ] Replace frontend site key with real key
- [ ] Replace backend secret key with real key
- [ ] Test on production domain
- [ ] Verify domains in reCAPTCHA admin console
- [ ] Confirm bot protection is active

---

## Documentation

- Google reCAPTCHA Admin: https://www.google.com/recaptcha/admin
- Test Keys Documentation: https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do

---

**Last Updated:** December 30, 2025  
**Status:** Using test keys for development/testing
