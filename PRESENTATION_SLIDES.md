# SmartCal AI Nutrition Tracker - PowerPoint Presentation

## Slide-by-Slide Content

---

### Slide 1: Title Slide
**Title:** SmartCal AI Nutrition Tracker
**Subtitle:** AI-Powered Full-Stack Nutrition Tracking Application
**Your Name:** [Your Name]
**Date:** [Date]
**Course/Project:** [Course Name]

---

### Slide 2: Agenda
**Title:** Presentation Agenda

1. Project Overview
2. Technology Stack
3. Key Features
4. Database Architecture
5. Application Demo
6. Technical Highlights
7. Deployment
8. Conclusion

---

### Slide 3: Project Overview
**Title:** What is SmartCal?

**Content:**
- Full-stack web application for nutrition tracking
- AI-powered food recognition using Google Gemini
- Natural language meal logging
- Real-time nutrition calculations
- Data visualization and insights
- Production-ready deployment on Render

**Key Points:**
- Solves real-world problem: Easy nutrition tracking
- Modern tech stack: React, Express.js, MySQL
- AI Integration: Google Gemini for food parsing

---

### Slide 4: Technology Stack
**Title:** Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- Tailwind CSS (Styling)
- Recharts (Data Visualization)
- Google Gemini AI

**Backend:**
- Express.js + TypeScript
- MySQL Database
- JWT Authentication
- Bcrypt (Password Hashing)

**Deployment:**
- Render (Frontend: Static Site, Backend: Web Service)
- Cloud MySQL (Railway/PlanetScale)

---

### Slide 5: Key Features - Part 1
**Title:** Key Features

**1. User Authentication**
- Secure registration and login
- JWT token-based sessions
- Password hashing with bcrypt
- Customizable calorie targets

**2. AI-Powered Meal Logging**
- Natural language input
- Multiple food items in single input
- Automatic nutrition calculation
- Example: "100g chicken and 2 eggs"

---

### Slide 6: Key Features - Part 2
**Title:** Key Features (Continued)

**3. Manual Meal Entry**
- Add multiple food items
- Real-time total calculation
- Support for grams and count-based items

**4. Dashboard & Visualization**
- Daily calorie progress
- Macro breakdown charts
- Weekly statistics
- Interactive data visualization

---

### Slide 7: Key Features - Part 3
**Title:** Key Features (Continued)

**5. Meal History**
- Chronological meal display
- Edit meals with quantity updates
- Automatic nutrition recalculation
- Delete functionality

**6. Dietary Insights**
- AI-generated recommendations
- Pattern analysis
- Personalized suggestions

**7. Settings Management**
- Update calorie targets
- Profile management
- Real-time updates

---

### Slide 8: Database Architecture
**Title:** Database Schema

**4 Main Tables:**

1. **users**
   - User accounts and preferences
   - Daily calorie targets
   - Authentication data

2. **meal_logs**
   - Individual meal entries
   - JSON storage for food items
   - Multiple items per meal

3. **daily_stats** (Warehouse)
   - Pre-aggregated daily data
   - Fast dashboard queries

4. **weekly_stats** (Warehouse)
   - Pre-aggregated weekly data
   - Trend analysis

---

### Slide 9: Database Schema Details
**Title:** Database Tables Structure

**users Table:**
- id, username, email, password_hash
- role, daily_calorie_target
- created_at, updated_at

**meal_logs Table:**
- id, user_id, date, meal_type
- food_items (JSON), total_calories
- image_url, notes, timestamp
- Foreign key to users

**Warehouse Tables:**
- daily_stats: Aggregated daily nutrition
- weekly_stats: Aggregated weekly trends

---

### Slide 10: Database Relationships
**Title:** Database Architecture

```
users (1) ────< (many) meal_logs
users (1) ────< (many) daily_stats
users (1) ────< (many) weekly_stats
```

**Key Features:**
- Cascade deletion (user deletion removes all data)
- Indexes for fast queries
- JSON storage for flexibility
- Transaction management for consistency

---

### Slide 11: Technical Highlights
**Title:** Technical Implementation

**1. Transaction Management**
- All operations use database transactions
- Ensures data consistency
- Automatic rollback on errors

**2. Data Warehousing**
- Pre-aggregated statistics
- Fast dashboard queries
- Reduced database load

**3. JSON Storage**
- Flexible food items storage
- Multiple items per meal
- Easy to query and update

---

### Slide 12: API Architecture
**Title:** RESTful API Design

**Endpoints:**
- `/api/auth` - Authentication (signup, login, verify, profile)
- `/api/meals` - Meal management (CRUD operations)
- `/api/stats` - Statistics (daily, weekly)

**Features:**
- JWT authentication middleware
- Error handling
- CORS configuration
- Transaction support

---

### Slide 13: AI Integration
**Title:** Google Gemini AI Integration

**Capabilities:**
- Natural language food parsing
- Multiple food item recognition
- Automatic nutrition calculation
- Fallback parser when AI unavailable

**Example Input:**
"100 grams of chicken and 100 grams of rice"

**Output:**
- Parsed food items
- Calculated calories, protein, carbs, fat
- Combined totals

---

### Slide 14: Deployment Architecture
**Title:** Production Deployment

**Frontend:**
- Render Static Site
- URL: smartcal-nutrition-tracker-frontend.onrender.com
- Built with Vite
- Environment variables for API URL

**Backend:**
- Render Web Service
- URL: smartcal-nutrition-tracker.onrender.com
- Express.js server
- Environment variables for database

