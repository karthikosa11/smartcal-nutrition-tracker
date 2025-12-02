# Entity Relationship (ER) Diagram

## Visual ER Diagram

```
                    ┌─────────────────────┐
                    │       users          │
                    ├─────────────────────┤
                    │ PK  id               │
                    │     username (UK)    │
                    │     email (UK)        │
                    │     password_hash    │
                    │     role             │
                    │     calorie_target   │
                    │     created_at       │
                    │     updated_at       │
                    └──────────┬───────────┘
                               │
                    ┌──────────┼───────────┐
                    │          │           │
                    │ 1        │ 1         │ 1
                    │          │           │
                    │ N        │ N         │ N
                    │          │           │
        ┌───────────▼───┐  ┌───▼──────────┐  ┌───────────▼──────┐
        │  meal_logs    │  │ daily_stats  │  │  weekly_stats    │
        ├───────────────┤  ├──────────────┤  ├──────────────────┤
        │ PK  id        │  │ PK  id       │  │ PK  id           │
        │ FK  user_id   │  │ FK  user_id  │  │ FK  user_id      │
        │     date      │  │     date     │  │     week_start   │
        │     meal_type │  │     calories │  │     week_end     │
        │     food_items│  │     protein  │  │     total_cal    │
        │     calories  │  │     carbs     │  │     avg_daily    │
        │     image_url │  │     fat      │  │     protein      │
        │     notes     │  │     meal_cnt │  │     carbs        │
        │     timestamp │  │     created  │  │     fat          │
        │     created   │  │     updated  │  │     meal_count   │
        │     updated   │  │ UK (u_id,dt) │  │     created      │
        └───────────────┘  └──────────────┘  │     updated      │
                                             │ UK (u_id,week)   │
                                             └──────────────────┘
```

## Detailed ER Diagram with Attributes

### Entity: users
```
┌─────────────────────────────────────┐
│            users                    │
├─────────────────────────────────────┤
│ PK  id: VARCHAR(36)                 │
│     username: VARCHAR(50) [UNIQUE]   │
│     email: VARCHAR(100) [UNIQUE]     │
│     password_hash: VARCHAR(255)      │
│     role: ENUM('USER','ADMIN')      │
│     daily_calorie_target: INT        │
│     created_at: TIMESTAMP            │
│     updated_at: TIMESTAMP            │
└─────────────────────────────────────┘
```

### Entity: meal_logs
```
┌─────────────────────────────────────┐
│          meal_logs                  │
├─────────────────────────────────────┤
│ PK  id: VARCHAR(36)                 │
│ FK  user_id: VARCHAR(36)            │
│     date: DATE                       │
│     meal_type: ENUM                 │
│     food_items: JSON                 │
│     total_calories: INT              │
│     image_url: TEXT                  │
│     notes: TEXT                      │
│     timestamp: BIGINT                │
│     created_at: TIMESTAMP            │
│     updated_at: TIMESTAMP            │
│                                     │
│ INDEX idx_user_date                 │
│ INDEX idx_user_timestamp            │
└─────────────────────────────────────┘
         │
         │ References
         │
         └───► users.id
```

### Entity: daily_stats
```
┌─────────────────────────────────────┐
│        daily_stats                  │
├─────────────────────────────────────┤
│ PK  id: VARCHAR(36)                 │
│ FK  user_id: VARCHAR(36)            │
│     date: DATE                       │
│     total_calories: INT              │
│     total_protein: DECIMAL(10,2)    │
│     total_carbs: DECIMAL(10,2)      │
│     total_fat: DECIMAL(10,2)        │
│     meal_count: INT                  │
│     created_at: TIMESTAMP            │
│     updated_at: TIMESTAMP            │
│                                     │
│ UK  (user_id, date)                 │
│ INDEX idx_user_date                 │
└─────────────────────────────────────┘
         │
         │ References
         │
         └───► users.id
```

### Entity: weekly_stats
```
┌─────────────────────────────────────┐
│       weekly_stats                  │
├─────────────────────────────────────┤
│ PK  id: VARCHAR(36)                 │
│ FK  user_id: VARCHAR(36)            │
│     week_start_date: DATE            │
│     week_end_date: DATE              │
│     total_calories: INT              │
│     avg_daily_calories: DECIMAL     │
│     total_protein: DECIMAL(10,2)    │
│     total_carbs: DECIMAL(10,2)      │
│     total_fat: DECIMAL(10,2)        │
│     meal_count: INT                  │
│     created_at: TIMESTAMP            │
│     updated_at: TIMESTAMP            │
│                                     │
│ UK  (user_id, week_start_date)      │
│ INDEX idx_user_week                 │
└─────────────────────────────────────┘
         │
         │ References
         │
         └───► users.id
```

