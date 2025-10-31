# 🔗 Update CLIENT_URL in Render

Your backend needs to know your frontend URL for CORS and Socket.io connections.

---

## 🎯 Quick Steps

### 1. Get Your Netlify URL

After deploying to Netlify, you'll get a URL like:
```
https://your-app-name.netlify.app
```

### 2. Update Render Environment Variable

1. Go to: https://dashboard.render.com
2. Click on your service: **chaturway-app** (or whatever you named it)
3. Go to: **"Environment"** tab
4. Find: **CLIENT_URL** variable
5. **Update the value** to your Netlify URL
6. Click: **"Save Changes"**

### 3. Redeploy

After saving:
- Render will automatically redeploy
- Or manually: "Manual Deploy" → "Deploy latest commit"
- Wait 2-3 minutes

---

## 📝 Example

**Before:**
```
CLIENT_URL = https://your-old-app.netlify.app
```

**After (update to your actual Netlify URL):**
```
CLIENT_URL = https://your-app-name.netlify.app
```

---

## ⚠️ Important Notes

1. **No trailing slash:** Don't add `/` at the end
   - ✅ `https://app.netlify.app`
   - ❌ `https://app.netlify.app/`

2. **Include https://:** Always use `https://` not `http://`

3. **Exact match:** Make sure it matches your actual Netlify URL exactly

---

## ✅ After Updating

### Check CORS Works:
- Try logging in from your Netlify site
- Should connect without CORS errors

### Check Socket.io Works:
- Open browser console on Netlify site
- Should see Socket.io connected
- Should be able to send/receive messages in real-time

---

## 🆘 CORS Errors?

If you get CORS errors:

1. **Double-check CLIENT_URL** matches Netlify URL exactly
2. **Wait 2-3 minutes** after updating (deployment takes time)
3. **Clear browser cache** and refresh
4. **Check Render logs** for CORS errors

---

## 📊 Current Setup

**Backend:** `https://chaturway-app.onrender.com` ✅  
**Frontend:** `https://your-netlify-app.netlify.app` (update CLIENT_URL to this)

---

**Update CLIENT_URL and you're all set!** 🚀