**Database:**
- Cloud MySQL (Railway/PlanetScale)
- Accessible from Render
- Automatic table initialization

---

### Slide 15: Demo - User Registration
**Title:** Application Demo

**Step 1: User Registration**
- Sign up with username, email, password
- Set daily calorie target
- Automatic login after registration
- JWT token stored securely

**Live Demo:**
- Show signup process
- Demonstrate secure authentication

---

### Slide 16: Demo - AI Meal Logging
**Title:** AI-Powered Meal Logging

**Step 2: AI Text Parsing**
- Enter: "100 grams of chicken and 100 grams of rice"
- AI parses multiple food items
- Automatic nutrition calculation
- Combined totals displayed

**Features Demonstrated:**
- Natural language processing
- Multiple item handling
- Real-time calculation

---

### Slide 17: Demo - Dashboard
**Title:** Dashboard & Visualization

**Step 3: View Dashboard**
- Daily calorie progress bar
- Macro breakdown (protein, carbs, fat)
- Interactive charts
- Weekly statistics

**Data Source:**
- Pre-aggregated warehouse tables
- Fast query performance
- Real-time updates

---

### Slide 18: Demo - Edit Meal
**Title:** Quantity-Based Editing

**Step 4: Edit Meal**
- Change quantity: 100g → 150g
- Automatic nutrition recalculation
- Calories: 165 → 247.5
- All macros update proportionally

**Key Feature:**
- Exact quantity preservation
- Real-time recalculation
- Supports grams and count-based items

---

### Slide 19: Challenges & Solutions
**Title:** Challenges Overcome

**1. Multiple Food Items Parsing**
- Solution: Enhanced AI prompt and fallback parser

**2. Quantity-Based Updates**
- Solution: Separate input state and recalculation logic

**3. Database Connection on Render**
- Solution: Cloud MySQL setup with proper configuration

**4. CORS Issues**
- Solution: Proper CORS configuration for production

**5. TypeScript Errors**
- Solution: Proper type definitions and assertions

---

### Slide 20: Future Enhancements
**Title:** Future Improvements

**Potential Features:**
- Image recognition for food photos
- Mobile app version
- Social features (sharing, challenges)
- Meal planning and recipes
- Barcode scanning
- Integration with fitness trackers
- Export data functionality

---

### Slide 21: Project Statistics
**Title:** Project Metrics

**Code:**
- Frontend: ~2,000+ lines of TypeScript/React
- Backend: ~1,500+ lines of TypeScript/Express
- Total: ~3,500+ lines of code

**Features:**
- 7 major features
- 4 database tables
- 15+ API endpoints
- Full CRUD operations

**Technologies:**
- 10+ npm packages
- 3 deployment services
- Production-ready

---

### Slide 22: Conclusion
**Title:** Summary

**What We Built:**
- Complete full-stack application
- AI-powered nutrition tracking
- Production deployment
- Modern tech stack

**Key Achievements:**
- ✅ AI integration working
- ✅ Real-time calculations
- ✅ Data visualization
- ✅ Transaction management
- ✅ Data warehousing
- ✅ Production deployment

**Impact:**
- Solves real-world problem
- User-friendly interface
- Scalable architecture

---

### Slide 23: Thank You
**Title:** Thank You!

**Questions?**

**Live Application:**
- Frontend: https://smartcal-nutrition-tracker-frontend.onrender.com
- Backend: https://smartcal-nutrition-tracker.onrender.com

**GitHub Repository:**
- [Your GitHub URL]

**Contact:**
- [Your Email/Contact]

---

## Design Tips for PowerPoint

### Color Scheme:
- Primary: Dark blue/navy (#1e3a8a)
- Accent: Orange/amber (#f59e0b)
- Background: Dark gray (#1f2937)
- Text: White/Light gray

### Slide Layout:
- Title slide: Centered, large title
- Content slides: Title at top, bullet points
- Use images/screenshots for demo slides
- Keep text concise (6-8 lines per slide)

### Visual Elements:
- Add screenshots of the application
- Use diagrams for database architecture
- Include code snippets (if relevant)
- Add charts/graphs for statistics

### Fonts:
- Title: Bold, 44-48pt
- Content: Regular, 24-28pt
- Use consistent font throughout

---

## Quick Reference for Each Slide

1. **Title** - Project name and your name
2. **Agenda** - 8 main points
3. **Overview** - What the app does
4. **Tech Stack** - Technologies used
5. **Features 1** - Auth & AI Logging
6. **Features 2** - Manual Entry & Dashboard
7. **Features 3** - History, Insights, Settings
8. **Database** - 4 tables overview
9. **Schema** - Table structures
10. **Relationships** - Database diagram
11. **Technical** - Transactions, Warehousing
12. **API** - RESTful endpoints
13. **AI** - Gemini integration
14. **Deployment** - Render setup
15. **Demo 1** - Registration
16. **Demo 2** - AI Logging
17. **Demo 3** - Dashboard
18. **Demo 4** - Edit Meal
19. **Challenges** - Problems solved
20. **Future** - Enhancements
21. **Stats** - Project metrics
22. **Conclusion** - Summary
23. **Thank You** - Q&A

---

## Presentation Tips

1. **Practice** - Run through the demo beforehand
2. **Timing** - Aim for 5-7 minutes total
3. **Screenshots** - Add actual app screenshots to slides
4. **Diagrams** - Use database relationship diagrams
5. **Code** - Show key code snippets if relevant
6. **Live Demo** - Have the app ready to show
7. **Backup** - Have screenshots in case demo fails

Good luck with your presentation! 🎯

