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

### Frontend Setup
```bash
cd frontend
npm install
npm start
