# MongoDB Setup Guide

## 🎯 Two MongoDB Options

Your application supports **two** MongoDB configurations:

### 1. Local MongoDB (Localhost) ⚠️ LOCAL DEVELOPMENT ONLY
- **Connection String:** `mongodb://localhost:27017/`
- **Use Case:** Running the app on your computer
- **❌ DOES NOT WORK** for Render or any cloud deployment
- **Requires:** MongoDB installed on your Windows PC

### 2. MongoDB Atlas (Cloud Database) ✅ FOR DEPLOYMENT
- **Connection String:** `mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority`
- **Use Case:** Cloud deployments (Render, Netlify, etc.)
- **✅ WORKS EVERYWHERE** - accessible from anywhere
- **Requires:** MongoDB Atlas account (free tier available)

---

## 🔧 Setup Instructions

### For LOCAL Development (Your Computer)

1. **Install MongoDB on Windows:**
   - Download: https://www.mongodb.com/try/download/community
   - Run the installer
   - MongoDB will start automatically

2. **Create `server/.env` file:**
   ```env
   MONGO_URI=mongodb://localhost:27017/
   PORT=5000
   JWT_SECRET=yourSuperSecretKeyHere
   ```

3. **Start the app:**
   ```bash
   cd server
   npm run dev
   ```

### For CLOUD Deployment (Render)

1. **Use your Atlas connection string** (already in README):
   ```env
   MONGO_URI=mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority
   JWT_SECRET=yourVerySecureSecretKey
   PORT=5000
   ```

2. **Configure MongoDB Atlas:**
   - Go to: https://cloud.mongodb.com
   - Log in with your credentials
   - Check your cluster is **NOT paused**
   - Go to **Network Access** → Add IP Address → `0.0.0.0/0`

3. **Deploy to Render:**
   - Set `MONGO_URI` to your Atlas connection string
   - Set `JWT_SECRET` to a secure random key
   - Do **NOT** set `PORT` (Render sets this automatically)

---

## 🚨 IMPORTANT NOTES

### Localhost MongoDB
- ❌ **Cannot** be accessed from Render or any cloud service
- ❌ Your Windows PC must be running for connections
- ✅ Only works on your local network

### MongoDB Atlas
- ✅ Works from anywhere (local, Render, anywhere on internet)
- ✅ Free tier: 512MB storage
- ✅ Managed by MongoDB (no installation needed)
- ✅ Automatic backups

---

## 🎓 Which Should You Use?

### Use Local MongoDB When:
- ✅ Developing/testing on your computer
- ✅ Learning and experimenting
- ✅ Offline development

### Use MongoDB Atlas When:
- ✅ Deploying to Render or any cloud
- ✅ Sharing your app with others
- ✅ Need reliable uptime
- ✅ Want automatic backups

---

## 🔍 Check Your Current Setup

### Find Your MongoDB Connection String

**Local:**
```bash
# In server/.env
MONGO_URI=mongodb://localhost:27017/
```

**Atlas:**
```bash
# In server/.env
MONGO_URI=mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority
```

---

## 🆘 Troubleshooting

### "Connection Refused" (Local)
- MongoDB not installed
- MongoDB service not running
- Port 27017 blocked by firewall
- **Solution:** Install MongoDB Community Edition

### "Network Timeout" (Atlas)
- Cluster is paused
- IP not whitelisted
- Wrong connection string
- **Solution:** Check Atlas dashboard, add IP 0.0.0.0/0

### "Authentication Failed" (Atlas)
- Wrong username/password
- Special characters not encoded (%40 for @)
- **Solution:** Reset database user in Atlas

---

## 📚 Resources

- MongoDB Installation: https://www.mongodb.com/docs/manual/installation/
- MongoDB Atlas Setup: https://www.mongodb.com/docs/atlas/getting-started/
- Free Atlas Tier: https://www.mongodb.com/cloud/atlas/register

---

## ✅ Quick Checklist

**For Render Deployment:**
- [ ] I have a MongoDB Atlas account
- [ ] My Atlas cluster is running (not paused)
- [ ] IP `0.0.0.0/0` is whitelisted in Atlas
- [ ] I'm using Atlas connection string for Render
- [ ] I have credentials (username: madudamian25_db_user)

**For Local Development:**
- [ ] MongoDB is installed on my PC
- [ ] MongoDB service is running
- [ ] I'm using `mongodb://localhost:27017/` in .env
- [ ] I know Render will NOT use this

---

Built with ❤️ for Chaturway Chat App

