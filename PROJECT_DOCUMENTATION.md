# SmartCal AI Nutrition Tracker - Complete Documentation

## 📱 Application Description

### Overview
SmartCal AI Nutrition Tracker is a full-stack web application designed to help users track their daily nutrition intake using AI-powered food recognition. The application allows users to log meals through natural language input, manually enter food items, visualize their nutritional progress, and receive AI-generated dietary insights.

### Key Features

#### 1. **User Authentication**
- Secure user registration and login
- JWT-based session management
- Password hashing with bcrypt
- User profile management
- Customizable daily calorie targets

#### 2. **AI-Powered Meal Logging**
- Natural language food parsing using Google Gemini AI
- Supports multiple food items in a single input
- Example: "100 grams of chicken and 2 eggs"
- Automatic calculation of calories, protein, carbs, and fat
- Fallback parser with food database when AI is unavailable

#### 3. **Manual Meal Entry**
- Add multiple food items per meal
- Real-time nutrition calculation
- Support for weight-based (grams) and count-based (eggs) items
- Automatic total calculation for all items

#### 4. **Dashboard & Visualization**
- Daily calorie progress tracking
- Macro breakdown (protein, carbs, fat)
- Interactive charts using Recharts
- Weekly statistics and trends
- Visual progress indicators

#### 5. **Meal History**
- Chronological display of all meals
- View multiple food items per meal
- Edit meals with quantity-based updates
- Automatic nutrition recalculation when quantities change
- Delete meal functionality

#### 6. **Dietary Insights**
- AI-powered analysis of eating patterns
- Personalized dietary recommendations
- Nutritional trend analysis

#### 7. **Settings Management**
- Update daily calorie targets
- Profile information management
- Real-time updates across the application

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development and building
- Tailwind CSS for modern, responsive UI
- Recharts for data visualization
- Google Gemini AI for food parsing

**Backend:**
- Express.js with TypeScript
- MySQL for data persistence
- JWT for authentication
- Bcrypt for password hashing
- Transaction management for data consistency

**Deployment:**
- Frontend: Render (Static Site)
- Backend: Render (Web Service)
- Database: Cloud MySQL (Railway, PlanetScale, etc.)

---

## 🗄️ Database Architecture

### Database Schema

The application uses MySQL with the following table structure:

#### 1. **users** Table
Stores user account information and preferences.

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('USER', 'ADMIN') DEFAULT 'USER',
  daily_calorie_target INT DEFAULT 2000,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `username`: Unique username
- `email`: Unique email address
- `password_hash`: Bcrypt hashed password
- `role`: User role (USER or ADMIN)
- `daily_calorie_target`: User's daily calorie goal
- `created_at`: Account creation timestamp
- `updated_at`: Last update timestamp

#### 2. **meal_logs** Table
Stores individual meal entries with food items.

