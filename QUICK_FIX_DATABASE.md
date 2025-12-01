# Quick Fix: Database Connection Error

## The Problem
You're getting: "Database connection failed. Please check your database configuration."

This means your backend is running but **cannot connect to MySQL**.

## The Solution: Set Database Environment Variables in Render

### Step 1: Go to Render Dashboard
1. Open https://dashboard.render.com
2. Click on your **Backend Web Service** (`smartcal-nutrition-tracker`)
3. Click **"Environment"** tab

### Step 2: Add These 4 Variables

You MUST add these 4 environment variables:

```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smartcal_db
```

**Replace with your actual MySQL credentials!**

### Step 3: Where to Get MySQL Database?

#### Option 1: PlanetScale (Free, Recommended)
1. Go to https://planetscale.com
2. Sign up (free)
3. Create a new database
4. Go to "Connect" → Get connection details
5. You'll get something like:
   - Host: `xxxxx.psdb.cloud`
   - User: `xxxxx`
   - Password: `xxxxx`
   - Database: `smartcal_db` (or create it)
6. **Important:** Set `DB_SSL=true` in Render (PlanetScale requires SSL)

#### Option 2: Railway (Free)
1. Go to https://railway.app
2. Sign up (free)
3. New Project → Add MySQL
4. Get connection details from the MySQL service
5. Use those values in Render

#### Option 3: Your Own MySQL
If you have your own MySQL server:
- Use your MySQL host, username, password
- Create database: `CREATE DATABASE smartcal_db;`

### Step 4: Example Values (DO NOT USE THESE - Use Your Own!)

```
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_USER=postgres.xxxxx
DB_PASSWORD=your_actual_password
DB_NAME=smartcal_db
```

### Step 5: After Setting Variables

1. **Save** each variable in Render
2. Go back to your Backend Service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait 2-5 minutes
5. Check **"Logs"** tab

### Step 6: Check Logs

Look for:
- ✅ "Database connection successful" = Working!
- ❌ Error message = Shows what's wrong

## Common Errors in Logs

### "ECONNREFUSED"
- Wrong DB_HOST
- Database server not running
- **Fix:** Check DB_HOST is correct

### "ER_ACCESS_DENIED_ERROR"
- Wrong username or password
- **Fix:** Check DB_USER and DB_PASSWORD

### "ER_BAD_DB_ERROR"
- Database doesn't exist
- **Fix:** Create database or use correct DB_NAME

### "ETIMEDOUT"
- Can't reach database
- **Fix:** Check network/firewall

## Quick Checklist

- [ ] Have MySQL database (PlanetScale, Railway, or your own)
- [ ] Have connection details (host, user, password, database name)
- [ ] Set DB_HOST in Render
- [ ] Set DB_USER in Render
- [ ] Set DB_PASSWORD in Render
- [ ] Set DB_NAME in Render
- [ ] If using PlanetScale, set DB_SSL=true
- [ ] Redeployed backend after setting variables
- [ ] Checked logs for "Database connection successful"

## Still Not Working?

1. **Check backend logs** - What exact error do you see?
2. **Test database manually** - Can you connect with those credentials?
3. **Verify variables** - Are they set correctly in Render?

## Need Help Setting Up Database?

**PlanetScale (Easiest):**
1. Sign up at https://planetscale.com
2. Create database
3. Get connection string
4. Extract: host, user, password, database
5. Set in Render + add `DB_SSL=true`

**Railway:**
1. Sign up at https://railway.app
2. New project → Add MySQL
3. Get credentials from service
4. Set in Render

The code is ready - you just need to configure the database connection!

