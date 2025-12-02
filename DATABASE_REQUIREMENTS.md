# Database Requirements and Design Document

## 1. Purpose of the Database

### Why is the Database Needed?

The database is the **core data persistence layer** for SmartCal AI Nutrition Tracker. It serves multiple critical purposes:

1. **User Account Management**
   - Store user credentials securely (hashed passwords)
   - Maintain user profiles and preferences
   - Track user-specific settings (daily calorie targets)

2. **Meal Data Storage**
   - Persist all meal logs entered by users
   - Store multiple food items per meal
   - Maintain historical meal records for analysis

3. **Nutritional Tracking**
   - Calculate and store daily nutrition totals
   - Track progress toward calorie goals
   - Maintain macro nutrient breakdowns (protein, carbs, fat)

4. **Analytics and Reporting**
   - Pre-aggregate daily statistics for fast dashboard queries
   - Store weekly trends for visualization
   - Enable dietary pattern analysis

5. **Data Integrity**
   - Ensure data consistency through transactions
   - Maintain referential integrity with foreign keys
   - Support cascade deletion for data cleanup

### Why It's Essential

Without the database:
- ❌ No user accounts or authentication
- ❌ No meal history persistence
- ❌ No progress tracking
- ❌ No data analysis capabilities
- ❌ No multi-user support

**The database enables the application to be a persistent, multi-user system rather than a temporary single-session tool.**

---

## 2. What Should the Database Do?

### Core Functions

1. **Store User Information**
   - User credentials (username, email, hashed password)
   - User preferences (daily calorie target)
   - User roles (USER, ADMIN)
   - Account creation and update timestamps

2. **Store Meal Logs**
   - Individual meal entries with date and meal type
   - Multiple food items per meal (stored as JSON)
   - Total calories and macros per meal
   - Optional notes and images
   - Timestamps for chronological ordering

3. **Aggregate Statistics**
   - Daily nutrition totals per user
   - Weekly nutrition trends
   - Meal counts and averages
   - Fast query support for dashboards

4. **Support Operations**
   - User authentication (verify credentials)
   - Meal CRUD operations (Create, Read, Update, Delete)
   - Statistical queries (daily, weekly, trends)
   - Data relationships (user → meals → stats)

5. **Ensure Data Quality**
   - Enforce data constraints (unique usernames, emails)
   - Maintain referential integrity
   - Support transaction management
   - Cascade deletions appropriately

### Performance Requirements

- **Fast Queries:** Dashboard queries should be < 100ms
- **Scalability:** Support multiple concurrent users
- **Reliability:** Data consistency guaranteed through transactions
- **Efficiency:** Pre-aggregated data for common queries

---

## 3. Users and Their Needs

### User Types

#### 1. **Regular Users (Primary Users)**
**Who they are:**
- Individuals tracking their daily nutrition
- Health-conscious people monitoring calorie intake
- Fitness enthusiasts tracking macros
- People with dietary goals (weight loss, muscle gain, maintenance)

**Information they need:**
- Their meal history
- Daily calorie progress
- Macro breakdown (protein, carbs, fat)
- Weekly trends and patterns
- Dietary insights and recommendations

**Functions they need:**
- ✅ Create account and login
- ✅ Log meals (AI text or manual entry)
- ✅ View dashboard with progress
- ✅ View meal history
- ✅ Edit meals (update quantities, items)
- ✅ Delete meals
- ✅ Update profile and calorie targets
- ✅ View dietary insights

**Data they input:**
- Username, email, password (registration)
- Food descriptions (AI text)
- Food items with nutrition values (manual entry)
- Meal type, date
- Quantity updates (editing)
- Profile updates (calorie target)

#### 2. **Administrators (Future Role)**
**Who they are:**
- System administrators
- Support staff
- Data analysts

**Information they need:**
- All user accounts
- System-wide statistics
- User activity data
- Database health metrics

**Functions they need:**
- ✅ View all users
- ✅ Manage user accounts
- ✅ View system statistics
- ✅ Monitor database performance

**Note:** Admin functionality is defined in schema but not fully implemented in current version.

### User Workflows

**Workflow 1: New User Registration**
1. User enters: username, email, password, calorie target
2. Database stores: hashed password, user profile
3. User can immediately start logging meals

**Workflow 2: Daily Meal Logging**
1. User logs breakfast: "2 eggs" (AI text)
2. Database stores: meal log with parsed food items
3. Database updates: daily_stats aggregation
4. User views dashboard: sees updated progress

**Workflow 3: Meal Editing**
1. User views history: sees "100g chicken"
2. User edits: changes to "150g chicken"
3. Database updates: meal_logs table
4. Database recalculates: daily_stats
5. User sees: updated totals on dashboard

**Workflow 4: Progress Tracking**
1. User views dashboard
2. Database queries: daily_stats for current day
3. Database queries: weekly_stats for trends
4. User sees: progress bars, charts, insights

