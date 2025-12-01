# Render Deployment Guide

This guide will help you deploy SmartCal to Render.

## Prerequisites

1. A Render account (sign up at https://render.com)
2. A MySQL database (you can use Render's MySQL or an external service like PlanetScale, Railway, etc.)

## Step 1: Deploy Backend API

1. Go to Render Dashboard → New → Web Service
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `smartcal-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
   - **Root Directory**: Leave empty (or set to repository root)

4. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=10000
   DB_HOST=your_mysql_host
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=smartcal_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```

5. Click "Create Web Service"
6. Wait for deployment to complete
7. Note the backend URL (e.g., `https://smartcal-api.onrender.com`)

## Step 2: Deploy Frontend

1. Go to Render Dashboard → New → Static Site
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `smartcal-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. Add Environment Variables:
   ```
   VITE_API_URL=https://smartcal-api.onrender.com/api
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

5. Click "Create Static Site"
6. Wait for deployment to complete
7. Note the frontend URL (e.g., `https://smartcal-frontend.onrender.com`)

## Step 3: Update Backend CORS

After deploying the frontend, update the backend's `FRONTEND_URL` environment variable to match your frontend URL.

## Step 4: Database Setup

### Option A: Using Render's MySQL (Free tier available)

1. Go to Render Dashboard → New → PostgreSQL (or MySQL if available)
2. Create database
3. Use the connection string provided
4. Run the initialization script from `server/src/config/initDatabase.ts`

### Option B: Using External MySQL

- Use services like PlanetScale, Railway, or your own MySQL server
- Update `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` in backend environment variables

## Step 5: Initialize Database

After backend is deployed, you can:
1. SSH into the backend service (if available)
2. Or run the init script locally pointing to your production database
3. Or use Render's shell feature to run database initialization

## Important Notes

- **Free tier**: Services may spin down after inactivity. First request may be slow.
- **Environment Variables**: Never commit `.env` files. Set all variables in Render dashboard.
- **Database**: Ensure your database is accessible from Render's IP addresses.
- **CORS**: Update `FRONTEND_URL` in backend after frontend is deployed.

## Troubleshooting

### Backend won't start
- Check build logs for TypeScript errors
- Verify all environment variables are set
- Check database connection

### Frontend can't connect to API
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Database connection errors
- Verify database credentials
- Check if database allows connections from Render's IPs
- Ensure database is running

