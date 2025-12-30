# 🔄 RESTART YOUR DEV SERVER

## ⚠️ IMPORTANT: You Must Restart!

The `.env` file has been created/updated with your reCAPTCHA site key, but **Vite only loads environment variables when the server starts**.

---

## 🚀 How to Restart

### Step 1: Stop the Current Server

In your terminal where the dev server is running, press:

```
Ctrl + C
```

(On Mac: `Cmd + C` or `Control + C`)

---

### Step 2: Start the Server Again

```bash
npm run dev
```

**Or if you're using a different package manager:**
```bash
yarn dev
# or
pnpm dev
```

---

### Step 3: Hard Refresh Your Browser

After the server restarts, **hard refresh** your browser to clear any cached JavaScript:

- **Chrome/Edge (Windows):** `Ctrl + Shift + R`
- **Chrome/Edge (Mac):** `Cmd + Shift + R`
- **Firefox (Windows):** `Ctrl + F5`
- **Firefox (Mac):** `Cmd + Shift + R`
- **Safari (Mac):** `Cmd + Option + R`

---

## ✅ Verify It Worked

After restarting, check your **browser console** (F12 → Console tab).

You should see:

```
✅ [reCAPTCHA] Site key configured: 6LdGWjssAA...
```

Instead of:

```
❌ [reCAPTCHA] Site key not configured
```

---

## 🧪 Quick Test

1. Click **"Sign Up"** or **"Login"**
2. Fill in the form
3. Submit
4. Should work without any "site key not configured" errors

---

## 🐛 Still Seeing the Error?

If you still see "reCAPTCHA site key not configured" after restarting:

1. **Verify `.env` file location:**
   ```bash
   ls -la .env
   ```
   Should be in the same directory as `package.json`

2. **Verify `.env` file contents:**
   ```bash
   cat .env
   ```
   Should output:
   ```
   VITE_RECAPTCHA_SITE_KEY=6LdGWjssAAAAAH5g7mzG4romZvU31tbjdQ2rplMW
   ```

3. **Check the troubleshooting guide:**
   See [RECAPTCHA_TROUBLESHOOTING.md](RECAPTCHA_TROUBLESHOOTING.md) for detailed fixes

---

## 🎯 Expected Flow

```
1. Create/Edit .env file ✅ (DONE)
                ↓
2. Stop dev server        ← YOU ARE HERE
                ↓
3. Start dev server
                ↓
4. Hard refresh browser
                ↓
5. Check console for success message
                ↓
6. Test signup/login
                ↓
7. ✅ reCAPTCHA working!
```

---

## 📋 Complete Checklist

- [x] ✅ `.env` file created with site key
- [x] ✅ `.gitignore` updated to protect `.env`
- [ ] ⏳ **Stop dev server** (`Ctrl+C`)
- [ ] ⏳ **Start dev server** (`npm run dev`)
- [ ] ⏳ **Hard refresh browser** (`Ctrl+Shift+R`)
- [ ] ⏳ **Check console** for success message
- [ ] ⏳ **Test signup/login**

---

## 🎉 After Restart

Once restarted, your reCAPTCHA protection will be **fully active** and you can:

- Test user registration (with bot protection)
- Test user login (with bot protection)
- See reCAPTCHA scores in server logs
- View analytics at https://www.google.com/recaptcha/admin

---

**Next Step:** Stop your server (`Ctrl+C`) and start it again (`npm run dev`)
