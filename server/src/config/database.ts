import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Validate required database environment variables
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('Missing required database environment variables:', missingVars);
  console.error('Please set the following in Render Dashboard:');
  missingVars.forEach(varName => console.error(`  - ${varName}`));
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'smartcal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Add connection timeout
  connectTimeout: 10000,
  // Enable reconnection
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test database connection on startup
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection successful');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Check your database environment variables:');
    console.error('  DB_HOST:', process.env.DB_HOST || 'NOT SET');
    console.error('  DB_USER:', process.env.DB_USER || 'NOT SET');
    console.error('  DB_NAME:', process.env.DB_NAME || 'NOT SET');
    console.error('  DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
  });

export default pool;

