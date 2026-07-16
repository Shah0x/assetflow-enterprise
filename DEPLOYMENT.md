# 🚀 AssetFlow Enterprise - Vercel Deployment Guide

## Quick Start (Easiest Way!)

### Step 1: Connect Repository to Vercel
1. Go to **[vercel.com](https://vercel.com)**
2. Sign up with GitHub
3. Click **"New Project"**
4. Select **"assetflow-enterprise"** repository
5. Click **"Import"**

### Step 2: Add Environment Variables
After importing, go to **Settings → Environment Variables** and add:

```
MONGODB_URI = mongodb+srv://<username>:<password>@cluster0.vwgimvn.mongodb.net/assetflow?retryWrites=true&w=majority&appName=Cluster0

JWT_SECRET = your_super_secret_random_string_here_at_least_32_chars

GEMINI_API_KEY = your_gemini_api_key_here (optional)

APP_URL = https://your-project.vercel.app
```

### Step 3: Deploy!
1. Click **"Deploy"**
2. Wait ~2-3 minutes
3. Your app will be live at: `https://your-project.vercel.app`

---

## Important Notes

✅ **What Vercel handles:**
- Automatic builds when you push to GitHub
- Express backend runs on their servers
- React frontend builds automatically
- Free SSL/HTTPS
- Free tier includes enough usage for testing

⚠️ **You MUST have:**
1. **MongoDB Atlas** account with cluster created
2. **Your IP address** added to MongoDB Network Access
3. Valid environment variables

---

## Troubleshooting

**"White page" after deployment?**
- Check Vercel Logs: Project → Deployments → Click latest → "Runtime Logs"
- Make sure MongoDB URI is correct
- Make sure JWT_SECRET is set

**Build fails?**
- Check Build Logs: Project → Deployments → Click latest → "Build Logs"
- Usually missing environment variables

**API endpoints not working?**
- Make sure requests go to `https://your-project.vercel.app/api/...`
- NOT `http://localhost:3000/api/...`

---

## Need Help?

From your phone, ask me to:
1. **"Check Vercel logs"** - I'll look at deployment errors
2. **"Update environment variable"** - I can fix it for you
3. **"Rebuild the project"** - I can push a new build

Just tell me what's happening! 🎯