---

## 4. Input Data Available to the Database

### Data Sources

#### 1. **User Registration Data**
```
Input:
- username: string (e.g., "john_doe")
- email: string (e.g., "john@example.com")
- password: string (plain text, hashed before storage)
- dailyCalorieTarget: number (e.g., 2000)

Stored in: users table
```

#### 2. **AI-Parsed Food Data**
```
Input from AI:
- Food description: "100 grams of chicken and 2 eggs"
- Parsed result:
  [
    { name: "Chicken 100g", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "2 Eggs", calories: 140, protein: 12, carbs: 1, fat: 10 }
  ]

Stored in: meal_logs.food_items (JSON)
```

#### 3. **Manual Food Entry Data**
```
Input:
- Food items array:
  [
    { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
    { name: "White Rice", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 }
  ]
- Meal type: "Lunch"
- Date: "2024-01-15"
- Notes: optional string

Stored in: meal_logs table
```

#### 4. **Meal Update Data**
```
Input:
- Meal ID: "uuid-here"
- Updated food items with new quantities
- Updated date or meal type
- Updated notes

Stored in: meal_logs table (UPDATE operation)
```

#### 5. **Profile Update Data**
```
Input:
- Updated username (optional)
- Updated email (optional)
- Updated dailyCalorieTarget (optional)

Stored in: users table (UPDATE operation)
```

### Data Flow

```
User Input → Frontend → API → Backend → Database
                                    ↓
                            Validation & Processing
                                    ↓
                            Transaction Management
                                    ↓
                            Database Storage
                                    ↓
                            Aggregation (ETL)
                                    ↓
                            Warehouse Tables
```

---

## 5. Information Stored in the Database

### Table 1: users

**Purpose:** Store user account information

**Data Stored:**
- `id` (VARCHAR(36)): Unique user identifier (UUID)
- `username` (VARCHAR(50)): Unique username for login
- `email` (VARCHAR(100)): Unique email address
- `password_hash` (VARCHAR(255)): Bcrypt hashed password (never store plain text)
- `role` (ENUM): User role ('USER' or 'ADMIN')
- `daily_calorie_target` (INT): User's daily calorie goal (default: 2000)
- `created_at` (TIMESTAMP): Account creation time
- `updated_at` (TIMESTAMP): Last profile update time

**Example Record:**
```
id: "550e8400-e29b-41d4-a716-446655440000"
username: "john_doe"
email: "john@example.com"
password_hash: "$2a$10$N9qo8uLOickgx2ZMRZoMye..."
role: "USER"
daily_calorie_target: 2000
created_at: "2024-01-15 10:30:00"
updated_at: "2024-01-15 10:30:00"
```

### Table 2: meal_logs

**Purpose:** Store individual meal entries

**Data Stored:**
- `id` (VARCHAR(36)): Unique meal identifier (UUID)
- `user_id` (VARCHAR(36)): Foreign key to users table
- `date` (DATE): Meal date (YYYY-MM-DD format)
- `meal_type` (ENUM): Type of meal ('Breakfast', 'Lunch', 'Dinner', 'Snack')
- `food_items` (JSON): Array of food items with nutrition
- `total_calories` (INT): Sum of calories from all food items
- `image_url` (TEXT): Optional image URL (for future image recognition)
- `notes` (TEXT): Optional user notes
- `timestamp` (BIGINT): Unix timestamp for sorting
- `created_at` (TIMESTAMP): Entry creation time
- `updated_at` (TIMESTAMP): Last update time

**Example Record:**
```
id: "660e8400-e29b-41d4-a716-446655440001"
user_id: "550e8400-e29b-41d4-a716-446655440000"
date: "2024-01-15"
meal_type: "Lunch"
food_items: [
  {
    "name": "Chicken 100g",
    "calories": 165,
    "protein": 31,
    "carbs": 0,
    "fat": 3.6
  },
  {
    "name": "White Rice 100g",
    "calories": 130,
    "protein": 2.7,
    "carbs": 28,
    "fat": 0.3
  }
]
total_calories: 295
image_url: null
notes: "Delicious lunch"
timestamp: 1705320000000
created_at: "2024-01-15 12:00:00"
updated_at: "2024-01-15 12:00:00"
```

### Table 3: daily_stats (Data Warehouse)

**Purpose:** Pre-aggregated daily statistics for fast queries

**Data Stored:**
- `id` (VARCHAR(36)): Unique record identifier
- `user_id` (VARCHAR(36)): Foreign key to users
- `date` (DATE): Date of statistics
- `total_calories` (INT): Total calories for the day
- `total_protein` (DECIMAL(10,2)): Total protein in grams
- `total_carbs` (DECIMAL(10,2)): Total carbohydrates in grams
- `total_fat` (DECIMAL(10,2)): Total fat in grams
- `meal_count` (INT): Number of meals logged that day
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time

