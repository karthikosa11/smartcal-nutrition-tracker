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

// Helper function to test database connection with detailed error
async function testConnection() {
  try {
    const testConfig: any = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'smartcal_db',
      waitForConnections: true,
      connectionLimit: 1,
      connectTimeout: 10000,
    };
    
    if (process.env.DB_PORT) {
      testConfig.port = parseInt(process.env.DB_PORT, 10);
    }
    
    if (process.env.DB_SSL === 'true') {
      testConfig.ssl = { rejectUnauthorized: false };
    }
    
    const testPool = mysql.createPool(testConfig);
    const connection = await testPool.getConnection();
    await connection.ping();
    connection.release();
    await testPool.end();
    return { success: true, error: null };
  } catch (error: any) {
    return { 
      success: false, 
      error: {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState
      }
    };
  }
}

// SSL configuration (for services like PlanetScale or MySQL with SSL)
const sslConfig = process.env.DB_SSL === 'true' 
  ? { rejectUnauthorized: false } 
  : undefined;

// MySQL connection pool configuration
const poolConfig: any = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'smartcal_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // Increased timeout for slower connections
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // MySQL specific options
  multipleStatements: false,
  dateStrings: false,
  timezone: 'Z', // UTC timezone
};

// Add port if specified
if (process.env.DB_PORT) {
  poolConfig.port = parseInt(process.env.DB_PORT, 10);
}

// Add SSL if needed
if (sslConfig) {
  poolConfig.ssl = sslConfig;
}

const pool = mysql.createPool(poolConfig);

// Test database connection on startup (non-blocking)
testConnection()
  .then(result => {
    if (result.success) {
      console.log('✅ Database connection successful');
      console.log('Database info:', {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || '3306 (default)',
        passwordSet: !!process.env.DB_PASSWORD,
        ssl: process.env.DB_SSL === 'true' ? 'enabled' : 'disabled'
      });
    } else {
      console.error('❌ Database connection test failed on startup');
      console.error('Error details:', result.error);
      console.error('\n📋 Current environment variables:');
      console.error('  DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
      console.error('  DB_USER:', process.env.DB_USER || '❌ NOT SET');
      console.error('  DB_NAME:', process.env.DB_NAME || '❌ NOT SET');
      console.error('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET' : '❌ NOT SET');
      console.error('  DB_PORT:', process.env.DB_PORT || '3306 (default)');
      console.error('  DB_SSL:', process.env.DB_SSL || 'false (default)');
      console.error('\n💡 Common MySQL connection issues:');
      if (result.error?.code === 'ECONNREFUSED') {
        console.error('  - Database server is not running or not accessible');
        console.error('  - Check if DB_HOST is correct');
        console.error('  - Verify database server is running');
      } else if (result.error?.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('  - Wrong username or password');
        console.error('  - Check DB_USER and DB_PASSWORD');
      } else if (result.error?.code === 'ER_BAD_DB_ERROR') {
        console.error('  - Database does not exist');
        console.error('  - Check DB_NAME or create the database');
      } else if (result.error?.code === 'ETIMEDOUT') {
        console.error('  - Connection timeout');
        console.error('  - Check network connectivity and firewall settings');
      }
      console.error('\n⚠️ The app will continue to run, but database operations will fail.');
      console.error('⚠️ Please fix the database configuration and redeploy.');
    }
  })
  .catch(() => {
    console.warn('⚠️ Could not test database connection on startup');
  });

export default pool;

