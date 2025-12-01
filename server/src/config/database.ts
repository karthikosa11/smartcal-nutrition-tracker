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
    console.log('Database info:', {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      database: process.env.DB_NAME,
      passwordSet: !!process.env.DB_PASSWORD
    });
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    console.error('\n📋 Check your database environment variables in Render:');
    console.error('  DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
    console.error('  DB_USER:', process.env.DB_USER || '❌ NOT SET');
    console.error('  DB_NAME:', process.env.DB_NAME || '❌ NOT SET');
    console.error('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');
    console.error('\n💡 Common issues:');
    console.error('  1. Database credentials are incorrect');
    console.error('  2. Database does not exist');
    console.error('  3. Database is not accessible from Render');
    console.error('  4. Database requires SSL connection');
    console.error('  5. Firewall blocking connections');
  });

export default pool;

