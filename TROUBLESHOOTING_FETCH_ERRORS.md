# Troubleshooting "Failed to Fetch" Errors

## Common Causes

### 1. Backend Service Sleeping (Render Free Tier)
**Problem:** Render free tier services spin down after 15 minutes of inactivity. First request takes 30-60 seconds to wake up.

**Solution:**
- Wait 30-60 seconds and try again
- The first request will wake up the service
- Subsequent requests will be fast

**Check:**
- Go to Render Dashboard → Your Backend Service
- Check if it shows "Sleeping" or "Live"
- If sleeping, make a request and wait

### 2. Environment Variables Not Set
**Problem:** Frontend `VITE_API_URL` not set correctly in Render.

**Check:**
1. Go to Render Dashboard → Frontend Static Site → Environment
2. Verify `VITE_API_URL` is set to: `https://smartcal-nutrition-tracker.onrender.com/api`
3. Must include `/api` at the end
4. Must use `https://` not `http://`

**Fix:**
- Add/Update `VITE_API_URL` in Render
- Redeploy frontend after setting

### 3. Backend Not Running
**Problem:** Backend service crashed or failed to start.

**Check:**
1. Go to Render Dashboard → Backend Web Service → Logs
2. Look for errors
3. Check if service shows "Live" status

**Fix:**
- Check build logs for errors
- Verify all environment variables are set
- Check database connection
- Redeploy if needed

### 4. CORS Issues
**Problem:** Backend blocking requests from frontend.

**Check:**
- Open browser DevTools → Network tab
- Look for CORS errors in console
- Check backend logs for CORS warnings

**Fix:**
- Verify `FRONTEND_URL` is set in backend environment variables
- Should be: `https://smartcal-nutrition-tracker-frontend.onrender.com`
- Redeploy backend after setting

### 5. Network/Firewall Issues
**Problem:** Device network blocking requests.

**Check:**
- Try from different network (mobile data vs WiFi)
- Check if firewall is blocking
- Try accessing backend health endpoint directly:
  - `https://smartcal-nutrition-tracker.onrender.com/api/health`

## Quick Fixes

### Step 1: Verify Backend is Running
```bash
# Test backend health endpoint
curl https://smartcal-nutrition-tracker.onrender.com/api/health
```

Should return: `{"status":"ok","message":"SmartCal API is running"}`

### Step 2: Check Environment Variables

**Frontend (Render Dashboard):**
- `VITE_API_URL` = `https://smartcal-nutrition-tracker.onrender.com/api`

**Backend (Render Dashboard):**
- `FRONTEND_URL` = `https://smartcal-nutrition-tracker-frontend.onrender.com`
- `NODE_ENV` = `production`
- `PORT` = `10000` (or leave default)
- Database variables set correctly

### Step 3: Redeploy Services

1. **Backend:**
   - Go to Backend Service → Manual Deploy → Deploy latest commit
   - Wait for deployment

2. **Frontend:**
   - Go to Frontend Static Site → Manual Deploy → Deploy latest commit
   - Wait for deployment

### Step 4: Test from Browser

1. Open frontend: https://smartcal-nutrition-tracker-frontend.onrender.com
2. Open DevTools (F12) → Console tab
3. Try to sign up/login
4. Check Network tab for failed requests
5. Look at error messages

## Error Messages Explained

### "Failed to fetch"
- **Meaning:** Cannot connect to backend
- **Causes:** Backend sleeping, wrong URL, network issue
- **Fix:** Wait 30-60 seconds, check environment variables

### "Network error"
- **Meaning:** Request timed out or connection failed
- **Causes:** Backend sleeping, slow network
- **Fix:** Wait and retry, check backend status

### "CORS policy" error
- **Meaning:** Backend blocking request
- **Causes:** CORS not configured correctly
- **Fix:** Check `FRONTEND_URL` in backend, redeploy

### "Request failed"
- **Meaning:** Backend responded but with error
- **Causes:** Validation error, server error
- **Fix:** Check backend logs, verify request data

## Testing Checklist

- [ ] Backend health endpoint works: `/api/health`
- [ ] Frontend `VITE_API_URL` is set correctly
- [ ] Backend `FRONTEND_URL` is set correctly
- [ ] Both services are "Live" in Render
- [ ] No errors in backend logs
- [ ] No errors in frontend build logs
- [ ] Can access frontend URL
- [ ] Can access backend health endpoint
- [ ] Network requests show correct URLs in DevTools

## For Mobile/Other Devices

### Common Issues:
1. **Slow first request** - Backend waking up (wait 30-60 sec)
2. **Cached old URL** - Clear browser cache
3. **Network restrictions** - Try different network
4. **HTTPS required** - Ensure using `https://` not `http://`

### Testing:
1. Open frontend URL on device
2. Open browser DevTools (if possible) or use remote debugging
3. Check Network tab for requests
4. Verify requests go to: `https://smartcal-nutrition-tracker.onrender.com/api/...`
5. Check for error messages

## Still Not Working?

1. **Check Render Dashboard:**
   - Are both services "Live"?
   - Any errors in logs?
   - Are environment variables set?

2. **Test Backend Directly:**
   - Open: `https://smartcal-nutrition-tracker.onrender.com/api/health`
   - Should see JSON response

3. **Check Browser Console:**
   - Open DevTools → Console
   - Look for error messages
   - Check Network tab for failed requests

4. **Verify URLs:**
   - Frontend: `https://smartcal-nutrition-tracker-frontend.onrender.com`
   - Backend: `https://smartcal-nutrition-tracker.onrender.com`
   - API calls should go to: `https://smartcal-nutrition-tracker.onrender.com/api/...`

