# 🚀 Deploy Your Backend to Render - FINAL STEPS

## ✅ Your JWT Secret Key (READ THIS FILE FIRST!)

Open `JWT_SECRET_KEY.md` to get your secret key.

---

## 🔧 Step 1: Add Environment Variables to Render

1. Go to: https://dashboard.render.com
2. Click on your **chaturway-backend** service
3. Click **"Environment"** tab

### Add These Variables:

#### 1️⃣ MONGO_URI ⚠️ REQUIRED
Click "Add Environment Variable":
```
Key:   MONGO_URI
Value: mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority
```
Click "Save"

#### 2️⃣ JWT_SECRET ⚠️ REQUIRED  
Click "Add Environment Variable":
```
Key:   JWT_SECRET
Value: [COPY THIS FROM JWT_SECRET_KEY.md FILE]
```
Click "Save"

#### 3️⃣ OPENAI_API_KEY (For AI Features)
Click "Add Environment Variable":
```
Key:   OPENAI_API_KEY
Value: [Get this from JWT_SECRET_KEY.md file]
```
Click "Save"

⚠️ **Important:** Get the actual OpenAI API key from the `JWT_SECRET_KEY.md` file in your project.

#### 4️⃣ CLIENT_URL (Important for CORS)
Click "Add Environment Variable":
```
Key:   CLIENT_URL
Value: https://your-netlify-app.netlify.app
```
Click "Save"

⚠️ **Important:** Replace with your actual Netlify URL after deploying frontend!

#### 5️⃣ NODE_ENV (Optional)
Click "Add Environment Variable":
```
Key:   NODE_ENV  
Value: production
```
Click "Save"

---

## 📊 Step 2: Check MongoDB Atlas

Before deploying, verify:

1. **Cluster is Running:**
   - Go to: https://cloud.mongodb.com
   - Check if cluster shows "Resume" button
   - If paused, click "Resume" and wait

2. **IP Whitelisted:**
   - Go to: Network Access → Add IP Address
   - Add: `0.0.0.0/0` (allows all IPs)
   - Click "Confirm"
   - Wait 2 minutes

---

## 🎯 Step 3: Deploy!

1. In Render dashboard, go to **"Manual Deploy"** tab
2. Click **"Deploy latest commit"**
3. Wait 2-5 minutes for deployment

---

## ✅ Step 4: Verify Deployment

After deployment completes:

1. Check **Logs** tab - you should see:
   ```
   ✅ Connected to MongoDB Atlas → charturway001
   🚀 Server running on port 10000
   ```

2. Test the health endpoint:
   - Go to: `https://chaturway-backend.onrender.com/health`
   - Should return: `{"status":"ok","message":"Server is running"}`

---

## 🆘 Troubleshooting

### "MONGO_URI missing"
- You didn't add MONGO_URI environment variable
- Go back to Step 1

### "Cluster is paused"  
- Resume cluster in MongoDB Atlas
- Wait 2 minutes, then redeploy

### "Connection timeout"
- Add `0.0.0.0/0` to IP whitelist in Atlas
- Wait 2 minutes, then redeploy

### Server crashes
- Check logs for specific error
- Most common: missing environment variables

---

## 🎉 Success!

Once your backend is running:

1. ✅ Copy your backend URL: `https://chaturway-backend.onrender.com`
2. ⏭️ Next: Update Netlify environment variables
3. 📖 See: `DEPLOYMENT.md` for frontend deployment

---

## 📝 Quick Reference

**Your MongoDB Atlas Connection:**
```
mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority
```

**Your JWT Secret:** (see `JWT_SECRET_KEY.md`)

**Required Environment Variables:**
- ✅ MONGO_URI
- ✅ JWT_SECRET
- ✅ OPENAI_API_KEY (enables AI features)
- ⚠️ NODE_ENV (optional)

---

**Let's deploy! 🚀**

