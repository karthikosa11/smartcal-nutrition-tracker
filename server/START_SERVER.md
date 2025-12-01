# How to Start the Backend Server

## Quick Start

1. **Make sure you're in the server directory:**
   ```bash
   cd server
   ```

2. **Create `.env` file** (if it doesn't exist):
   Create a file named `.env` in the `server` directory with:
   ```bash
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=smartcal_db
   JWT_SECRET=smartcal-secret-key-change-in-production
   JWT_EXPIRES_IN=7d
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   ```

3. **Create MySQL database:**
   ```sql
   CREATE DATABASE smartcal_db;
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

   You should see: `Server running on http://localhost:3001`

## Troubleshooting

### If you get database connection errors:
- Make sure MySQL is running
- Check your MySQL password in `.env`
- Verify the database `smartcal_db` exists

### If port 3001 is already in use:
- Change `PORT=3001` to another port in `.env`
- Update `VITE_API_URL` in frontend `.env` to match

### If you get module not found errors:
- Run `npm install` in the server directory

