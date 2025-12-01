# Fix: "localhost" Database Host Issue

## The Problem

You have `DB_HOST=localhost` in Render, but this **won't work** because:

- Render runs your backend in the **cloud**
- `localhost` means "this computer" - but Render's servers are not your computer
- Your local MySQL database is only accessible from your computer
- Render cannot reach your local database over the internet

## The Solution: Use a Cloud MySQL Database

You need a MySQL database that is **accessible over the internet**, not on your local machine.

### Option 1: PlanetScale (Recommended - Free & Easy)

1. **Sign up:**
   - Go to https://planetscale.com
   - Click "Sign up" (free tier available)
   - Create an account

2. **Create Database:**
   - Click "Create database"
   - Name it: `smartcal_db`
   - Choose a region (closest to you)
   - Click "Create database"

3. **Get Connection Details:**
   - Click on your database
   - Click "Connect" button
   - Select "Node.js" or "General"
   - You'll see connection details like:
     ```
     Host: xxxxx.psdb.cloud
     Username: xxxxx
     Password: xxxxx
     Database: smartcal_db
     ```

4. **Set in Render:**
   - Go to Render Dashboard → Backend Service → Environment
   - Set these variables:
     ```
     DB_HOST=xxxxx.psdb.cloud
     DB_USER=xxxxx
     DB_PASSWORD=xxxxx
     DB_NAME=smartcal_db
     DB_SSL=true
     ```
   - **Important:** PlanetScale requires SSL, so add `DB_SSL=true`

5. **Redeploy:**
   - Go to Backend Service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for deployment
   - Check logs for "Database connection successful"

### Option 2: Railway (Free Tier)

1. **Sign up:**
   - Go to https://railway.app
   - Sign up with GitHub (free tier)

2. **Create MySQL:**
   - Click "New Project"
   - Click "Add Service" → "Database" → "MySQL"
   - Railway will create a MySQL database

3. **Get Connection Details:**
   - Click on the MySQL service
   - Go to "Variables" tab
   - You'll see:
     - `MYSQLHOST` (this is your DB_HOST)
     - `MYSQLUSER` (this is your DB_USER)
     - `MYSQLPASSWORD` (this is your DB_PASSWORD)
     - `MYSQLDATABASE` (this is your DB_NAME)
     - `MYSQLPORT` (usually 3306)

4. **Set in Render:**
   - Go to Render Dashboard → Backend Service → Environment
   - Set:
     ```
     DB_HOST=[MYSQLHOST value from Railway]
     DB_USER=[MYSQLUSER value from Railway]
     DB_PASSWORD=[MYSQLPASSWORD value from Railway]
     DB_NAME=[MYSQLDATABASE value from Railway]
     DB_PORT=3306
     ```

5. **Redeploy:**
   - Redeploy backend in Render
   - Check logs

### Option 3: Supabase (Free Tier)

1. **Sign up:**
   - Go to https://supabase.com
   - Create a project

2. **Get Connection Details:**
   - Go to Project Settings → Database
   - Find "Connection string" or "Connection pooling"
   - Extract: host, user, password, database

3. **Set in Render:**
   - Use the connection details
   - Set `DB_SSL=true` if required

### Option 4: Keep Using Local MySQL (NOT Recommended for Production)

If you really want to use your local MySQL (only for testing):

1. **Make MySQL accessible:**
   - Configure MySQL to accept external connections
   - Open port 3306 in your firewall
   - Find your public IP address
   - Use your public IP instead of localhost

2. **Security Warning:**
   - ⚠️ This is **NOT secure** for production
   - Your database will be exposed to the internet
   - Use only for testing, not for real users

3. **Set in Render:**
   ```
   DB_HOST=your_public_ip_address
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=smartcal_db
   DB_PORT=3306
   ```

## Recommended: Use PlanetScale

**Why PlanetScale?**
- ✅ Free tier available
- ✅ Easy to set up
- ✅ Works perfectly with Render
- ✅ No configuration needed
- ✅ Automatic backups

**Steps:**
1. Sign up at https://planetscale.com
2. Create database `smartcal_db`
3. Get connection details
4. Set in Render (don't forget `DB_SSL=true`)
5. Redeploy

## Quick Checklist

- [ ] Signed up for cloud MySQL (PlanetScale/Railway/etc.)
- [ ] Created database
- [ ] Got connection details (host, user, password, database)
- [ ] Set `DB_HOST` in Render (NOT localhost)
- [ ] Set `DB_USER` in Render
- [ ] Set `DB_PASSWORD` in Render
- [ ] Set `DB_NAME` in Render
- [ ] If PlanetScale, set `DB_SSL=true`
- [ ] Redeployed backend
- [ ] Checked logs for "Database connection successful"

## After Fixing

1. **Test health endpoint:**
   ```
   https://smartcal-nutrition-tracker.onrender.com/api/health
   ```
   Should show: `"database": "connected"`

2. **Test login/signup:**
   - Should work without 503 errors

## Summary

**The Problem:** `DB_HOST=localhost` doesn't work on Render because Render runs in the cloud.

**The Solution:** Use a cloud MySQL database (PlanetScale, Railway, etc.) and set the correct host in Render.

**Next Step:** Sign up for PlanetScale (easiest option) and follow the steps above.

