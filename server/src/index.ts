import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/initDatabase.js';
import { initializeWarehouse } from './config/warehouse.js';
import authRoutes from './routes/auth.js';
import mealRoutes from './routes/meals.js';
import statsRoutes from './routes/stats.js';
import pool from './config/database.js';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);


const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://smartcal-nutrition-tracker-frontend.onrender.com', // Frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    
    
    if (process.env.NODE_ENV === 'production') {
     
      if (origin.includes('.onrender.com')) {
        return callback(null, true);
      }
    }
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowed => {
      // Exact match
      if (origin === allowed) return true;
      // Check if origin starts with allowed (for subdomains)
      if (allowed && origin.startsWith(allowed)) return true;
      return false;
    });
    
    if (isAllowed || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.warn('CORS blocked origin:', origin);
      // In production, still allow but log warning
      if (process.env.NODE_ENV === 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database and warehouse (non-blocking - app will start even if this fails)
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    return initializeWarehouse();
  })
  .then(() => {
    console.log('✅ Data warehouse initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Initialization error:', error.message);
    console.error('⚠️ App will continue to run, but database operations may fail.');
    console.error('💡 Check your database environment variables in Render Dashboard.');
    console.error('💡 The database will be initialized when the first request is made.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/stats', statsRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'SmartCal API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      meals: '/api/meals',
      stats: '/api/stats'
    }
  });
});

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ 
      status: 'ok', 
      message: 'SmartCal API is running',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Health check - Database error:', error.message);
    
    // Provide helpful error information
    const errorInfo: any = {
      status: 'error', 
      message: 'SmartCal API is running but database connection failed',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    };
    
    if (error.code === 'ECONNREFUSED') {
      errorInfo.error = 'Database server refused connection. Check DB_HOST and ensure database is running.';
      errorInfo.code = 'ECONNREFUSED';
    } else if (error.code === 'ETIMEDOUT') {
      errorInfo.error = 'Database connection timeout. Check DB_HOST and network connectivity.';
      errorInfo.code = 'ETIMEDOUT';
    } else if (error.code === 'ENOTFOUND') {
      errorInfo.error = 'Database host not found. Check DB_HOST value.';
      errorInfo.code = 'ENOTFOUND';
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      errorInfo.error = 'Database access denied. Check DB_USER and DB_PASSWORD.';
      errorInfo.code = 'ER_ACCESS_DENIED_ERROR';
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      errorInfo.error = 'Database does not exist. Check DB_NAME value.';
      errorInfo.code = 'ER_BAD_DB_ERROR';
    } else {
      errorInfo.error = process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed';
      errorInfo.code = error.code || 'UNKNOWN';
    }
    
    res.status(503).json(errorInfo);
  }
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: {
      root: 'GET /',
      health: 'GET /api/health',
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      verify: 'GET /api/auth/verify',
      profile: 'PUT /api/auth/profile'
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

