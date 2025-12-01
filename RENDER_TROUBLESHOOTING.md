# Render Deployment Troubleshooting

## Frontend 404 Error

If you're getting a 404 error on your frontend URL, check the following:

### 1. Verify Static Site Configuration

In Render Dashboard → Your Static Site → Settings:

- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`
- **Root Directory**: Leave empty (or set to repository root)

### 2. Check Build Logs

1. Go to your Static Site in Render Dashboard
2. Click on "Logs" tab
3. Check if the build completed successfully
4. Look for any errors during the build process

### 3. Verify Build Output

The build should create:
- `frontend/dist/index.html`
- `frontend/dist/assets/` (with JS and CSS files)

### 4. Common Issues

#### Issue: Build fails with TypeScript errors
**Solution**: All TypeScript errors should be fixed. If you see new errors, check the build logs.

#### Issue: "Publish directory not found"
**Solution**: 
- Verify the build completed successfully
- Check that `frontend/dist` exists after build
- Ensure "Publish Directory" is set to `frontend/dist` (not `dist`)

#### Issue: 404 on all routes
**Solution**: This is normal for SPAs. Render should serve `index.html` for all routes. If not:
- Check Render's static site settings
- Ensure you're using a Static Site (not Web Service) for the frontend

### 5. Manual Build Test

Test the build locally:
```bash
cd frontend
npm install
npm run build
ls dist/  # Should show index.html and assets/
```

### 6. Check Environment Variables

Ensure these are set in Render:
- `VITE_API_URL` - Your backend API URL
- `VITE_GEMINI_API_KEY` - Your Gemini API key

### 7. Redeploy

If configuration is correct but still getting 404:
1. Go to your Static Site in Render
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete
4. Check the new URL

### 8. Verify URL

Render static sites use the format:
- `https://your-service-name.onrender.com`

Make sure you're accessing the correct URL from your Render dashboard.

