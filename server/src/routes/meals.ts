import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { withTransaction } from '../utils/transaction.js';
import crypto from 'crypto';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all meal logs for user
router.get('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching logs for userId:', userId);
    
    const [logs] = await pool.query(
      `SELECT * FROM meal_logs 
       WHERE user_id = ? 
       ORDER BY timestamp DESC`,
      [userId]
    );

    const logsArray = logs as any[];
    console.log('Found logs in database:', logsArray.length);
    
    // Convert date objects to YYYY-MM-DD format for JSON serialization
    const serializedLogs = logsArray.map((log: any) => {
      let dateStr: string;
      if (log.date instanceof Date) {
        dateStr = log.date.toISOString().split('T')[0];
      } else if (typeof log.date === 'string') {
        // Handle both ISO format (2025-11-30T06:00:00.000Z) and YYYY-MM-DD format
        dateStr = log.date.split('T')[0];
      } else {
        // Fallback: try to parse as date
        dateStr = new Date(log.date).toISOString().split('T')[0];
      }
      
      return {
        ...log,
        date: dateStr
      };
    });
    
    console.log('Serialized logs (first log date):', serializedLogs[0]?.date);
    res.json({ logs: serializedLogs || [] });
  } catch (error: any) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get meal logs by date range
router.get('/by-date', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM meal_logs WHERE user_id = ?';
    const params: any[] = [userId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY timestamp DESC';

    const [logs] = await pool.query(query, params);
    const logsArray = logs as any[];
    
    // Convert date objects to YYYY-MM-DD format
    const serializedLogs = logsArray.map((log: any) => {
      let dateStr: string;
      if (log.date instanceof Date) {
        dateStr = log.date.toISOString().split('T')[0];
      } else if (typeof log.date === 'string') {
        dateStr = log.date.split('T')[0];
      } else {
        dateStr = new Date(log.date).toISOString().split('T')[0];
      }
      return { ...log, date: dateStr };
    });
    
    res.json({ logs: serializedLogs });
  } catch (error: any) {
    console.error('Get logs by date error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single meal log
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [logs] = await pool.query(
      'SELECT * FROM meal_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const logArray = logs as any[];
    if (!logArray || logArray.length === 0) {
      return res.status(404).json({ error: 'Meal log not found' });
    }

    // Convert date to YYYY-MM-DD format
    const log = logArray[0];
    if (log) {
      log.date = log.date instanceof Date 
        ? log.date.toISOString().split('T')[0] 
        : (typeof log.date === 'string' ? log.date.split('T')[0] : log.date);
    }

    res.json({ log });
  } catch (error: any) {
    console.error('Get log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create meal log
router.post('/', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { date, mealType, foodItems, totalCalories, imageUrl, notes } = req.body;

    if (!date || !mealType || !foodItems || !Array.isArray(foodItems) || foodItems.length === 0) {
      return res.status(400).json({ error: 'Invalid meal log data' });
    }

    const logId = crypto.randomUUID();
    const timestamp = Date.now();

    // Use transaction to ensure data consistency
    const log = await withTransaction(async (connection) => {
      // Insert meal log
      await connection.query(
        `INSERT INTO meal_logs 
         (id, user_id, date, meal_type, food_items, total_calories, image_url, notes, timestamp) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          logId,
          userId,
          date,
          mealType,
          JSON.stringify(foodItems),
          totalCalories || foodItems.reduce((sum: number, item: any) => sum + (item.calories || 0), 0),
          imageUrl || null,
          notes || null,
          timestamp
        ]
      );

      // Fetch the created log
      const [newLog] = await connection.query('SELECT * FROM meal_logs WHERE id = ?', [logId]);
      const logArray = newLog as any[];
      
      // Convert date to YYYY-MM-DD format
      const createdLog = logArray[0];
      if (createdLog) {
        createdLog.date = createdLog.date instanceof Date 
          ? createdLog.date.toISOString().split('T')[0] 
          : (typeof createdLog.date === 'string' ? createdLog.date.split('T')[0] : createdLog.date);
      }
      
      return createdLog;
    });
    
    console.log('Created meal log:', log);
    res.status(201).json({ log });
  } catch (error: any) {
    console.error('Create log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update meal log
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { date, mealType, foodItems, totalCalories, imageUrl, notes } = req.body;

    // Use transaction for update operation
    const log = await withTransaction(async (connection) => {
      // Check if log exists and belongs to user
      const [existing] = await connection.query(
        'SELECT id FROM meal_logs WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      const existingArray = existing as any[];
      if (!existingArray || existingArray.length === 0) {
        throw new Error('Meal log not found');
      }

      // Update meal log
      await connection.query(
        `UPDATE meal_logs 
         SET date = ?, meal_type = ?, food_items = ?, total_calories = ?, image_url = ?, notes = ?
         WHERE id = ? AND user_id = ?`,
        [
          date,
          mealType,
          JSON.stringify(foodItems),
          totalCalories,
          imageUrl || null,
          notes || null,
          id,
          userId
        ]
      );

      // Fetch updated log
      const [updated] = await connection.query('SELECT * FROM meal_logs WHERE id = ?', [id]);
      const updatedArray = updated as any[];
      
      // Convert date to YYYY-MM-DD format
      const updatedLog = updatedArray[0];
      if (updatedLog) {
        updatedLog.date = updatedLog.date instanceof Date 
          ? updatedLog.date.toISOString().split('T')[0] 
          : (typeof updatedLog.date === 'string' ? updatedLog.date.split('T')[0] : updatedLog.date);
      }
      
      return updatedLog;
    });
    
    res.json({ log });
  } catch (error: any) {
    console.error('Update log error:', error);
    if (error.message === 'Meal log not found') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete meal log
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const [result] = await pool.query(
      'DELETE FROM meal_logs WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    const resultArray = result as any;
    if (resultArray.affectedRows === 0) {
      return res.status(404).json({ error: 'Meal log not found' });
    }

    res.json({ message: 'Meal log deleted successfully' });
  } catch (error: any) {
    console.error('Delete log error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly stats
router.get('/stats/weekly', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const [logs] = await pool.query(
      `SELECT * FROM meal_logs
       WHERE user_id = ? AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       ORDER BY date ASC`,
      [userId]
    );

    const logsArray = logs as any[];
    const statsMap: Record<string, any> = {};

    logsArray.forEach((log: any) => {
      const date = log.date;
      if (!statsMap[date]) {
        statsMap[date] = { date, calories: 0, protein: 0, carbs: 0, fat: 0 };
      }
      
      statsMap[date].calories += log.total_calories || 0;
      
      const foodItems = typeof log.food_items === 'string' 
        ? JSON.parse(log.food_items) 
        : log.food_items;
      
      if (Array.isArray(foodItems)) {
        foodItems.forEach((item: any) => {
          statsMap[date].protein += item.protein || 0;
          statsMap[date].carbs += item.carbs || 0;
          statsMap[date].fat += item.fat || 0;
        });
      }
    });

    const stats = Object.values(statsMap).sort((a: any, b: any) => 
      a.date.localeCompare(b.date)
    );

    res.json({ stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

