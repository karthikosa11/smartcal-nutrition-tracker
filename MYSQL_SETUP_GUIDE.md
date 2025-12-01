# MySQL Database Setup Guide

## Setting Up MySQL for SmartCal

### Step 1: Get Your MySQL Connection Details

You need these 4 pieces of information:
1. **Host** (DB_HOST) - Your MySQL server address
2. **User** (DB_USER) - MySQL username
3. **Password** (DB_PASSWORD) - MySQL password
4. **Database Name** (DB_NAME) - Database name (e.g., `smartcal_db`)

### Step 2: Set Environment Variables in Render

Go to **Render Dashboard → Backend Service → Environment** tab

Add these variables:

```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smartcal_db
```

**Optional (if needed):**
```
DB_PORT=3306
DB_SSL=false
```

### Step 3: Common MySQL Services

#### Option A: PlanetScale (Recommended - Free Tier)
1. Go to https://planetscale.com
2. Sign up and create a database
3. Get connection details from dashboard
4. Use the host, user, password, and database name
5. **Note:** PlanetScale requires SSL, so set `DB_SSL=true`

#### Option B: Railway (Free Tier)
1. Go to https://railway.app
2. Create a new project → Add MySQL
3. Get connection details from the service
4. Use the provided credentials

#### Option C: Render MySQL (if available)
1. In Render Dashboard → New → MySQL
2. Create database
3. Use the connection string provided
4. Extract host, user, password, database from connection string

#### Option D: Your Own MySQL Server
1. Ensure MySQL is running
2. Create database: `CREATE DATABASE smartcal_db;`
3. Create user with permissions
4. Ensure server is accessible from internet
5. Check firewall allows connections

### Step 4: Create Database (if it doesn't exist)

Connect to your MySQL and run:

```sql
CREATE DATABASE IF NOT EXISTS smartcal_db;
```

### Step 5: Verify Connection

Test your connection manually:

**Using MySQL command line:**
```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p YOUR_DB_NAME
```

**Using connection string:**
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Step 6: Environment Variables Format

**In Render, set exactly like this (no quotes, no spaces):**

```
DB_HOST=mysql.example.com
DB_USER=myuser
DB_PASSWORD=mypassword123
DB_NAME=smartcal_db
```

**Common Mistakes:**
- ❌ `DB_HOST="mysql.example.com"` (don't use quotes)
- ❌ `DB_HOST = mysql.example.com` (no spaces around =)
- ❌ Using wrong variable names (case-sensitive)
- ❌ Using placeholder values instead of real credentials

### Step 7: Redeploy Backend

After setting environment variables:

1. Go to Backend Service in Render
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment
4. Check **Logs** tab for:
   - ✅ "Database connection successful"
   - ❌ Or specific error message

### Step 8: Troubleshooting

#### Error: "ECONNREFUSED"
- Database server is not running
- Wrong DB_HOST
- Firewall blocking connection

**Fix:**
- Verify database is running
- Check DB_HOST is correct
- Check firewall/network settings

#### Error: "ER_ACCESS_DENIED_ERROR"
- Wrong username or password

**Fix:**
- Verify DB_USER and DB_PASSWORD
- Test credentials manually
- Check user has proper permissions

#### Error: "ER_BAD_DB_ERROR"
- Database doesn't exist

**Fix:**
- Create database: `CREATE DATABASE smartcal_db;`
- Or use existing database name

#### Error: "ETIMEDOUT"
- Connection timeout
- Network issues

**Fix:**
- Check network connectivity
- Verify database is accessible
- Check firewall settings

### Step 9: Verify It's Working

1. Test health endpoint:
   ```
   https://smartcal-nutrition-tracker.onrender.com/api/health
   ```
   Should show: `"database": "connected"`

2. Check backend logs:
   - Look for "✅ Database connection successful"
   - No database errors

3. Test login/signup:
   - Should work without 500 errors

## Quick Checklist

- [ ] MySQL database exists
- [ ] Have MySQL connection credentials (host, user, password, database)
- [ ] All 4 environment variables set in Render
- [ ] Variables have correct values (no quotes, no spaces)
- [ ] Backend redeployed after setting variables
- [ ] Checked logs for "Database connection successful"
- [ ] Tested `/api/health` endpoint

## Need Help?

Share:
1. What MySQL service you're using
2. What error appears in backend logs
3. Whether you can connect to MySQL manually
4. What your environment variables look like (hide passwords)

