# ⚠️ URGENT: Fix MONGO_URI Missing Error in Render

Your deployment is failing because **MONGO_URI** environment variable is not set in Render.

## 🔧 How to Fix It (Right Now)

### Step 1: Go to Render Dashboard
1. Go to: https://dashboard.render.com
2. Click on your **chaturway-backend** service
3. Click **"Environment"** in the left sidebar

### Step 2: Add Environment Variables

Click **"Add Environment Variable"** and add these **ONE BY ONE**:

#### 1️⃣ MONGO_URI (REQUIRED)
```
Key:   MONGO_URI
Value: mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority
```
✅ **Critical:** Copy the entire value exactly as shown above

#### 2️⃣ JWT_SECRET (REQUIRED)
Generate a secure key first:
- Go to: https://randomkeygen.com/
- Copy a **256-bit** random key

Then set:
```
Key:   JWT_SECRET
Value: [paste your generated key here]
```

#### 3️⃣ NODE_ENV (Optional but recommended)
```
Key:   NODE_ENV
Value: production
```

#### 4️⃣ CLIENT_URL (For later)
```
Key:   CLIENT_URL
Value: https://your-netlify-app.netlify.app
```
⏰ **Note:** You can set this later after deploying frontend

### Step 3: Save and Redeploy

1. After adding **MONGO_URI** and **JWT_SECRET**, click **"Save Changes"**
2. Go to **"Manual Deploy"** → Click **"Deploy latest commit"**
3. Wait for deployment to complete
4. Check logs to see if it works

---

## 🎯 Visual Guide

```
Render Dashboard → Your Service → Environment → Add Environment Variable

┌─────────────────────────────────┐
│ Key:   MONGO_URI                │
│ Value: mongodb+srv://...        │
│ ┌─────────┐  ┌──────────────┐  │
│ │ Cancel  │  │ Save Changes │  │
│ └─────────┘  └──────────────┘  │
└─────────────────────────────────┘
```

---

## ✅ After Adding MONGO_URI

Your deployment should now:
1. ✅ Build successfully
2. ✅ Connect to MongoDB Atlas
3. ✅ Start the server
4. ✅ Be accessible at your Render URL

---

## 🆘 Still Not Working?

### Check These Things:

1. **MongoDB Atlas Cluster is Running?**
   - Go to: https://cloud.mongodb.com
   - Check if your cluster shows "Resume" button
   - If paused, click "Resume" and wait

2. **IP Whitelisted in Atlas?**
   - Go to: MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allows all IPs)
   - Wait 2 minutes for changes to take effect

3. **Connection String Correct?**
   - Double-check the entire MONGO_URI value
   - Make sure there are no spaces before/after
   - Ensure `%40` is used for `@` symbol (not just `@`)

4. **Render Logs Show What Error?**
   - Click "Logs" tab in Render
   - Look for specific error messages
   - Share error if still stuck

---

## 📸 Screenshot References

**Where to Add Environment Variables:**
```
Dashboard → Services → [Your Service] → Environment → Add Variable
```

**What It Looks Like:**
```
Environment Variables

Name:         Value:
MONGO_URI     mongodb+srv://madudamian...
JWT_SECRET    [your-secret-key]
NODE_ENV      production
CLIENT_URL    (leave blank for now)
```

---

## 🚀 Quick Checklist

Before redeploying, verify:
- [ ] MONGO_URI is added in Render Environment
- [ ] JWT_SECRET is added in Render Environment  
- [ ] MongoDB Atlas cluster is running (not paused)
- [ ] IP `0.0.0.0/0` is whitelisted in Atlas
- [ ] You clicked "Deploy latest commit" after adding env vars

---

## 📞 Need Help?

Common errors and solutions:
- **"Cluster is paused"** → Resume cluster in Atlas
- **"Authentication failed"** → Check username/password in MONGO_URI
- **"Connection timeout"** → Add IP to whitelist in Atlas
- **"PORT missing"** → Don't worry, Render sets this automatically

---

**Once MONGO_URI is set, your backend will deploy successfully!** 🎉