```sql
CREATE TABLE meal_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  meal_type ENUM('Breakfast', 'Lunch', 'Dinner', 'Snack') NOT NULL,
  food_items JSON NOT NULL,
  total_calories INT NOT NULL,
  image_url TEXT,
  notes TEXT,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_date (user_id, date),
  INDEX idx_user_timestamp (user_id, timestamp)
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `user_id`: Foreign key to users table
- `date`: Meal date (YYYY-MM-DD)
- `meal_type`: Type of meal (Breakfast, Lunch, Dinner, Snack)
- `food_items`: JSON array of food items
  ```json
  [
    {
      "name": "Chicken 100g",
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6
    }
  ]
  ```
- `total_calories`: Sum of calories from all food items
- `image_url`: Optional image URL (for future image recognition)
- `notes`: Optional user notes
- `timestamp`: Unix timestamp for sorting
- `created_at`: Entry creation timestamp
- `updated_at`: Last update timestamp

**Indexes:**
- `idx_user_date`: Optimizes queries by user and date
- `idx_user_timestamp`: Optimizes queries by user and timestamp

#### 3. **daily_stats** Table (Data Warehouse)
Pre-aggregated daily statistics for fast queries.

```sql
CREATE TABLE daily_stats (
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
);
```

**Purpose:** Stores daily aggregated nutrition data for fast dashboard queries.

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `date`: Date of statistics
- `total_calories`: Total calories for the day
- `total_protein`: Total protein (grams)
- `total_carbs`: Total carbohydrates (grams)
- `total_fat`: Total fat (grams)
- `meal_count`: Number of meals logged
- `created_at`, `updated_at`: Timestamps

#### 4. **weekly_stats** Table (Data Warehouse)
Pre-aggregated weekly statistics for trend analysis.

```sql
CREATE TABLE weekly_stats (
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
);
```

**Purpose:** Stores weekly aggregated data for trend visualization.

**Fields:**
- `id`: Unique identifier
- `user_id`: Foreign key to users
- `week_start_date`: Start of week (Monday)
- `week_end_date`: End of week (Sunday)
- `total_calories`: Total calories for the week
- `avg_daily_calories`: Average daily calories
- `total_protein`, `total_carbs`, `total_fat`: Weekly totals
- `meal_count`: Total meals for the week

### Database Relationships

```
users (1) ────< (many) meal_logs
users (1) ────< (many) daily_stats
users (1) ────< (many) weekly_stats
```

**Cascade Deletion:** When a user is deleted, all related meal logs and statistics are automatically deleted.

### Data Flow

1. **User logs a meal** → Stored in `meal_logs` table
2. **ETL Process** → Aggregates data into `daily_stats`
3. **Weekly Aggregation** → Updates `weekly_stats` table
4. **Dashboard Queries** → Fast reads from warehouse tables

### Transaction Management

All database operations use transactions to ensure:
- Data consistency
- Atomic operations (all or nothing)
- Rollback on errors
- Data integrity

---

## 🎬 Application Demo Guide

### Prerequisites
- Live application: https://smartcal-nutrition-tracker-frontend.onrender.com
- Backend API: https://smartcal-nutrition-tracker.onrender.com

### Demo Flow

#### Step 1: User Registration
1. Open the application URL
2. Click "Sign Up" or "Create Account"
3. Fill in the form:
   - Username: `demo_user`
   - Email: `demo@example.com`
   - Password: `demo123`
   - Daily Calorie Target: `2000` (optional)
4. Click "Sign Up"
5. **Expected Result:** User is created and automatically logged in

#### Step 2: AI-Powered Meal Logging
1. Navigate to "Logger" tab (or "Add Meal")
2. Select "AI Text" mode
3. Enter natural language food description:
   ```
   100 grams of chicken and 100 grams of rice
   ```
4. Click "Parse" button
5. **Expected Result:**
   - AI parses the text
   - Multiple food items are identified
   - Nutrition values are calculated automatically
   - Items appear in the manual entry form
   - Total calories, protein, carbs, fat are displayed

**Try these examples:**
- `2 eggs and 50 grams of chicken`
- `200 grams of rice with 150 grams of chicken breast`
- `100g chicken, 100g rice, and 2 eggs`

#### Step 3: Manual Meal Entry
1. In "Logger" tab, select "Manual Entry" mode
2. Fill in food details:
   - Food Name: `Chicken Breast`
   - Calories: `165`
   - Protein: `31`
   - Carbs: `0`
   - Fat: `3.6`
3. Click "Add Item" to add more foods
4. Add second item:
   - Food Name: `White Rice`
   - Calories: `130`
   - Protein: `2.7`
   - Carbs: `28`
   - Fat: `0.3`
5. Select meal type: `Lunch`
6. Select date: Today's date
7. Click "Add Meal"
8. **Expected Result:**
   - Meal is saved to database
   - Success message appears
   - Form resets
   - Dashboard updates automatically

#### Step 4: View Dashboard
1. Navigate to "Dashboard" tab
2. **Expected Display:**
   - Daily calorie progress bar
   - Current calories vs. target
   - Macro breakdown (protein, carbs, fat)
   - Visual charts showing nutrition distribution
   - Weekly statistics

**Key Metrics:**
- Daily Progress: Shows percentage of calorie target reached
- Macro Breakdown: Pie chart or bar chart showing protein/carbs/fat
- Weekly Trends: Line chart showing daily calorie intake

#### Step 5: View Meal History
1. Navigate to "History" tab
2. **Expected Display:**
   - List of all meals in chronological order
   - Each meal shows:
     - Date and meal type
     - All food items with quantities
     - Total calories
     - Total macros (protein, carbs, fat)
3. Click "Edit" on any meal
4. **Expected Result:**
   - Edit modal opens
   - Can modify:
     - Date
     - Meal type
     - Food items
     - Quantities (with automatic recalculation)

#### Step 6: Edit Meal with Quantity Update
1. In History, click "Edit" on a meal
2. Find a food item (e.g., "Chicken 100g")
3. Change quantity from `100` to `150`
4. **Expected Result:**
   - Calories automatically recalculate (e.g., 165 → 247.5)
   - Protein, carbs, fat update proportionally
   - Quantity field shows exact value entered (150)
5. Click "Save Changes"
6. **Expected Result:**
   - Meal is updated in database
   - History refreshes with new values
   - Dashboard updates automatically

#### Step 7: Dietary Insights
1. Navigate to "Insights" tab
2. **Expected Display:**
   - AI-generated dietary recommendations
   - Analysis of eating patterns
   - Nutritional insights based on meal history
   - Personalized suggestions

#### Step 8: Update Settings
1. Navigate to "Settings" tab
2. Update Daily Calorie Target:
   - Change from `2000` to `2200`
3. Click "Update Profile"
4. **Expected Result:**
   - Profile is updated
   - Dashboard reflects new calorie target
   - Progress bar adjusts automatically

### Demo Scenarios

#### Scenario 1: Complete Meal Logging Workflow
1. Sign up → Login
2. Log breakfast: "2 eggs" (AI text)
3. Log lunch: "150g chicken and 100g rice" (AI text)
4. Log dinner: Manual entry with multiple items
5. View dashboard → See daily totals
6. View history → See all 3 meals
7. Edit lunch → Change chicken from 150g to 200g
8. Verify dashboard updates

#### Scenario 2: Multiple Food Items
1. Log meal: "100 grams of chicken, 100 grams of rice, and 2 eggs"
2. **Expected:** All 3 items parsed and displayed
3. View totals → Combined calories, protein, carbs, fat
4. Save meal
5. View history → All items shown with quantities

#### Scenario 3: Quantity-Based Editing
1. Log meal: "100 grams of chicken"
2. Edit meal → Change quantity to 150g
3. **Expected:** Calories update from ~165 to ~247.5
4. Change to 200g
5. **Expected:** Calories update to ~330
6. Save and verify

### Key Features to Highlight

1. **AI Text Parsing:**
   - Natural language input
   - Multiple items support
   - Automatic nutrition calculation

2. **Real-time Calculations:**
   - Automatic totals
   - Quantity-based updates
   - Macro breakdown

3. **Data Visualization:**
   - Progress bars
   - Charts and graphs
   - Trend analysis

4. **Data Persistence:**
   - All data saved to MySQL
   - Edit and delete functionality
   - Historical tracking

### Demo Tips

- **Show AI parsing:** Enter complex food descriptions
- **Show multiple items:** Log meals with 2-3 items
- **Show editing:** Change quantities and watch recalculation
- **Show visualization:** Point out charts and progress indicators
- **Show persistence:** Refresh page, data remains

---

## 📊 Database Architecture Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password_hash   │
│ role            │
│ calorie_target  │
└────────┬────────┘
         │
         │ 1:N
         │
    ┌────┴─────────────────────────────────────┐
    │                                            │
    ▼                                            ▼
┌─────────────────┐                    ┌─────────────────┐
│   meal_logs     │                    │  daily_stats    │
├─────────────────┤                    ├─────────────────┤
│ id (PK)         │                    │ id (PK)         │
│ user_id (FK)    │                    │ user_id (FK)    │
│ date            │                    │ date            │
│ meal_type       │                    │ total_calories  │
│ food_items(JSON)│                    │ total_protein   │
│ total_calories  │                    │ total_carbs     │
│ image_url       │                    │ total_fat       │
│ notes           │                    │ meal_count      │
│ timestamp       │                    └─────────────────┘
└─────────────────┘
         │
         │ ETL Process
         │
         ▼
┌─────────────────┐
│ weekly_stats    │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ week_start      │
│ week_end        │
│ total_calories   │
│ avg_daily_cal   │
│ total_protein   │
│ total_carbs     │
│ total_fat       │
│ meal_count      │
└─────────────────┘
```

