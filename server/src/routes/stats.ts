import express from 'express';
import pool from '../config/database.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { updateDailyStats } from '../config/warehouse.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get daily stats from warehouse (fast)
router.get('/daily', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { startDate, endDate } = req.query;

    let query = 'SELECT * FROM daily_stats WHERE user_id = ?';
    const params: any[] = [userId];

    if (startDate) {
      query += ' AND date >= ?';
      params.push(startDate);
    }
    if (endDate) {
      query += ' AND date <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY date DESC';

    const [stats] = await pool.query(query, params);
    res.json({ stats });
  } catch (error: any) {
    console.error('Get daily stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get weekly stats from warehouse (fast)
router.get('/weekly', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    const { startWeek, endWeek } = req.query;

    let query = 'SELECT * FROM weekly_stats WHERE user_id = ?';
    const params: any[] = [userId];

    if (startWeek) {
      query += ' AND week_start_date >= ?';
      params.push(startWeek);
    }
    if (endWeek) {
      query += ' AND week_end_date <= ?';
      params.push(endWeek);
    }

    query += ' ORDER BY week_start_date DESC';

    const [stats] = await pool.query(query, params);
    res.json({ stats });
  } catch (error: any) {
    console.error('Get weekly stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Trigger ETL update (admin only or for testing)
router.post('/update', async (req: AuthRequest, res) => {
  try {
    const userId = req.userId;
    await updateDailyStats(userId);
    res.json({ message: 'Stats updated successfully' });
  } catch (error: any) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