**Example Record:**
```
id: "770e8400-e29b-41d4-a716-446655440002"
user_id: "550e8400-e29b-41d4-a716-446655440000"
date: "2024-01-15"
total_calories: 1850
total_protein: 125.5
total_carbs: 180.3
total_fat: 45.2
meal_count: 3
created_at: "2024-01-15 23:59:59"
updated_at: "2024-01-15 23:59:59"
```

### Table 4: weekly_stats (Data Warehouse)

**Purpose:** Pre-aggregated weekly statistics for trend analysis

**Data Stored:**
- `id` (VARCHAR(36)): Unique record identifier
- `user_id` (VARCHAR(36)): Foreign key to users
- `week_start_date` (DATE): Monday of the week
- `week_end_date` (DATE): Sunday of the week
- `total_calories` (INT): Total calories for the week
- `avg_daily_calories` (DECIMAL(10,2)): Average daily calories
- `total_protein` (DECIMAL(10,2)): Total protein for the week
- `total_carbs` (DECIMAL(10,2)): Total carbohydrates for the week
- `total_fat` (DECIMAL(10,2)): Total fat for the week
- `meal_count` (INT): Total meals for the week
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time

**Example Record:**
```
id: "880e8400-e29b-41d4-a716-446655440003"
user_id: "550e8400-e29b-41d4-a716-446655440000"
week_start_date: "2024-01-15"
week_end_date: "2024-01-21"
total_calories: 12950
avg_daily_calories: 1850.00
total_protein: 878.5
total_carbs: 1262.1
total_fat: 316.4
meal_count: 21
created_at: "2024-01-21 23:59:59"
updated_at: "2024-01-21 23:59:59"
```

### Data Relationships

- **One-to-Many:** One user can have many meal logs
- **One-to-Many:** One user can have many daily stats
- **One-to-Many:** One user can have many weekly stats
- **Cascade Delete:** Deleting a user deletes all related data

---

## 6. ER Diagram

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                        users                             │
├─────────────────────────────────────────────────────────┤
│ PK │ id (VARCHAR(36))                                    │
│    │ username (VARCHAR(50), UNIQUE)                     │
│    │ email (VARCHAR(100), UNIQUE)                        │
│    │ password_hash (VARCHAR(255))                       │
│    │ role (ENUM: 'USER', 'ADMIN')                       │
│    │ daily_calorie_target (INT)                          │
│    │ created_at (TIMESTAMP)                             │
│    │ updated_at (TIMESTAMP)                             │
└────┬────────────────────────────────────────────────────┘
     │
     │ 1
     │
     │ N
     ├─────────────────────────────────────────────────────┐
     │                                                      │
     ▼                                                      ▼
┌──────────────────────────────────┐    ┌──────────────────────────────────┐
│          meal_logs                │    │        daily_stats                │
├──────────────────────────────────┤    ├──────────────────────────────────┤
│ PK │ id (VARCHAR(36))             │    │ PK │ id (VARCHAR(36))             │
│ FK │ user_id (VARCHAR(36))        │    │ FK │ user_id (VARCHAR(36))        │
│    │ date (DATE)                  │    │    │ date (DATE)                  │
│    │ meal_type (ENUM)             │    │    │ total_calories (INT)         │
│    │ food_items (JSON)            │    │    │ total_protein (DECIMAL)      │
│    │ total_calories (INT)         │    │    │ total_carbs (DECIMAL)        │
│    │ image_url (TEXT)             │    │    │ total_fat (DECIMAL)          │
│    │ notes (TEXT)                 │    │    │ meal_count (INT)             │
│    │ timestamp (BIGINT)           │    │    │ created_at (TIMESTAMP)       │
│    │ created_at (TIMESTAMP)       │    │    │ updated_at (TIMESTAMP)       │
│    │ updated_at (TIMESTAMP)       │    │ UK │ (user_id, date)              │
└──────────────────────────────────┘    └──────────────────────────────────┘
     │
     │ ETL Process
     │ (Extract, Transform, Load)
     │
     ▼
