# Setup MySQL Database on Railway (Free)

Railway offers **actual MySQL** (not MySQL-compatible) and works perfectly with your app.

## Step-by-Step Setup

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended) or email
4. Free tier is available

### Step 2: Create MySQL Database

1. After signing in, click **"New Project"**
2. Click **"Add Service"** or **"New"**
3. Select **"Database"** → **"MySQL"**
4. Railway will automatically provision a MySQL database
5. Wait 1-2 minutes for it to be ready

### Step 3: Get Connection Details

1. Click on the **MySQL service** in your project
2. Go to the **"Variables"** tab
3. You'll see these environment variables:
   - `MYSQLHOST` → This is your **DB_HOST**
   - `MYSQLUSER` → This is your **DB_USER**
   - `MYSQLPASSWORD` → This is your **DB_PASSWORD**
   - `MYSQLDATABASE` → This is your **DB_NAME**
   - `MYSQLPORT` → Usually `3306`

**Example values you might see:**
```
MYSQLHOST=containers-us-west-xxx.railway.app
MYSQLUSER=root
MYSQLPASSWORD=xxxxx
MYSQLDATABASE=railway
MYSQLPORT=3306
```

### Step 4: Set Environment Variables in Render

1. Go to **Render Dashboard** → Your **Backend Web Service** → **"Environment"** tab
2. Add/Update these variables:

```
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxxxx
DB_NAME=railway
DB_PORT=3306
```

**Important:**
- Copy the **exact values** from Railway's Variables tab
- Use `MYSQLDATABASE` value for `DB_NAME` (usually `railway`)
- No SSL needed for Railway MySQL
- No quotes around values
- No spaces around `=`

### Step 5: Create Your Database (Optional)

If you want to use `smartcal_db` instead of `railway`:

1. In Railway, click on your MySQL service
2. Go to **"Data"** tab
3. Click **"Open MySQL"** or use the query interface
4. Run:
   ```sql
   CREATE DATABASE smartcal_db;
   ```
5. Then update `DB_NAME=smartcal_db` in Render

**OR** just use the default database name from Railway (usually `railway`).

### Step 6: Redeploy Backend

1. Go to **Backend Service** in Render
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait 2-5 minutes for deployment
4. Check **"Logs"** tab

### Step 7: Verify Connection

**Check Logs:**
- Look for: **"✅ Database connection successful"**
- If you see errors, check the specific error message

**Test Health Endpoint:**
```
https://smartcal-nutrition-tracker.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "SmartCal API is running",
  "database": "connected"
}
```

**Test Login/Signup:**
- Should work without 503 errors
- Database tables will be created automatically

## Quick Reference

### Railway Variables → Render Variables

| Railway Variable | Render Variable | Example Value |
|-----------------|-----------------|---------------|
| `MYSQLHOST` | `DB_HOST` | `containers-us-west-xxx.railway.app` |
| `MYSQLUSER` | `DB_USER` | `root` |
| `MYSQLPASSWORD` | `DB_PASSWORD` | `xxxxx` |
| `MYSQLDATABASE` | `DB_NAME` | `railway` or `smartcal_db` |
| `MYSQLPORT` | `DB_PORT` | `3306` |

## Troubleshooting

### Error: "ECONNREFUSED"
- **Problem:** Can't reach MySQL server
- **Fix:** Check `DB_HOST` is correct (copy from Railway exactly)

### Error: "ER_ACCESS_DENIED_ERROR"
- **Problem:** Wrong username or password
- **Fix:** Verify `DB_USER` and `DB_PASSWORD` match Railway values exactly

### Error: "ER_BAD_DB_ERROR"
- **Problem:** Database doesn't exist
- **Fix:** Use `MYSQLDATABASE` value from Railway, or create `smartcal_db` manually

### Database Not Initializing
- **Problem:** Tables not being created
- **Fix:** Check backend logs for initialization errors
- Tables should be created automatically on first request

## Quick Checklist

- [ ] Signed up for Railway
- [ ] Created MySQL database in Railway
- [ ] Got connection details from Railway Variables tab
- [ ] Set `DB_HOST` in Render (from `MYSQLHOST`)
- [ ] Set `DB_USER` in Render (from `MYSQLUSER`)
- [ ] Set `DB_PASSWORD` in Render (from `MYSQLPASSWORD`)
- [ ] Set `DB_NAME` in Render (from `MYSQLDATABASE`)
- [ ] Set `DB_PORT=3306` in Render
- [ ] Redeployed backend
- [ ] Checked logs for "Database connection successful"
- [ ] Tested `/api/health` endpoint

## After Setup

Your MySQL database will be automatically initialized:
- Tables (`users`, `meal_logs`, etc.) will be created
- Data warehouse tables will be created
- Everything will work automatically!

## Railway Free Tier Limits

- ✅ Free tier available
- ✅ 512MB RAM
- ✅ 1GB storage
- ✅ Perfect for development and small projects

## Summary

1. **Sign up:** https://railway.app
2. **Create MySQL:** New Project → Database → MySQL
3. **Get credentials:** Variables tab
4. **Set in Render:** Copy values to Render environment variables
5. **Redeploy:** Backend service
6. **Verify:** Check logs and test endpoints

That's it! Your MySQL database will be ready to use! 🚀

