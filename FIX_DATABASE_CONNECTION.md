# Fix Database Connection Error

## Current Status
Your backend is running but cannot connect to the MySQL database.

## Step-by-Step Fix

### Step 1: Check Environment Variables in Render

Go to Render Dashboard → Backend Service → Environment tab

**Required Variables:**
```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smartcal_db
```

**Check:**
- [ ] All 4 variables are set
- [ ] No typos in variable names
- [ ] Values are correct (not placeholders)
- [ ] No extra spaces or quotes

### Step 2: Verify Database Credentials

**Test your database connection:**
1. Use a MySQL client (MySQL Workbench, DBeaver, or command line)
2. Try connecting with the same credentials
3. Verify you can connect successfully

**Common Issues:**
- ❌ Wrong password
- ❌ Wrong username
- ❌ Wrong host/URL
- ❌ Database name doesn't exist

### Step 3: Check Database Service

**If using external MySQL service (PlanetScale, Railway, etc.):**
- Verify the service is running
- Check if it allows connections from external IPs
- Some services require SSL connections
- Check firewall/network settings

**If using your own MySQL server:**
- Ensure MySQL is running
- Check if it's accessible from the internet
- Verify firewall allows connections from Render
- Check MySQL user permissions

### Step 4: Check Backend Logs

In Render Dashboard → Backend Service → Logs, look for:

**Error Messages:**
- `ECONNREFUSED` - Database server not reachable
- `Access denied` - Wrong username/password
- `Unknown database` - Database doesn't exist
- `ETIMEDOUT` - Connection timeout
- `ENOTFOUND` - Host not found

**What to look for:**
```
❌ Database connection failed: [error message]
Error code: [error code]
DB_HOST: [value or NOT SET]
DB_USER: [value or NOT SET]
DB_NAME: [value or NOT SET]
DB_PASSWORD: [SET or NOT SET]
```

### Step 5: Common Database Services Setup

#### PlanetScale
- Get connection string from PlanetScale dashboard
- Extract: host, user, password, database
- May require SSL (check PlanetScale docs)

#### Railway
- Get MySQL connection details from Railway dashboard
- Use the provided host, user, password, database name

#### Render MySQL (if available)
- Use the connection string provided by Render
- Extract credentials from connection string

#### Your Own MySQL Server
- Ensure it's accessible from internet
- Create user with proper permissions
- Allow connections from Render's IPs

### Step 6: Verify Database Exists

Connect to your MySQL and run:
```sql
SHOW DATABASES;
```

Make sure `smartcal_db` (or your DB_NAME) exists. If not:
```sql
CREATE DATABASE smartcal_db;
```

### Step 7: Test Connection Manually

You can test the connection using the credentials:

**Using MySQL command line:**
```bash
mysql -h YOUR_DB_HOST -u YOUR_DB_USER -p
# Enter password when prompted
```

**Using connection string:**
```
mysql://USER:PASSWORD@HOST:PORT/DATABASE
```

### Step 8: Redeploy Backend

After fixing environment variables:

1. Go to Backend Service in Render
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment
4. Check logs for "✅ Database connection successful"
5. Test `/api/health` endpoint again

## Quick Checklist

- [ ] All 4 database environment variables are set in Render
- [ ] Database credentials are correct
- [ ] Database exists
- [ ] Database is accessible from internet
- [ ] Backend redeployed after fixing variables
- [ ] Checked backend logs for specific error
- [ ] Tested database connection manually

## Still Not Working?

**Share these details:**
1. What database service are you using? (PlanetScale, Railway, your own, etc.)
2. What error message appears in backend logs?
3. Can you connect to the database manually?
4. Are all environment variables set correctly?

## Next Steps

1. **Check backend logs** - Look for the specific database error
2. **Verify environment variables** - Make sure all 4 are set correctly
3. **Test database connection** - Try connecting manually
4. **Redeploy backend** - After fixing variables

The improved logging will show exactly what's wrong with the database connection.

