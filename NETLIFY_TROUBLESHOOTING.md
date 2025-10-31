# 🔧 Netlify Deployment Troubleshooting

## ✅ Just Fixed

**Fixed:** Publish path in `netlify.toml`
- **Before:** `publish = "client/dist"` ❌
- **After:** `publish = "dist"` ✅

**Why:** With `base = "client"`, all paths are relative to the client directory.

---

## 🚀 Deploy Again

Now that it's fixed, redeploy:

1. Go to Netlify dashboard
2. Click "Trigger deploy" → "Deploy latest commit"
3. Or push a new commit to trigger auto-deploy

---

## 🔍 Common Netlify Issues

### Build Command Fails

**Error:** "npm ci failed" or "Command not found"

**Solution:**
- Verify `base = "client"` in netlify.toml
- Check that `package.json` exists in client folder
- Ensure Node version is compatible (already set to 18)

### Environment Variables Not Working

**Error:** API calls failing, wrong URLs

**Solution:**
- Environment variables are in `netlify.toml` - they're set correctly
- Variables are prefixed with `VITE_` for Vite to pick them up
- Restart deploy after changing env vars

### Publish Directory Not Found

**Error:** "Directory does not exist: dist"

**Solution:**
- Check `base = "client"` is set
- Check `publish = "dist"` (relative to client, not client/dist)
- Verify build command succeeds

### Build Succeeds but Site Doesn't Work

**Possible Causes:**
1. **Missing dist files:**
   - Check build logs for errors
   - Verify vite build completed

2. **Routing issues:**
   - Check `_redirects` file in public folder
   - Verify SPA redirect rules in netlify.toml

3. **CORS issues:**
   - Backend needs to allow Netlify domain
   - Check Render logs for CORS errors

---

## ✅ Verified Configuration

### netlify.toml:
```toml
[build]
  base = "client"           ✅ Correct
  command = "npm ci && npm run build"  ✅ Correct
  publish = "dist"          ✅ Fixed!

[build.environment]
  NODE_VERSION = "18"       ✅ Set
  VITE_API_URL = "..."      ✅ Set
  VITE_SOCKET_URL = "..."   ✅ Set
```

### Expected Build Output:
```
✓ Built in XX.Xs
dist/index.html           X.XX kB
dist/assets/index-XXX.css  XX.XX kB
dist/assets/index-XXX.js   XXX.XX kB
```

---

## 🎯 If Still Failing

1. **Check Build Logs:**
   - Click on failed deploy in Netlify
   - Read the full error message
   - Look for specific line numbers

2. **Test Build Locally:**
   ```bash
   cd client
   npm ci
   npm run build
   ```
   Should create `client/dist` folder

3. **Check for Errors:**
   - Missing dependencies?
   - TypeScript errors?
   - Import errors?

---

## 📞 Get Help

**Share these details:**
1. Exact error message from Netlify logs
2. Build command output
3. Any specific file mentioned in errors

---

**Try deploying again - it should work now!** 🚀

