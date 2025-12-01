# Fix CORS and API URL Issues

## Problem
Frontend is trying to connect to `http://localhost:3001/api` instead of your deployed backend, causing CORS errors.

## Solution

### Step 1: Verify Frontend Environment Variable in Render

1. Go to your **Frontend Static Site** in Render Dashboard
2. Click on **"Environment"** tab
3. Check if `VITE_API_URL` is set
4. It should be: `https://your-backend-url.onrender.com/api`
   - Example: `https://smartcal-api.onrender.com/api`
   - **Important**: Include `/api` at the end
   - **Important**: Use `https://` not `http://`

### Step 2: Update Backend CORS

The backend code has been updated to allow your frontend URL. Make sure:

1. Go to your **Backend Web Service** in Render Dashboard
2. Click on **"Environment"** tab
3. Set `FRONTEND_URL` to: `https://smartcal-nutrition-tracker-frontend.onrender.com`
   - Use your actual frontend URL from Render

### Step 3: Redeploy Both Services

After updating environment variables:

1. **Frontend**: 
   - Go to your Static Site
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment

2. **Backend**:
   - Go to your Web Service  
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - Wait for deployment

### Step 4: Verify

1. Open your frontend URL in browser
2. Open browser DevTools (F12) → Console tab
3. Try to sign up or login
4. Check the Network tab to see what URL is being called
5. It should be: `https://your-backend-url.onrender.com/api/auth/signup`

## Common Issues

### Issue: Environment variable not working
**Solution**: 
- Vite environment variables must start with `VITE_`
- They must be set in Render **before** building
- After setting, you must **redeploy** the frontend

### Issue: Still seeing localhost in network requests
**Solution**:
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that `VITE_API_URL` is set correctly in Render
- Redeploy frontend after setting the variable

### Issue: CORS still blocking
**Solution**:
- Verify `FRONTEND_URL` in backend matches your exact frontend URL
- Check backend logs for CORS error messages
- Make sure backend is deployed with latest code

## Quick Checklist

- [ ] `VITE_API_URL` set in Frontend environment variables
- [ ] `VITE_API_URL` includes `/api` at the end
- [ ] `VITE_API_URL` uses `https://` not `http://`
- [ ] `FRONTEND_URL` set in Backend environment variables
- [ ] `FRONTEND_URL` matches your exact frontend URL
- [ ] Both services redeployed after setting variables
- [ ] Browser cache cleared

