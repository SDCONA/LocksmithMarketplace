# ✅ reCAPTCHA Testing Checklist

Use this checklist to verify your reCAPTCHA implementation is working correctly.

---

## 🧪 Pre-Test Setup

- [ ] Dev server is running (`npm run dev`)
- [ ] `.env` file exists with `VITE_RECAPTCHA_SITE_KEY`
- [ ] Browser is open to `http://localhost:5173`
- [ ] Browser console is open (F12 → Console tab)
- [ ] Supabase Edge Function logs are open (optional)

---

## 🔍 Frontend Tests

### Test 1: Script Loading
- [ ] Refresh the page
- [ ] Check browser console
- [ ] Should see: `"reCAPTCHA script loaded"` or similar
- [ ] No errors about missing VITE_RECAPTCHA_SITE_KEY

**Expected Result**: ✅ Script loads without errors

---

### Test 2: Sign Up Form
- [ ] Click "Sign Up" button
- [ ] Fill in all required fields:
  - [ ] First Name
  - [ ] Last Name
  - [ ] Email
  - [ ] Phone
  - [ ] Password
  - [ ] Location
  - [ ] City
- [ ] Click "Create Account"
- [ ] Wait for response

**Expected Result**: ✅ Account created successfully (or email already exists)

---

### Test 3: Login Form
- [ ] Click "Login" button (if not already there)
- [ ] Enter email and password
- [ ] Click "Sign In"
- [ ] Wait for response

**Expected Result**: ✅ Logged in successfully

---

## 🔧 Backend Tests

### Test 4: Server Logs (Signup)

Open Supabase Dashboard → Edge Functions → Logs

- [ ] Look for recent `POST /make-server-a7e285ba/signup` request
- [ ] Should see: `"Signup request - email: ..., reCAPTCHA score: X.XX"`
- [ ] Should see: `"reCAPTCHA verified successfully: score X.XX, action signup"`

**Expected Score**: 0.5 or higher

**Expected Result**: ✅ Verification logs appear with good score

---

### Test 5: Server Logs (Login)

Open Supabase Dashboard → Edge Functions → Logs

- [ ] Look for recent `POST /make-server-a7e285ba/signin` request
- [ ] Should see: `"Sign in request for email: ..., reCAPTCHA score: X.XX"`
- [ ] Should see: `"reCAPTCHA verified successfully: score X.XX, action login"`

**Expected Score**: 0.5 or higher

**Expected Result**: ✅ Verification logs appear with good score

---

## 🚨 Error Tests

### Test 6: Missing Token (Simulated)

This test verifies error handling when reCAPTCHA fails.

**How to simulate**:
1. Temporarily rename `.env` to `.env.backup`
2. Restart dev server
3. Try to sign up

