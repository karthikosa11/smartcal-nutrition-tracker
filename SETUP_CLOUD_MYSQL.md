# Setup Cloud MySQL Database for Render

## Why You Need Cloud MySQL

- Render runs in the cloud
- Your backend on Render needs a database accessible over the internet
- `localhost` won't work - you need a cloud MySQL database

## Option 1: PlanetScale (Recommended - Free & Easy)

PlanetScale is MySQL-compatible and works perfectly with your app.

### Step-by-Step Setup:

1. **Sign Up:**
   - Go to https://planetscale.com
   - Click "Sign up" (free tier available)
   - Sign up with GitHub or email

2. **Create Database:**
   - Click "Create database"
   - Name: `smartcal_db`
   - Region: Choose closest to you (e.g., US East, EU West)
   - Plan: Select "Hobby" (free tier)
   - Click "Create database"

3. **Get Connection Details:**
   - Click on your database (`smartcal_db`)
   - Click "Connect" button
   - Select "Node.js" or "General"
   - You'll see a connection string like:
     ```
     mysql://xxxxx:xxxxx@xxxxx.psdb.cloud/smartcal_db?sslaccept=strict
     ```
   - Or you'll see separate values:
     - **Host:** `xxxxx.psdb.cloud`
     - **Username:** `xxxxx`
     - **Password:** `xxxxx` (click "Show password" to reveal)
     - **Database:** `smartcal_db`

4. **Set in Render:**
   - Go to Render Dashboard → Backend Service → Environment tab
   - Add/Update these variables:
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
   - Wait 2-5 minutes
   - Check "Logs" tab

6. **Verify:**
   - Look for: "✅ Database connection successful"
   - Test: `https://smartcal-nutrition-tracker.onrender.com/api/health`
   - Should show: `"database": "connected"`

## Option 2: Railway (Free MySQL)

Railway offers actual MySQL (not MySQL-compatible).

### Step-by-Step Setup:

1. **Sign Up:**
   - Go to https://railway.app
   - Click "Start a New Project"
   - Sign up with GitHub (free tier)

2. **Create MySQL Database:**
   - Click "New" → "Database" → "MySQL"
   - Railway will automatically create a MySQL database
   - Wait for it to provision (1-2 minutes)

3. **Get Connection Details:**
   - Click on the MySQL service
   - Go to "Variables" tab
   - You'll see:
     - `MYSQLHOST` → This is your `DB_HOST`
     - `MYSQLUSER` → This is your `DB_USER`
     - `MYSQLPASSWORD` → This is your `DB_PASSWORD`
     - `MYSQLDATABASE` → This is your `DB_NAME`
     - `MYSQLPORT` → Usually `3306`

4. **Set in Render:**
   - Go to Render Dashboard → Backend Service → Environment tab
   - Add these variables:
     ```
     DB_HOST=[value from MYSQLHOST]
     DB_USER=[value from MYSQLUSER]
     DB_PASSWORD=[value from MYSQLPASSWORD]
     DB_NAME=[value from MYSQLDATABASE]
     DB_PORT=3306
     ```
   - No SSL needed for Railway

5. **Redeploy:**
   - Redeploy backend in Render
   - Check logs

## Option 3: Supabase (PostgreSQL - Not MySQL)

Supabase uses PostgreSQL, not MySQL. You'd need to change your code to use PostgreSQL instead of MySQL.

**Not recommended** unless you want to switch to PostgreSQL.

## Option 4: Your Own MySQL Server (Advanced)

If you have your own MySQL server:

1. **Make it accessible:**
   - Configure MySQL to accept external connections
   - Open port 3306 in firewall
   - Find your public IP address

2. **Set in Render:**
   ```
   DB_HOST=your_public_ip_address
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=smartcal_db
   DB_PORT=3306
   ```

**⚠️ Security Warning:** Exposing your MySQL to the internet is risky. Use only for testing.

## Recommended: PlanetScale

**Why PlanetScale?**
- ✅ Free tier (Hobby plan)
- ✅ MySQL-compatible (works with your code)
- ✅ Easy setup (5 minutes)
- ✅ Automatic backups
- ✅ Works perfectly with Render
- ✅ No configuration needed

**Quick Setup:**
1. Sign up: https://planetscale.com
2. Create database: `smartcal_db`
3. Get connection details
4. Set in Render (don't forget `DB_SSL=true`)
5. Redeploy

## Step-by-Step: PlanetScale Setup

### 1. Create Account
- Visit https://planetscale.com
- Click "Sign up"
- Use GitHub or email

### 2. Create Database
- Click "Create database"
- Name: `smartcal_db`
- Region: Choose closest
- Plan: Hobby (free)
- Click "Create database"

### 3. Get Connection String
- Click on `smartcal_db`
- Click "Connect" button
- Select "Node.js"
- Copy the connection details

### 4. Extract Values
From connection string: `mysql://USER:PASSWORD@HOST/DATABASE`

Or you'll see:
- Host: `xxxxx.psdb.cloud`
- Username: `xxxxx`
- Password: `xxxxx` (click to reveal)
- Database: `smartcal_db`

### 5. Set in Render
Go to Render → Backend Service → Environment:

```
DB_HOST=xxxxx.psdb.cloud
DB_USER=xxxxx
DB_PASSWORD=xxxxx
DB_NAME=smartcal_db
DB_SSL=true
```

### 6. Redeploy
- Backend Service → Manual Deploy
- Wait 2-5 minutes
- Check logs

### 7. Verify
- Test: `/api/health`
- Should show: `"database": "connected"`
- Try login/signup

## Quick Checklist

- [ ] Signed up for PlanetScale (or Railway)
- [ ] Created database `smartcal_db`
- [ ] Got connection details (host, user, password)
- [ ] Set `DB_HOST` in Render (NOT localhost)
- [ ] Set `DB_USER` in Render
- [ ] Set `DB_PASSWORD` in Render
- [ ] Set `DB_NAME` in Render
- [ ] If PlanetScale, set `DB_SSL=true`
- [ ] Redeployed backend
- [ ] Checked logs for "Database connection successful"

## After Setup

Your database will be automatically initialized when the backend starts. The tables (`users`, `meal_logs`, etc.) will be created automatically.

## Need Help?

If you get stuck:
1. Check backend logs in Render
2. Verify all environment variables are set
3. Test connection manually if possible
4. Make sure `DB_HOST` is NOT `localhost`

Good luck! 🚀

