# Environment Variables Reference

## Backend Environment Variables (server/.env)

Create a `.env` file in the `server/` directory with these variables:

```env
# Server Configuration
NODE_ENV=production
PORT=10000

# Database Configuration
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smartcal_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Frontend URL (for CORS)
FRONTEND_URL=https://smartcal-nutrition-tracker-frontend.onrender.com
```

## Frontend Environment Variables (frontend/.env or root .env)

For local development, create a `.env` file with:

```env
# Backend API URL
VITE_API_URL=http://localhost:3001/api

# Google Gemini AI (optional)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Render Environment Variables

### Backend Web Service (smartcal-nutrition-tracker)

Set these in Render Dashboard → Your Backend Service → Environment:

```
NODE_ENV=production
PORT=10000
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smartcal_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://smartcal-nutrition-tracker-frontend.onrender.com
```

### Frontend Static Site (smartcal-nutrition-tracker-frontend)

Set these in Render Dashboard → Your Frontend Static Site → Environment:

```
VITE_API_URL=https://smartcal-nutrition-tracker.onrender.com/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Important Notes

### Backend Variables:
- **PORT**: Render automatically sets this, but you can set it to `10000` explicitly
- **DB_HOST**: Your MySQL database host (e.g., from PlanetScale, Railway, or your own server)
- **DB_USER**: MySQL username
- **DB_PASSWORD**: MySQL password
- **DB_NAME**: Database name (e.g., `smartcal_db`)
- **JWT_SECRET**: Generate a strong random string (e.g., use `openssl rand -base64 32`)
- **JWT_EXPIRES_IN**: Token expiration (e.g., `7d` for 7 days)
- **FRONTEND_URL**: Must match your exact frontend URL (no trailing slash)

### Frontend Variables:
- **VITE_API_URL**: Must include `/api` at the end
- **VITE_GEMINI_API_KEY**: Optional, but required for AI features

### Security:
- **Never commit `.env` files to Git**
- **Use strong, unique values for JWT_SECRET**
- **Keep database credentials secure**
- **Don't share API keys publicly**

## Generating JWT Secret

You can generate a secure JWT secret using:

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Bash/Linux:**
```bash
openssl rand -base64 32
```

**Online:**
- Use a secure random string generator
- Minimum 32 characters recommended

## Verification Checklist

### Backend:
- [ ] All database variables set correctly
- [ ] JWT_SECRET is a strong random string
- [ ] FRONTEND_URL matches exact frontend URL
- [ ] PORT is set (or using Render default)
- [ ] NODE_ENV is set to `production`

### Frontend:
- [ ] VITE_API_URL includes `/api` at the end
- [ ] VITE_API_URL uses `https://` not `http://`
- [ ] VITE_GEMINI_API_KEY is set (if using AI features)

## Example Values (DO NOT USE IN PRODUCTION)

```env
# Backend Example (for testing only)
NODE_ENV=production
PORT=10000
DB_HOST=mysql.example.com
DB_USER=smartcal_user
DB_PASSWORD=SecurePassword123!
DB_NAME=smartcal_db
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://smartcal-nutrition-tracker-frontend.onrender.com

# Frontend Example (for testing only)
VITE_API_URL=https://smartcal-nutrition-tracker.onrender.com/api
VITE_GEMINI_API_KEY=AIzaSyExample123456789
```

## Troubleshooting

### "Failed to fetch" errors:
- Check `VITE_API_URL` is set correctly in Render
- Verify backend is running (check Render dashboard)
- Ensure `FRONTEND_URL` matches your frontend URL exactly

### CORS errors:
- Verify `FRONTEND_URL` in backend matches your frontend URL
- No trailing slash in `FRONTEND_URL`
- Redeploy backend after changing `FRONTEND_URL`

### Database connection errors:
- Verify all database variables are correct
- Check database is accessible from Render's IPs
- Ensure database is running

### Authentication errors:
- Verify `JWT_SECRET` is set in backend
- Check token expiration settings
- Ensure frontend and backend are using same secret