## Relationship Details

### Relationship 1: users → meal_logs
- **Type:** One-to-Many (1:N)
- **Cardinality:** One user can have many meal logs
- **Foreign Key:** `meal_logs.user_id` → `users.id`
- **Cascade:** ON DELETE CASCADE
- **Description:** Each meal log belongs to exactly one user

### Relationship 2: users → daily_stats
- **Type:** One-to-Many (1:N)
- **Cardinality:** One user can have many daily stat records (one per day)
- **Foreign Key:** `daily_stats.user_id` → `users.id`
- **Cascade:** ON DELETE CASCADE
- **Unique Constraint:** One record per user per day
- **Description:** Each daily stat belongs to exactly one user for a specific date

### Relationship 3: users → weekly_stats
- **Type:** One-to-Many (1:N)
- **Cardinality:** One user can have many weekly stat records (one per week)
- **Foreign Key:** `weekly_stats.user_id` → `users.id`
- **Cascade:** ON DELETE CASCADE
- **Unique Constraint:** One record per user per week
- **Description:** Each weekly stat belongs to exactly one user for a specific week

### Relationship 4: meal_logs → daily_stats (ETL)
- **Type:** Aggregation (N:1)
- **Cardinality:** Many meal logs aggregate into one daily stat
- **Relationship:** Not a direct foreign key, but logical relationship
- **Process:** ETL (Extract, Transform, Load) process aggregates meal_logs into daily_stats
- **Description:** Daily stats are calculated from meal logs

### Relationship 5: daily_stats → weekly_stats (ETL)
- **Type:** Aggregation (N:1)
- **Cardinality:** Many daily stats aggregate into one weekly stat
- **Relationship:** Not a direct foreign key, but logical relationship
- **Process:** ETL process aggregates daily_stats into weekly_stats
- **Description:** Weekly stats are calculated from daily stats

## Complete ER Diagram Text Representation

```
                    users
                    ┌────┐
                    │ PK │ id
                    │    │ username (UK)
                    │    │ email (UK)
                    │    │ password_hash
                    │    │ role
                    │    │ calorie_target
                    └─┬──┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        │ 1          │ 1            │ 1
        │             │             │
        │ N          │ N            │ N
        │             │             │
        ▼             ▼             ▼
    meal_logs    daily_stats   weekly_stats
    ┌────┐       ┌────┐        ┌────┐
    │ PK │ id    │ PK │ id      │ PK │ id
    │ FK │ user  │ FK │ user    │ FK │ user
    │    │ date  │    │ date    │    │ week_start
    │    │ type │    │ calories│    │ week_end
    │    │ items│    │ protein │    │ total_cal
    │    │ cal  │    │ carbs   │    │ avg_daily
    │    │ img  │    │ fat     │    │ protein
    │    │ notes│    │ count   │    │ carbs
    │    │ time │    │         │    │ fat
    └────┘       └────┘        └────┘
```

## Key Constraints

### Primary Keys (PK)
- All tables use UUID (VARCHAR(36)) as primary key
- Ensures uniqueness across distributed systems

### Foreign Keys (FK)
- All child tables reference `users.id`
- Cascade delete ensures data integrity

### Unique Constraints (UK)
- `users.username` - No duplicate usernames
- `users.email` - No duplicate emails
- `daily_stats(user_id, date)` - One record per user per day
- `weekly_stats(user_id, week_start_date)` - One record per user per week

### Indexes
- `meal_logs`: idx_user_date, idx_user_timestamp
- `daily_stats`: idx_user_date
- `weekly_stats`: idx_user_week
- Optimize common query patterns

## Data Flow

```
User Action → meal_logs (INSERT)
                    ↓
            ETL Process (Aggregation)
                    ↓
            daily_stats (INSERT/UPDATE)
                    ↓
            ETL Process (Weekly Aggregation)
                    ↓
            weekly_stats (INSERT/UPDATE)
```

This ER diagram represents a normalized database design with proper relationships, constraints, and data flow.

