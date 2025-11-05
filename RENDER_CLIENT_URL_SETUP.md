# 🚀 Render Environment Variable Setup - CLIENT_URL

## Set CLIENT_URL in Render Dashboard

To allow your Netlify frontend (https://chaturway001.netlify.app) to communicate with your Render backend, you need to set the `CLIENT_URL` environment variable in Render.

### Steps:

1. **Go to Render Dashboard**
   - Navigate to: https://dashboard.render.com
   - Click on your service: **chaturway-app** (or your backend service name)

2. **Open Environment Tab**
   - Click on the **"Environment"** tab in the left sidebar

3. **Add CLIENT_URL Variable**
   - Click **"Add Environment Variable"** button
   - Add the following:
     ```
     Key:   CLIENT_URL
     Value: https://chaturway001.netlify.app
     ```
   - Click **"Save Changes"**

4. **Redeploy (if needed)**
   - Render will automatically redeploy when you save environment variables
   - Or manually trigger a redeploy from the **"Manual Deploy"** tab

### ✅ Verification

After setting the environment variable, your Render logs should show:
```
🌍 CORS Configuration:
   NODE_ENV: production
   Allowed origins: [ 'http://localhost:5173', 'http://localhost:3000', 'https://chaturway001.netlify.app' ]
```

When requests come from your Netlify app, you'll see:
```
🔍 CORS check for origin: https://chaturway001.netlify.app
✅ Allowing: origin in allowed list
```

### 📝 Complete Environment Variables Checklist

Make sure you have **ALL** of these set in Render:

- ✅ **MONGODB_URI** (or MONGO_URI) - Your MongoDB connection string
- ✅ **JWT_SECRET** - Your secret key for JWT tokens
- ✅ **CLIENT_URL** - Set to `https://chaturway001.netlify.app` ← **ADD THIS NOW!**
- ✅ **NODE_ENV** - Set to `production`
- ✅ **OPENAI_API_KEY** - (Optional) For AI features
- ✅ **GOOGLE_API_KEY** - (Optional) For translation features

### 🔗 Your URLs

- **Frontend:** https://chaturway001.netlify.app
- **Backend API:** https://chaturway-app.onrender.com/api
- **Socket.IO:** https://chaturway-app.onrender.com

---

**Note:** The server code has been updated to explicitly allow `https://chaturway001.netlify.app` in the CORS configuration, so it will work even if the environment variable isn't set. However, setting it explicitly is recommended for clarity and future flexibility.

