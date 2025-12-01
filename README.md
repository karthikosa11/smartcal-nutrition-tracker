# SmartCal - AI-Powered Nutrition Tracker

A full-stack nutrition tracking application with AI-powered food recognition and dietary insights.

## 📁 Project Structure

```
DBT project/
├── frontend/              # React + Vite frontend application
│   ├── src/              # Source code
│   │   ├── App.tsx       # Main app component
│   │   ├── main.tsx      # Entry point
│   │   └── ...
│   ├── components/        # React components
│   ├── services/         # API services & utilities
│   ├── types.ts          # TypeScript type definitions
│   ├── constants.ts      # App constants
│   ├── package.json      # Frontend dependencies
│   └── vite.config.ts   # Vite configuration
│
├── backend/              # Express.js + MySQL backend API
│   ├── src/
│   │   ├── config/      # Database & config
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Auth middleware
│   │   ├── utils/       # Utilities
│   │   └── index.ts     # Server entry point
│   ├── package.json     # Backend dependencies
│   └── .env             # Environment variables (create this)
│
├── .env                  # Frontend environment variables
├── README.md            # This file
└── ...
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- MySQL 8.0+
- Gemini API key (optional, for AI features)

### 1. Backend Setup

```bash
cd server
npm install
```

Create `server/.env` (copy from `server/.env.example`):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smartcal_db
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Initialize database:
```bash
# Create database in MySQL
mysql -u root -p
CREATE DATABASE smartcal_db;
```

Start backend:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env` (copy from `frontend/.env.example`):
```env
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key
```

Start frontend:
```bash
npm run dev
```

## 📚 Documentation

- [CRUD Operations](./CRUD_OPERATIONS.md) - API endpoints documentation
- [Environment Setup](./ENV_SETUP.md) - Environment variables guide
- [Backend README](./backend/README.md) - Backend setup details
- [Database Setup](./backend/SETUP_DATABASE.md) - MySQL setup guide

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Recharts (charts)
- Google Gemini AI

### Backend
- Express.js
- MySQL
- JWT Authentication
- Bcrypt (password hashing)
- TypeScript

## ✨ Features

- ✅ User authentication (login/signup)
- ✅ Meal logging (manual, text, image)
- ✅ AI-powered food recognition
- ✅ Nutritional tracking
- ✅ Dashboard with charts
- ✅ Meal history
- ✅ Dietary insights
- ✅ Transaction management
- ✅ Data warehousing

## 🚀 Deployment

### Deploy to Render

See [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**
1. Push code to GitHub
2. Create Web Service on Render for backend
3. Create Static Site on Render for frontend
4. Configure environment variables
5. Set up MySQL database

## 📝 License

MIT