### Data Flow Architecture

```
User Input → Frontend → API → Backend → MySQL
                                    ↓
                            Transaction Management
                                    ↓
                            Data Warehouse (ETL)
                                    ↓
                            Aggregated Stats
                                    ↓
                            Dashboard Queries
```

---

## 🔑 Key Technical Features

### 1. Transaction Management
- All meal creation uses database transactions
- Ensures data consistency
- Automatic rollback on errors

### 2. Data Warehousing
- Pre-aggregated daily statistics
- Pre-aggregated weekly statistics
- Fast dashboard queries
- Reduced database load

### 3. JSON Storage
- Food items stored as JSON in `meal_logs`
- Flexible schema for multiple items
- Easy to query and update

### 4. Indexing Strategy
- Indexes on `(user_id, date)` for fast queries
- Indexes on `(user_id, timestamp)` for sorting
- Optimized for common query patterns

### 5. Cascade Deletion
- Deleting a user automatically deletes all related data
- Maintains referential integrity
- Prevents orphaned records

---

## 📝 Summary

**Application:** Full-stack nutrition tracking with AI-powered food recognition

**Database:** MySQL with 4 tables (users, meal_logs, daily_stats, weekly_stats)

**Key Features:**
- AI text parsing
- Multiple food items per meal
- Real-time calculations
- Data visualization
- Edit with quantity updates
- Data warehousing for performance

**Deployment:**
- Frontend: Render Static Site
- Backend: Render Web Service
- Database: Cloud MySQL

This application demonstrates modern full-stack development with AI integration, proper database design, and production deployment.