**Expected Result**: ❌ Should show error (or allow through if backend doesn't have RECAPTCHA_SECRET_KEY)

**Cleanup**: Rename `.env.backup` back to `.env` and restart server

---

### Test 7: Low Score (Natural)

This might happen if you:
- Test too rapidly (multiple signups in 30 seconds)
- Use a VPN
- Use automation tools

**Expected Result**: ❌ "Bot detection failed" error
**Note**: This is actually a good sign - it means reCAPTCHA is working!

**Solution**: Wait 1-2 minutes and try again

---

## 📊 Analytics Tests

### Test 8: reCAPTCHA Dashboard

1. [ ] Go to https://www.google.com/recaptcha/admin
2. [ ] Select your site
3. [ ] Click on analytics/overview
4. [ ] Should see recent requests
5. [ ] Should see score distribution

**Expected Result**: ✅ Dashboard shows your test requests

---

## 🌐 Production Tests (Before Launch)

### Test 9: Domain Configuration
- [ ] Production domain added to reCAPTCHA admin
- [ ] `VITE_RECAPTCHA_SITE_KEY` set in hosting platform (Vercel/Netlify)
- [ ] `RECAPTCHA_SECRET_KEY` still in Supabase (already done)

---

### Test 10: Production Signup
- [ ] Deploy to production
- [ ] Visit production URL
- [ ] Try signing up with a real email
- [ ] Check Supabase logs for verification

**Expected Result**: ✅ Works same as development

---

## ✅ Final Verification

All tests passed? Check these off:

- [ ] ✅ reCAPTCHA script loads on app mount
- [ ] ✅ Signup form successfully sends reCAPTCHA token
- [ ] ✅ Login form successfully sends reCAPTCHA token
- [ ] ✅ Server receives and verifies tokens
- [ ] ✅ Server logs show scores ≥ 0.5
- [ ] ✅ Accounts can be created
- [ ] ✅ Users can log in
- [ ] ✅ Error handling works (when token missing)
- [ ] ✅ reCAPTCHA dashboard shows requests
- [ ] ✅ No console errors

---

## 🐛 Troubleshooting

### Issue: "reCAPTCHA site key not configured"

**Checklist**:
- [ ] `.env` file exists in project root
- [ ] `.env` contains `VITE_RECAPTCHA_SITE_KEY=...`
- [ ] Dev server was restarted after creating `.env`
- [ ] No typos in variable name (must be `VITE_RECAPTCHA_SITE_KEY`)

**Fix**: Create `.env`, add key, restart server

---

### Issue: "Bot detection failed" on every attempt

**Checklist**:
- [ ] Not testing too rapidly (wait 30+ seconds between tests)
- [ ] Not using VPN or proxy
- [ ] Using real browser (not automation)
- [ ] Domain is whitelisted in reCAPTCHA admin

**Fix**: Wait between tests, try different IP, or lower threshold temporarily

---

### Issue: Server doesn't log reCAPTCHA scores

**Checklist**:
- [ ] `RECAPTCHA_SECRET_KEY` is set in Supabase
- [ ] Backend code has `verifyRecaptcha()` calls
- [ ] Request is reaching the server (check network tab)

**Fix**: Verify secret key in Supabase Edge Function settings

---

### Issue: No errors, but no verification logs either

**Checklist**:
- [ ] Backend secret key might not be set
- [ ] Server is in "development mode" (allowing requests without verification)
- [ ] Check if `RECAPTCHA_SECRET_KEY` exists in Supabase

**Fix**: This is actually fine for development. Server will skip verification if key not set.

---

## 📝 Test Results

Record your test results here:

| Test | Status | Score | Notes |
|------|--------|-------|-------|
| Script Loading | ⬜ Pass / ⬜ Fail | N/A | |
| Signup Form | ⬜ Pass / ⬜ Fail | ____ | |
| Login Form | ⬜ Pass / ⬜ Fail | ____ | |
| Server Logs (Signup) | ⬜ Pass / ⬜ Fail | ____ | |
| Server Logs (Login) | ⬜ Pass / ⬜ Fail | ____ | |
| Error Handling | ⬜ Pass / ⬜ Fail | N/A | |
| reCAPTCHA Dashboard | ⬜ Pass / ⬜ Fail | N/A | |

---

## 🎉 All Tests Passed?

Congratulations! Your reCAPTCHA implementation is working perfectly.

**Next Steps**:
1. Monitor analytics for the first week
2. Adjust threshold if needed (based on false positives)
3. Before production: Add production domain to reCAPTCHA admin
4. Deploy with confidence!

---

## 📚 Need Help?

- [Quick Reference](RECAPTCHA_QUICK_REFERENCE.md) - One-page cheat sheet
- [Setup Guide](RECAPTCHA_SETUP_GUIDE.md) - Detailed troubleshooting
- [Implementation Summary](RECAPTCHA_IMPLEMENTATION_SUMMARY.md) - Technical details

---

**Last Updated**: December 30, 2025  
**Status**: Ready for Testing
