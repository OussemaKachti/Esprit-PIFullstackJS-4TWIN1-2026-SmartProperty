# Esprit-PIDEV-3A-2026-SmartProperty

## Project Title

Smart Property – Intelligent Real Estate Management & Rental Matching Platform

## Overview

Smart Property is a full-stack real estate management system developed as part of the PIDEV – 3rd Year Engineering Program at Esprit School of Engineering (Academic Year 2025–2026).

The platform combines AI-powered rental matching with a modern web application to simplify property listing, management, and rental processes.

## Features

### Property Management
- Create, update, and manage properties for sale or rent
- Advanced search and filtering
- Property gallery and detailed property pages

### User Management
- Role-based access control (Admin, Agent, User)
- Authentication and authorization
- Profile management for buyers, sellers, and agents

### AI-Powered Rental Matching
- AI-driven property recommendations
- YOLOv8 integration for property image analysis
- Intelligent matching between users and properties

### Admin Backoffice
- Dashboard for administrators
- User and property management
- Analytics and reporting

### Responsive Design
- Mobile-friendly interface
- Modern UI/UX built with React and Vite

### Data Management
- CSV import/export support
- Centralized database management
- Static user initialization

## Tech Stack

### Frontend
- Framework: React 18 + TypeScript
- Build Tool: Vite
- Styling: CSS3 (PostCSS)
- State Management: Context API
- Architecture: Component-based

### Backoffice
- Framework: React 18 + TypeScript
- Build Tool: Vite
- Styling: CSS/PostCSS
- Linting: ESLint
- TypeScript: Strict mode enabled

### Backend
- Runtime: Node.js
- Framework: Express.js
- Architecture: MVC pattern
  - Controllers
  - Models
  - Services
  - Routes
  - Middleware
  - Configuration
  - Utilities
- Database: MongoDB (or your choice)
- Authentication: JWT-based

### AI/ML Component
- Language: Python 3
- Framework: YOLOv8 (Object Detection)
- Purpose: Property image analysis and rental matching
- Model: YOLOv8 trained on dataset coco

## Architecture

The system follows a modular architecture:

- Frontend: React components, context-based state management, responsive design
- Backend: REST API using Express.js with MVC structure
- AI/ML Service: Python microservice for image analysis and rental recommendations
- Database: Centralized for users, properties, sales, and transactions
- Notifications: Email and push notifications for sales and updates

## Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- Python 3.9+ (for AI/ML services)
- MongoDB (or other supported database)

### Project Structure (Run Each App Separately)
- `frontend/` → Public website (React CRA)
- `backofficee/` → Admin dashboard (React + Vite + TS)
- `backend/` → Express API + business logic
- `rental-matching-ai/` → Python AI microservice (FastAPI + ML)

## Setup By Folder

### 1) Backend Setup (`backend/`)

```bash
cd backend
npm install
```

Create `.env` in `backend/` with at least:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret

# AI providers
GROQ_API_KEY=your_groq_key
HUGGINGFACE_API_KEY=your_huggingface_key

# Cloudinary (if image upload is enabled)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Pusher
PUSHER_APP_ID=your_id
PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
PUSHER_CLUSTER=your_cluster
```

Run backend:

```bash
npm run dev
```

Optional one-time scripts:

```bash
npm run init-user
npm run create-admin
npm run import-data
```

### 2) Frontend Setup (`frontend/`)

```bash
cd frontend
npm install
npm start
```

Default local URL: `http://localhost:3000`

### 3) Backoffice Setup (`backofficee/`)

```bash
cd backofficee
npm install
npm run dev
```

Default local URL: Vite URL shown in terminal (usually `http://localhost:5173`)

### 4) AI Service Setup (`rental-matching-ai/`)

```bash
cd rental-matching-ai
python -m venv .venv
```

Activate venv:

- Windows (PowerShell):

```bash
.\.venv\Scripts\Activate.ps1
```

- macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create `.env` in `rental-matching-ai/` (for email notifications):

```env
EMAIL_SENDER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

Run AI API:

```bash
uvicorn api:app --reload --host 127.0.0.1 --port 8000
```

Optional ML pipeline run:

```bash
python src/clean_data.py
python src/train_models.py
python main.py
```

## Full Local Startup Order
1. Start `backend/` (`npm run dev`) on port `5000`.
2. Start `rental-matching-ai/` (`uvicorn ...`) on port `8000`.
3. Start `frontend/` (`npm start`) on port `3000`.
4. Start `backofficee/` (`npm run dev`) on port `5173`.

## Quick Health Check
- Backend API responds on `http://localhost:5000`
- AI service responds on `http://127.0.0.1:8000/docs`
- Frontend opens on `http://localhost:3000`
- Backoffice opens on Vite URL (`http://localhost:5173`)