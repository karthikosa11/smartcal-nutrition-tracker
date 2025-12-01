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

// Helper function to test database connection
async function testConnection() {
  try {
    const testPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'smartcal_db',
      waitForConnections: true,
      connectionLimit: 1,
      connectTimeout: 5000,
    });
    
    const connection = await testPool.getConnection();
    await connection.ping();
    connection.release();
    await testPool.end();
    return true;
  } catch (error) {
    return false;
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'smartcal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Retry configuration
  reconnect: true,
  // SSL configuration (for services like PlanetScale)
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test database connection on startup (non-blocking)
testConnection()
  .then(success => {
    if (success) {
      console.log('✅ Database connection successful');
      console.log('Database info:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        passwordSet: !!process.env.DB_PASSWORD
      });
    } else {
      console.warn('⚠️ Database connection test failed on startup');
      console.warn('The app will continue to run, but database operations may fail.');
      console.warn('Check your database environment variables in Render:');
      console.warn('  DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
      console.warn('  DB_USER:', process.env.DB_USER || '❌ NOT SET');
      console.warn('  DB_NAME:', process.env.DB_NAME || '❌ NOT SET');
      console.warn('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');
    }
  })
  .catch(() => {
    console.warn('⚠️ Could not test database connection on startup');
  });

export default pool;

