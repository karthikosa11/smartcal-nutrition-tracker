import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import pool from '../config/database.js';
import crypto from 'crypto';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (!JWT_SECRET || JWT_SECRET === 'your-secret-key-change-in-production') {
  console.warn('Warning: Using default JWT_SECRET. Change this in production!');
}

// Signup
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password, dailyCalorieTarget } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userId = crypto.randomUUID();
    await pool.query(
      `INSERT INTO users (id, username, email, password_hash, daily_calorie_target, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, username, email, passwordHash, dailyCalorieTarget || 2000, 'USER']
    );

    // Generate token
    const token = jwt.sign(
      { userId, username, email, role: 'USER' },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        role: 'USER',
        dailyCalorieTarget: dailyCalorieTarget || 2000
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    const userArray = users as any[];
    if (!userArray || userArray.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userArray[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN } as SignOptions
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        dailyCalorieTarget: user.daily_calorie_target
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Verify token
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Get fresh user data
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded.userId]);
    const userArray = users as any[];
    
    if (!userArray || userArray.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userArray[0];
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        dailyCalorieTarget: user.daily_calorie_target
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;
    const { username, email, dailyCalorieTarget } = req.body;

    // Check if user exists
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const userArray = users as any[];
    
    if (!userArray || userArray.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if username/email already exists (if changed)
    if (username || email) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?',
        [username || userArray[0].username, email || userArray[0].email, userId]
      );
      
      if (Array.isArray(existing) && existing.length > 0) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    if (dailyCalorieTarget !== undefined) {
      updates.push('daily_calorie_target = ?');
      values.push(dailyCalorieTarget);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const [updated] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedArray = updated as any[];
    const updatedUser = updatedArray[0];

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        dailyCalorieTarget: updatedUser.daily_calorie_target
      }
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

