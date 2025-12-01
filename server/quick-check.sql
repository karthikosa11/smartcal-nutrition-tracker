-- Quick SQL queries to check your SmartCal database
-- Run these in MySQL command line or MySQL Workbench

-- 1. Select the database
USE smartcal_db;

-- 2. Check if tables exist
SHOW TABLES;

-- 3. Count records
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Meal Logs', COUNT(*) FROM meal_logs;

-- 4. View all users
SELECT id, username, email, role, daily_calorie_target, created_at 
FROM users;

-- 5. View all meal logs (formatted)
SELECT 
    id,
    user_id,
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    meal_type,
    total_calories,
    JSON_EXTRACT(food_items, '$[0].name') as food_name,
    timestamp,
    created_at
FROM meal_logs
ORDER BY timestamp DESC
LIMIT 20;

-- 6. View meals with user info
SELECT 
    u.username,
    ml.date,
    ml.meal_type,
    ml.total_calories,
    JSON_EXTRACT(ml.food_items, '$[0].name') as food_name
FROM meal_logs ml
JOIN users u ON ml.user_id = u.id
ORDER BY ml.timestamp DESC
LIMIT 10;

-- 7. Today's meals summary
SELECT 
    DATE_FORMAT(date, '%Y-%m-%d') as date,
    COUNT(*) as meal_count,
    SUM(total_calories) as total_calories
FROM meal_logs
WHERE date = CURDATE()
GROUP BY date;

