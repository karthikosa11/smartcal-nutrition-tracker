# Quick Setup Guide

## For Local Development

### Backend Setup

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```
   
   Then edit `.env` with your values:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=smartcal_db
   JWT_SECRET=generate-a-strong-random-string
   JWT_EXPIRES_IN=7d
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

4. **Create MySQL database:**
   ```bash
   mysql -u root -p
   CREATE DATABASE smartcal_db;
   EXIT;
   ```

5. **Start backend:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   # Copy the example file
   cp .env.example .env
   ```
   
   Then edit `.env` with your values:
   ```env
   VITE_API_URL=http://localhost:3001/api
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start frontend:**
   ```bash
   npm run dev
   ```

## For Render Deployment

### Backend Environment Variables

In Render Dashboard → Backend Service → Environment:

```
NODE_ENV=production
PORT=10000
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=smartcal_db
JWT_SECRET=your-strong-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://smartcal-nutrition-tracker-frontend.onrender.com
```

### Frontend Environment Variables

In Render Dashboard → Frontend Static Site → Environment:

```
VITE_API_URL=https://smartcal-nutrition-tracker.onrender.com/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

## Generating JWT Secret

**PowerShell:**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Bash/Linux:**
```bash
openssl rand -base64 32
```

## Important Notes

- **Never commit `.env` files** - they're in `.gitignore`
- **Use strong, unique JWT secrets** in production
- **Keep database credentials secure**
- **Don't share API keys publicly**