┌──────────────────────────────────┐
│       weekly_stats               │
├──────────────────────────────────┤
│ PK │ id (VARCHAR(36))             │
│ FK │ user_id (VARCHAR(36))        │
│    │ week_start_date (DATE)       │
│    │ week_end_date (DATE)         │
│    │ total_calories (INT)         │
│    │ avg_daily_calories (DECIMAL) │
│    │ total_protein (DECIMAL)      │
│    │ total_carbs (DECIMAL)        │
│    │ total_fat (DECIMAL)          │
│    │ meal_count (INT)             │
│    │ created_at (TIMESTAMP)      │
│    │ updated_at (TIMESTAMP)       │
│ UK │ (user_id, week_start_date)   │
└──────────────────────────────────┘
```

### Relationship Details

**users → meal_logs (1:N)**
- One user can have many meal logs
- Foreign key: `meal_logs.user_id` references `users.id`
- Cascade delete: Deleting user deletes all their meals

**users → daily_stats (1:N)**
- One user can have many daily stat records (one per day)
- Foreign key: `daily_stats.user_id` references `users.id`
- Unique constraint: One record per user per day
- Cascade delete: Deleting user deletes all their stats

**users → weekly_stats (1:N)**
- One user can have many weekly stat records (one per week)
- Foreign key: `weekly_stats.user_id` references `users.id`
- Unique constraint: One record per user per week
- Cascade delete: Deleting user deletes all their weekly stats

**meal_logs → daily_stats (N:1 via ETL)**
- Multiple meal logs aggregate into one daily stat
- ETL process calculates totals from meal_logs
- Not a direct foreign key relationship

**daily_stats → weekly_stats (N:1 via ETL)**
- Multiple daily stats aggregate into one weekly stat
- ETL process calculates weekly totals from daily_stats
- Not a direct foreign key relationship

### Cardinality

- **users : meal_logs** = 1 : N (One-to-Many)
- **users : daily_stats** = 1 : N (One-to-Many)
- **users : weekly_stats** = 1 : N (One-to-Many)

### Constraints

- **Primary Keys:** All tables have UUID primary keys
- **Foreign Keys:** All child tables reference users.id
- **Unique Constraints:**
  - users.username (unique)
  - users.email (unique)
  - daily_stats (user_id, date) - one record per user per day
  - weekly_stats (user_id, week_start_date) - one record per user per week
- **Cascade Delete:** All foreign keys have ON DELETE CASCADE

---

## 7. Team Roles

### Project Structure

This project was developed as a **solo project** or can be adapted for team collaboration. Below are suggested roles if working in a team:

### Suggested Team Roles (If Applicable)

#### Role 1: **Frontend Developer**
**Responsibilities:**
- React component development
- UI/UX design and implementation
- State management
- API integration
- User interface testing

**Technologies:**
- React, TypeScript, Tailwind CSS
- Recharts for visualization
- Frontend services (API calls)

#### Role 2: **Backend Developer**
**Responsibilities:**
- Express.js API development
- Database schema design
- API endpoint implementation
- Authentication and authorization
- Error handling

**Technologies:**
- Express.js, TypeScript
- MySQL database
- JWT authentication
- Transaction management

#### Role 3: **Database Administrator / Data Engineer**
**Responsibilities:**
- Database schema design
- Query optimization
- Data warehousing implementation
- ETL process development
- Database performance tuning

**Technologies:**
- MySQL
- SQL query optimization
- Data aggregation
- Index design

#### Role 4: **AI Integration Specialist**
**Responsibilities:**
- Google Gemini AI integration
- Food parsing algorithm
- Fallback parser development
- AI prompt engineering
- Error handling for AI failures

**Technologies:**
- Google Gemini API
- Natural language processing
- Food database management

#### Role 5: **DevOps / Deployment Specialist**
**Responsibilities:**
- Deployment configuration
- Environment variable management
- CI/CD setup
- Server configuration
- Monitoring and logging

**Technologies:**
- Render platform
- Environment configuration
- Deployment automation

### Current Project Status

**Note:** This project appears to be developed individually. If working solo, one person handles all roles. If in a team, roles can be divided as suggested above.

### Collaboration Areas

**Shared Responsibilities:**
- Code reviews
- Testing and debugging
- Documentation
- Project planning
- Feature discussions

---

## Summary

### Database Purpose
- Store user accounts and authentication data
- Persist meal logs and nutrition data
- Enable multi-user support and data persistence
- Support analytics and reporting

### Database Functions
- User management (CRUD operations)
- Meal logging (Create, Read, Update, Delete)
- Statistical aggregation (daily, weekly)
- Data integrity (transactions, constraints)

### Users
- **Primary:** Regular users tracking nutrition
- **Secondary:** Administrators (future)

### Input Data
- User registration data
- AI-parsed food data
- Manual food entries
- Meal updates
- Profile updates

### Stored Information
- User accounts (users table)
- Meal logs with JSON food items (meal_logs table)
- Daily aggregated stats (daily_stats table)
- Weekly aggregated stats (weekly_stats table)

### ER Diagram
- 4 main tables with clear relationships
- 1:N relationships (users to all other tables)
- Foreign keys with cascade delete
- Unique constraints for data integrity

### Team Roles
- Can be solo project or team-based
- Suggested roles: Frontend, Backend, Database, AI, DevOps
- Clear division of responsibilities

---

This database design supports a scalable, multi-user nutrition tracking application with proper data relationships, performance optimization, and data integrity.

