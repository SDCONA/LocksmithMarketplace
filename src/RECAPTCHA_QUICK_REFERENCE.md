# 🔐 reCAPTCHA Quick Reference Card

## ✅ Status: ACTIVE & PROTECTING

---

## 🔑 Your Keys

### Frontend (Public)
```
Site Key: 6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
Location: /.env → VITE_RECAPTCHA_SITE_KEY
```

### Backend (Secret)
```
Secret Key: Already configured in Supabase
Location: Supabase Edge Functions → RECAPTCHA_SECRET_KEY
```

---

## 🎯 What's Protected

✅ User Sign Up  
✅ User Login

**Threshold**: `0.5` (moderate security)

---

## 🧪 Quick Test

1. **Start dev server**: `npm run dev`
2. **Try signing up** with a new email
3. **Check console** for: `"reCAPTCHA verified successfully"`

### Expected Logs

**Browser Console**:
```
✅ reCAPTCHA script loaded
```

**Server Logs** (Supabase):
```
✅ Signup request - reCAPTCHA score: 0.9
✅ reCAPTCHA verified successfully: score 0.9, action signup
```

---

## 🔧 Adjust Threshold

**File**: `/supabase/functions/server/index.tsx`

```typescript
// Line ~208 (Signup)
verifyRecaptcha(recaptchaToken, 'signup', 0.5); // Change 0.5

// Line ~358 (Login)
verifyRecaptcha(recaptchaToken, 'login', 0.5); // Change 0.5
```

**Values**:
- `0.3` = Loose (fewer false positives)
- `0.5` = **Default** (balanced)
- `0.7` = Strict (more secure)

---

## 🚀 Production Deployment

### Before Going Live:
1. ✅ Add your domain to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. ✅ Set `VITE_RECAPTCHA_SITE_KEY` in Vercel/Netlify
3. ✅ Backend already configured (Supabase)

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| "Bot detection failed" | Wait between tests, try different IP |
| Keys not working | Restart server with `npm run dev` |
| Domain error | Add domain in reCAPTCHA admin |
| Score too low | Lower threshold to 0.3 temporarily |

---

## 📊 Monitor

**View Analytics**: [reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)

**Check Server Logs**: Supabase → Edge Functions → Logs

---

## 📚 Full Docs

- [Setup Complete](/RECAPTCHA_SETUP_COMPLETE.md)
- [Setup Guide](/RECAPTCHA_SETUP_GUIDE.md)
- [Google Docs](https://developers.google.com/recaptcha/docs/v3)

---

**Last Updated**: Dec 30, 2025
