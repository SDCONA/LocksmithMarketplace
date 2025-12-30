# reCAPTCHA v3 Quick Start

## ⚡ 5-Minute Setup

### 1. Get Your Keys (2 minutes)

1. Go to: https://www.google.com/recaptcha/admin
2. Click **"+"** to register a new site
3. Choose **reCAPTCHA v3**
4. Add domains: `localhost` (for testing)
5. Submit and copy both keys:
   - **Site Key** (starts with `6L...`)
   - **Secret Key** (starts with `6L...`)

### 2. Configure Frontend (1 minute)

Create `.env` file in project root:

```env
VITE_RECAPTCHA_SITE_KEY=6LxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxXX
```

### 3. Configure Backend (1 minute)

You should have already been prompted to upload `RECAPTCHA_SECRET_KEY`.

If not, go to:
- Supabase Dashboard → Project Settings → Edge Functions → Secrets
- Add secret: `RECAPTCHA_SECRET_KEY` = your secret key

### 4. Restart & Test (1 minute)

```bash
# Restart your dev server
npm run dev
```

Then test:
1. Open the app
2. Click "Login" or "Register"
3. Submit the form
4. Check browser console - should see reCAPTCHA score
5. Check server logs - should see verification messages

## ✅ That's It!

Your app is now protected against bots on:
- ✅ User Registration
- ✅ User Login

## 🎯 What Happens Now?

- **With valid keys**: reCAPTCHA runs invisibly, scoring each request
- **Without keys**: App works normally but skips reCAPTCHA (dev mode)
- **Bot detected**: Request is blocked with "Bot detection failed" error
- **Human detected**: Request proceeds normally

## 📊 Monitoring

Check reCAPTCHA Analytics:
1. Go to: https://www.google.com/recaptcha/admin
2. Select your site
3. View traffic, scores, and suspicious activity

## 🛠️ Troubleshooting

### "Bot detection failed" error?
- Restart dev server after adding `.env`
- Check keys are correct (no extra spaces)
- Add domain to reCAPTCHA admin console

### Not working?
```bash
# Check if environment variable is loaded
console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY)
```

### Want to disable temporarily?
Remove or comment out the keys in `.env` and Supabase secrets.

## 📚 More Information

- **Full Setup Guide**: `/RECAPTCHA_SETUP_GUIDE.md`
- **Implementation Details**: `/RECAPTCHA_IMPLEMENTATION_SUMMARY.md`
- **Google Docs**: https://developers.google.com/recaptcha/docs/v3

---

**Need Help?** Check the full setup guide or Google's documentation.
