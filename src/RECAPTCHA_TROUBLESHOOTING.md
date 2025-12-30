# 🔧 reCAPTCHA Troubleshooting - "Site Key Not Configured"

## ❌ Error Message
```
reCAPTCHA site key not configured
```

---

## ✅ Quick Fix - Follow These Steps

### 1️⃣ Verify `.env` File Exists

**Check if the file exists:**
```bash
ls -la .env
```

**The file should contain:**
```env
VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

**⚠️ IMPORTANT**: 
- No spaces around the `=` sign
- No quotes around the value
- Must be named exactly `.env` (with the dot at the beginning)
- Must be in the **root directory** of your project (same level as `package.json`)

---

### 2️⃣ Restart Your Dev Server

**This is the most common fix!** Vite only loads environment variables when the server starts.

**Stop the server:**
- Press `Ctrl + C` in your terminal

**Start it again:**
```bash
npm run dev
```

**Or if using a different command:**
```bash
yarn dev
# or
pnpm dev
```

---

### 3️⃣ Verify the Key is Loaded

After restarting, check your browser console. You should see:

✅ **Success:**
```
[reCAPTCHA] Site key configured: 6LdGWjssAA...
```

❌ **Still failing:**
```
[reCAPTCHA] Site key not configured. Set VITE_RECAPTCHA_SITE_KEY in .env file and restart dev server.
```

---

## 🔍 Still Not Working? Try These

### Check #1: File Location
The `.env` file must be in your **project root**, not in a subdirectory.

**Correct location:**
```
your-project/
├── .env          ← HERE (same level as package.json)
├── package.json
├── src/
├── public/
└── ...
```

**Wrong location:**
```
your-project/
├── package.json
├── src/
│   └── .env      ← NOT HERE
└── ...
```

---

### Check #2: File Name
Make sure the file is named exactly `.env` (starts with a dot)

**Check hidden files:**
```bash
# On Mac/Linux
ls -la | grep .env

# On Windows (PowerShell)
Get-ChildItem -Force | Where-Object {$_.Name -eq ".env"}
```

---

### Check #3: Variable Name
The variable **must** be prefixed with `VITE_` for Vite to expose it to the browser.

**✅ Correct:**
```env
VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

**❌ Wrong:**
```env
RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

---

### Check #4: No Extra Characters
Make sure there are no extra spaces, quotes, or characters.

**✅ Correct:**
```env
VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

**❌ Wrong (has quotes):**
```env
VITE_RECAPTCHA_SITE_KEY="6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW"
```

**❌ Wrong (has spaces):**
```env
VITE_RECAPTCHA_SITE_KEY = 6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

---

### Check #5: File Encoding
Make sure the file is saved as UTF-8, not UTF-16 or another encoding.

**In VS Code:**
- Look at the bottom right corner
- Should say "UTF-8"
- If not, click it and select "Save with Encoding" → "UTF-8"

---

## 🧪 Manual Test

You can manually test if Vite is reading the environment variable:

1. Open your browser console (F12)
2. Type this and press Enter:
```javascript
console.log(import.meta.env.VITE_RECAPTCHA_SITE_KEY)
```

**Expected result:**
```
6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

**If you get `undefined`:**
- The `.env` file is not being read
- Make sure you restarted the dev server
- Check file location and name

---

## 🛠️ Complete Reset Steps

If nothing else works, try a complete reset:

### 1. Stop the dev server
```bash
Ctrl + C
```

### 2. Delete the `.env` file (if it exists)
```bash
rm .env
```

### 3. Create a fresh `.env` file
```bash
# On Mac/Linux
echo "VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW" > .env

# On Windows (PowerShell)
"VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW" | Out-File -FilePath .env -Encoding utf8
```

### 4. Verify the file was created correctly
```bash
cat .env
```

**Should output:**
```
VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
```

### 5. Clear Vite cache (optional but helpful)
```bash
rm -rf node_modules/.vite
```

### 6. Start the dev server
```bash
npm run dev
```

### 7. Hard refresh your browser
- Chrome/Edge: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Firefox: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)

---

## 📝 Quick Checklist

Use this checklist to verify everything:

- [ ] `.env` file exists in project root
- [ ] File contains `VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW`
- [ ] No quotes around the value
- [ ] No spaces around the `=` sign
- [ ] File is saved as UTF-8
- [ ] Dev server was **restarted** after creating `.env`
- [ ] Browser was hard refreshed after restart
- [ ] Browser console shows `[reCAPTCHA] Site key configured: ...`

---

## 🎯 Expected Console Output

After fixing, you should see these logs in order:

```javascript
// 1. When the app loads
[reCAPTCHA] Site key configured: 6LdGWjssAA...

// 2. When you try to sign up or login
// (no error, just silent token generation)

// 3. In the Network tab (optional check)
// You'll see a request to:
https://www.google.com/recaptcha/api.js?render=6LdGWjssAA...
```

---

## ⚠️ Common Mistakes

### Mistake #1: Didn't Restart Server
**Symptom:** File exists but error persists  
**Fix:** Stop server (`Ctrl+C`) and start again (`npm run dev`)

### Mistake #2: Wrong File Name
**Symptom:** Created `.env.local` instead of `.env`  
**Fix:** Vite uses `.env` by default. Rename to `.env`

### Mistake #3: File in Wrong Directory
**Symptom:** File exists but not in project root  
**Fix:** Move `.env` to same directory as `package.json`

### Mistake #4: Typo in Variable Name
**Symptom:** File is correct but variable name is wrong  
**Fix:** Must be exactly `VITE_RECAPTCHA_SITE_KEY` (case-sensitive)

---

## 🆘 Still Not Working?

If you've tried everything above and it's still not working:

### Last Resort #1: Hardcode for Testing
**⚠️ ONLY FOR TESTING, REMOVE BEFORE COMMITTING**

Edit `/utils/recaptcha.ts`:
```typescript
// Temporary hardcoded key for testing
export const RECAPTCHA_SITE_KEY = '6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW';
```

This will prove that reCAPTCHA works. Then go back and fix the `.env` issue.

### Last Resort #2: Check Vite Version
```bash
npm list vite
```

Make sure you're using Vite 4.x or 5.x. Earlier versions might handle env vars differently.

### Last Resort #3: Check for Other `.env` Files
```bash
ls -la .env*
```

If you have `.env.local`, `.env.development`, or `.env.production`, they might be overriding `.env`.

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Console shows: `[reCAPTCHA] Site key configured: 6LdGWjssAA...`
2. ✅ No warning: `reCAPTCHA site key not configured`
3. ✅ Sign up/login works without errors
4. ✅ Supabase logs show: `reCAPTCHA verified successfully: score X.XX`

---

## 📚 Additional Resources

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Quick Reference Guide](RECAPTCHA_QUICK_REFERENCE.md)
- [Full Setup Guide](RECAPTCHA_SETUP_GUIDE.md)

---

**Last Updated:** December 30, 2025  
**Issue:** Site Key Not Configured  
**Status:** Fixable with Server Restart
