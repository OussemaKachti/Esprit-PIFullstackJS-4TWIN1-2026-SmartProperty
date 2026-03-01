const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const dotenv = require('dotenv');
const toneChangerApi = require('./api/toneChanger');

dotenv.config();

const app = express();

app.use(express.json());
app.use('/api/tone-changer', toneChangerApi);

// Serve uploaded images via explicit route (avoids static + helmet issues, works on Windows)
const uploadsDir = path.resolve(__dirname, '..', 'uploads');
app.get('/uploads/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  if (!filename) return res.status(400).end();
  const filePath = path.join(uploadsDir, filename);
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  res.sendFile(filePath, (err) => {
    if (err) {
      if (err.statusCode) res.status(err.statusCode).end();
      else res.status(404).json({ message: 'File not found' });
    }
  });
});

// Security middleware
app.use(helmet());

// CORS configuration
// Allow both frontend and backoffice origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  process.env.BACKOFFICE_URL || 'http://localhost:3001',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002', // Backup port for backoffice
  'http://localhost:5173', // New backoffice (Vite default port)
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Tone changer API (with CORS enabled)
app.use('/api/tone-changer', toneChangerApi);

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  console.log('📁 Image request:', req.url);
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// HTTP request logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🏡 Welcome to SmartProperty API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
