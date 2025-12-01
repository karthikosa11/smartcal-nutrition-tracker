import pool from './database.js';

/**
 * Initialize data warehouse tables for analytics
 */
export async function initializeWarehouse() {
  try {
    const connection = await pool.getConnection();
    
    // Daily stats aggregation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS daily_stats (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        total_calories INT DEFAULT 0,
        total_protein DECIMAL(10, 2) DEFAULT 0,
        total_carbs DECIMAL(10, 2) DEFAULT 0,
        total_fat DECIMAL(10, 2) DEFAULT 0,
        meal_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date (user_id, date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, date)
      )
    `);

    // Weekly stats aggregation table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS weekly_stats (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        week_start_date DATE NOT NULL,
        week_end_date DATE NOT NULL,
        total_calories INT DEFAULT 0,
        avg_daily_calories DECIMAL(10, 2) DEFAULT 0,
        total_protein DECIMAL(10, 2) DEFAULT 0,
        total_carbs DECIMAL(10, 2) DEFAULT 0,
        total_fat DECIMAL(10, 2) DEFAULT 0,
        meal_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_week (user_id, week_start_date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_week (user_id, week_start_date)
      )
    `);

    connection.release();
    console.log('Data warehouse tables initialized successfully');
  } catch (error) {
    console.error('Error initializing warehouse:', error);
    throw error;
  }
}

/**
 * ETL: Extract, Transform, Load daily stats
 * Should be run daily (via cron job or scheduler)
 */
export async function updateDailyStats(userId?: string) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userIdFilter = userId ? 'AND ml.user_id = ?' : '';
    const params: any[] = userId ? [userId] : [];
    
    // Calculate daily stats from meal_logs
    // Note: JSON_EXTRACT for arrays requires a different approach
    const [stats] = await connection.query(`
      INSERT INTO daily_stats (id, user_id, date, total_calories, total_protein, total_carbs, total_fat, meal_count)
      SELECT 
        UUID() as id,
        ml.user_id,
        ml.date,
        SUM(ml.total_calories) as total_calories,
        0 as total_protein,  -- Will be calculated in application code
        0 as total_carbs,     -- Will be calculated in application code
        0 as total_fat,       -- Will be calculated in application code
        COUNT(*) as meal_count
      FROM meal_logs ml
      WHERE ml.date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ${userIdFilter}
      GROUP BY ml.user_id, ml.date
      ON DUPLICATE KEY UPDATE
        total_calories = VALUES(total_calories),
        meal_count = VALUES(meal_count),
        updated_at = CURRENT_TIMESTAMP
    `, params);
    
    // Update protein, carbs, fat from food_items JSON
    const [logs] = await connection.query(`
      SELECT user_id, date, food_items 
      FROM meal_logs 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ${userIdFilter}
    `, params);
    
    const logsArray = logs as any[];
    const dailyTotals: Record<string, { protein: number; carbs: number; fat: number }> = {};
    
    logsArray.forEach((log: any) => {
      const key = `${log.user_id}_${log.date}`;
      if (!dailyTotals[key]) {
        dailyTotals[key] = { protein: 0, carbs: 0, fat: 0 };
      }
      
      const foodItems = typeof log.food_items === 'string' 
        ? JSON.parse(log.food_items) 
        : log.food_items;
      
      if (Array.isArray(foodItems)) {
        foodItems.forEach((item: any) => {
          dailyTotals[key].protein += item.protein || 0;
          dailyTotals[key].carbs += item.carbs || 0;
          dailyTotals[key].fat += item.fat || 0;
        });
      }
    });
    
    // Update daily_stats with calculated values
    for (const [key, totals] of Object.entries(dailyTotals)) {
      const [userId, date] = key.split('_');
      await connection.query(`
        UPDATE daily_stats 
        SET total_protein = ?, total_carbs = ?, total_fat = ?
        WHERE user_id = ? AND date = ?
      `, [totals.protein, totals.carbs, totals.fat, userId, date]);
    }
    
    await connection.commit();
    console.log('Daily stats updated successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Error updating daily stats:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * ETL: Update weekly stats
 */
export async function updateWeeklyStats(userId?: string) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const userIdFilter = userId ? 'WHERE ds.user_id = ?' : '';
    const params: any[] = userId ? [userId] : [];
    
    // Calculate weekly stats from daily_stats
    const [stats] = await connection.query(`
      INSERT INTO weekly_stats (
        id, user_id, week_start_date, week_end_date,
        total_calories, avg_daily_calories, total_protein, total_carbs, total_fat, meal_count
      )
      SELECT 
        UUID() as id,
        ds.user_id,
        DATE_SUB(ds.date, INTERVAL WEEKDAY(ds.date) DAY) as week_start_date,
        DATE_ADD(DATE_SUB(ds.date, INTERVAL WEEKDAY(ds.date) DAY), INTERVAL 6 DAY) as week_end_date,
        SUM(ds.total_calories) as total_calories,
        AVG(ds.total_calories) as avg_daily_calories,
        SUM(ds.total_protein) as total_protein,
        SUM(ds.total_carbs) as total_carbs,
        SUM(ds.total_fat) as total_fat,
        SUM(ds.meal_count) as meal_count
      FROM daily_stats ds
      ${userIdFilter}
      WHERE ds.date >= DATE_SUB(CURDATE(), INTERVAL 4 WEEK)
      GROUP BY ds.user_id, week_start_date
      ON DUPLICATE KEY UPDATE
        total_calories = VALUES(total_calories),
        avg_daily_calories = VALUES(avg_daily_calories),
        total_protein = VALUES(total_protein),
        total_carbs = VALUES(total_carbs),
        total_fat = VALUES(total_fat),
        meal_count = VALUES(meal_count),
        updated_at = CURRENT_TIMESTAMP
    `, params);
    
    await connection.commit();
    console.log('Weekly stats updated successfully');
  } catch (error) {
    await connection.rollback();
    console.error('Error updating weekly stats:', error);
    throw error;
  } finally {
    connection.release();
  }
}

