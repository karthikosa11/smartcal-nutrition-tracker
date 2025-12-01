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

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://smartcal-nutrition-tracker-frontend.onrender.com', // Frontend URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Log for debugging
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    
    // In production, be more permissive - allow any Render subdomain
    if (process.env.NODE_ENV === 'production') {
      // Allow Render domains
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

// Initialize database and warehouse
initializeDatabase()
  .then(() => {
    console.log('✅ Database initialized successfully');
    return initializeWarehouse();
  })
  .then(() => {
    console.log('✅ Data warehouse initialized successfully');
  })
  .catch((error) => {
    console.error('❌ Initialization error:', error);
    console.error('This might be normal on first startup if tables need to be created.');
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const [result] = await pool.query('SELECT 1 as test');
    res.json({ 
      status: 'ok', 
      message: 'SmartCal API is running',
      database: 'connected'
    });
  } catch (error: any) {
    console.error('Health check - Database error:', error.message);
    res.status(503).json({ 
      status: 'error', 
      message: 'SmartCal API is running but database connection failed',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

