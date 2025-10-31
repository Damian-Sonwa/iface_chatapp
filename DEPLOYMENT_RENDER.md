# Render Deployment Instructions (Manual Configuration)

Since `render.yaml` is causing issues, follow these manual setup steps:

## Step 1: Create Web Service

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `https://github.com/Damian-Sonwa/iface_chatapp.git`
4. Select the repository

## Step 2: Configure Settings

### Basic Settings:
- **Name:** `chaturway-backend`
- **Region:** Oregon (or closest to you)
- **Branch:** `master`
- **Root Directory:** `server`
- **Runtime:** Node
- **Build Command:** `npm install`
- **Start Command:** `npm start`

### Advanced Settings:
- **Instance Type:** Free tier
- **Auto-Deploy:** Yes (or No if you want manual deploys)

## Step 3: Environment Variables

Add these environment variables in the Render dashboard:

1. **NODE_ENV**
   - Value: `production`

2. **MONGO_URI**
   - Value: `mongodb+srv://madudamian25_db_user:Godofjustice%40001@cluster0.c2havli.mongodb.net/charturway001?retryWrites=true&w=majority`
   - ⚠️ **CRITICAL:** This must be set or deployment will fail!

3. **JWT_SECRET**
   - Value: Generate a secure random key (e.g., from https://randomkeygen.com/)
   - ⚠️ **IMPORTANT:** Use a strong random value!

4. **CLIENT_URL**
   - Value: Your Netlify frontend URL (e.g., `https://your-app.netlify.app`)
   - ⚠️ **NOTE:** Update this after deploying frontend to Netlify

5. **PORT**
   - ⚠️ **DO NOT SET THIS!** Render automatically sets the PORT environment variable

## Step 4: Deploy

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Once deployed, you'll get a URL like: `https://chaturway-backend.onrender.com`
4. Test the health endpoint: `https://chaturway-backend.onrender.com/health`

## Step 5: MongoDB Atlas Configuration

Before deployment, ensure MongoDB Atlas is configured:

1. **Cluster Status:** Ensure your cluster is **NOT paused**
2. **Network Access:** Add `0.0.0.0/0` to whitelist (allows all IPs)
   - Go to: Network Access → Add IP Address → `0.0.0.0/0`
3. **Database User:** Verify credentials are correct
4. **Connection String:** Double-check the MONGO_URI value

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Ensure `Root Directory` is set to `server`
- Check that `Build Command` is `npm install`

### Health Check Fails
- Check deployment logs
- Verify MONGO_URI is correct
- Ensure MongoDB Atlas cluster is running
- Check IP whitelist in MongoDB Atlas

### Server Crashes
- Review logs in Render dashboard
- Verify environment variables are set correctly
- Check MongoDB connection string format
- Ensure JWT_SECRET is set

## Next Steps

After successful backend deployment:

1. **Update Netlify Environment Variables:**
   - `VITE_API_URL`: `https://chaturway-backend.onrender.com/api`
   - `VITE_SOCKET_URL`: `https://chaturway-backend.onrender.com`

2. **Update Render CLIENT_URL:**
   - Set `CLIENT_URL` in Render to your Netlify URL

3. **Redeploy Frontend:**
   - Trigger a new Netlify deployment

## Support Resources

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

