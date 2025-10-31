# Deployment Guide

## Issues Fixed
1. **Netlify Build Issue:** The application had **hardcoded localhost URLs** which don't work in production. This has been fixed.
2. **Render Deployment Issue:** The backend was missing deployment configuration files. Added `render.yaml` for Render deployment.

## Changes Made

### 1. Fixed Socket Connection (`client/src/utils/socket.js`)
- **Before:** Hardcoded `http://localhost:5000`
- **After:** Uses environment variable `VITE_SOCKET_URL` with localhost fallback

### 2. Fixed File Upload URLs (`client/src/components/MessageInput.jsx`)
- **Before:** Hardcoded `http://localhost:5000` in file upload responses
- **After:** Uses environment variable `VITE_API_URL` to construct base URL dynamically

### 3. Updated Netlify Configuration (`netlify.toml`)
- Added `VITE_SOCKET_URL` environment variable
- Both `VITE_API_URL` and `VITE_SOCKET_URL` are now configured

### 4. Created Render Configuration (`render.yaml`)
- Added proper Render deployment configuration
- Configured build and start commands
- Set up environment variables for Render

## Deployment Steps

### For Render Backend Deployment

1. **Connect Your Repository to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration

2. **Set Environment Variables in Render:**
   
   Go to your Render service → Environment and add:
   
   ```
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_very_secure_secret_key
   CLIENT_URL=https://your-netlify-app-url.netlify.app
   ```
   
   **Important Notes:**
   - `MONGO_URI`: Use your MongoDB Atlas connection string
   - `JWT_SECRET`: Create a strong random secret (e.g., generate at https://randomkeygen.com/)
   - `CLIENT_URL`: Your deployed Netlify frontend URL
   - **PORT** is automatically set by Render - don't override it!

3. **Configure the Service:**
   - **Root Directory:** Leave blank (Render uses `render.yaml`)
   - **Build Command:** `npm install` (auto-detected from render.yaml)
   - **Start Command:** `npm start` (auto-detected from render.yaml)
   - **Instance Type:** Free tier (or paid if needed)

4. **Deploy:**
   - Click "Create Web Service"
   - Render will build and deploy your backend
   - Wait for the deployment to complete

5. **Get Your Backend URL:**
   - After deployment, Render will give you a URL like: `https://chaturway-backend.onrender.com`
   - Copy this URL for the next step

### For Netlify Frontend Deployment

1. **Update Environment Variables in Netlify:**
   
   After your Render backend is deployed, go to your Netlify site settings → Environment variables and set:
   
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_SOCKET_URL=https://your-backend.onrender.com
   ```
   
   **Important:** Replace `your-backend.onrender.com` with your actual Render backend URL!

2. **Build Configuration (Already Set):**
   - Build base directory: `client`
   - Build command: `npm ci && npm run build`
   - Publish directory: `client/dist`
   - Node version: 18

### Deployment Order

**CRITICAL:** Deploy in this order:
1. ✅ **First:** Deploy backend to Render
2. ✅ **Second:** Update Netlify environment variables with Render backend URL
3. ✅ **Third:** Redeploy frontend on Netlify

### Testing Locally

Local development will still work with the fallback localhost URLs:
- Frontend: `npm run dev` (port 5173)
- Backend: `npm run dev` (port 5000)

## Common Deployment Issues

### Build Still Failing?

1. **Check Environment Variables:**
   - Ensure `VITE_API_URL` and `VITE_SOCKET_URL` are set in Netlify
   - Verify they don't have trailing slashes (except `/api` for API_URL)

2. **Verify Backend is Running:**
   - Your backend must be deployed and accessible
   - CORS must be configured to allow your Netlify URL

3. **Check Build Logs:**
   - Look for specific error messages in Netlify deploy logs
   - Most issues will show up clearly in the build output

### Socket Connection Issues

If socket.io isn't connecting in production:
- Verify `VITE_SOCKET_URL` is set correctly
- Check your backend has proper CORS configuration for Socket.io
- Ensure your backend server supports WebSocket connections

## Files Modified/Created

- ✅ `client/src/utils/socket.js` - Fixed hardcoded socket URL
- ✅ `client/src/components/MessageInput.jsx` - Fixed hardcoded file upload URLs  
- ✅ `netlify.toml` - Added VITE_SOCKET_URL environment variable
- ✅ `render.yaml` - Created Render deployment configuration
- ✅ `DEPLOYMENT.md` - This comprehensive deployment guide

## Complete Deployment Checklist

### Backend (Render)
- [ ] Create Render account
- [ ] Connect GitHub repository to Render
- [ ] Create new Web Service using render.yaml
- [ ] Set `MONGO_URI` environment variable
- [ ] Set `JWT_SECRET` environment variable
- [ ] Deploy backend and get URL
- [ ] Test backend health endpoint: `https://your-backend.onrender.com/health`

### Frontend (Netlify)
- [ ] Set `VITE_API_URL` to: `https://your-backend.onrender.com/api`
- [ ] Set `VITE_SOCKET_URL` to: `https://your-backend.onrender.com`
- [ ] Update backend `CLIENT_URL` in Render to your Netlify URL
- [ ] Redeploy frontend on Netlify
- [ ] Test the complete application

### MongoDB Atlas
- [ ] Ensure cluster is running (not paused)
- [ ] Add Render IP to whitelist (or use 0.0.0.0/0)
- [ ] Verify database user has proper permissions
- [ ] Test connection string is correct

## Common Render Deployment Issues

### Backend Won't Deploy on Render

1. **Missing Environment Variables:**
   - Ensure all required env vars are set in Render Dashboard
   - `MONGO_URI` is CRITICAL - deployment will fail without it
   - Set `JWT_SECRET` to a secure random value
   - Set `CLIENT_URL` to your Netlify frontend URL

2. **MongoDB Connection Issues:**
   - Ensure your MongoDB Atlas cluster is NOT paused
   - Add Render IP to whitelist: `0.0.0.0/0` (allows all IPs)
   - Verify connection string is correct in environment variables
   - Check MongoDB Atlas Network Access settings

3. **Build Failures:**
   - Check Render build logs for specific errors
   - Ensure `render.yaml` is in repository root
   - Verify `server/package.json` exists
   - Ensure Node.js version is compatible (Render uses latest LTS by default)

4. **Health Check Failures:**
   - Verify server starts successfully: `npm start` in server directory
   - Check that PORT is correctly used: `process.env.PORT || 5000`
   - Ensure health endpoint exists: `/health`

### Still Having Issues?

If you continue to have deployment issues:
1. Check the Render build logs for specific error messages
2. Verify all environment variables are set correctly
3. Test your backend locally first: `cd server && npm start`
4. Ensure your MongoDB Atlas cluster is running and accessible
5. Check the Render status page for platform issues
6. Review the Render community forums for similar issues

