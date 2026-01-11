// server.js
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Polyfill for Web Crypto API (required for baileys on older Node versions)
if (!globalThis.crypto) {
    globalThis.crypto = require('crypto').webcrypto;
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const userRouter = require('./routes/userRoutes');
const apartmentRouter = require('./routes/apartmentRoutes');
const whatsappRouter = require('./routes/whatsappRoutes');
const expenseRouter = require('./routes/expenseRoutes');

const ownService = require('./services/ownService');


const { initAllActiveSessions } = require('./services/baileysService');

// Initialize Express application
const app = express();

// Trust proxy - we're behind Nginx
app.set('trust proxy', 1);

// Security Middlewares
app.use(helmet());

// Body parser - MUST be before routes
app.use(express.json()); 
app.use(morgan('dev'));

// Rate limiting - limit each IP to 100 requests per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS - restrict to frontend URL
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

// Connect to the database
(async () => {
    try {
      await connectDB();
      // Start all active sessions from the database after connection is established
      await initAllActiveSessions();
    } catch (error) {
      console.error('❌ Error initializing database or sessions:', error);
      process.exit(1);
    }
  })();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/apartments', apartmentRouter);
app.use('/api/whatsapp', whatsappRouter);
app.use('/api/expenses', expenseRouter);

// Simple test route to check if the server is running
app.get('/', (req, res) => {
    res.send('Master Splitter Server is running 🐀🍕');
});



// Start the server
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`   Waiting for WhatsApp QR code...`);
});


// Handle graceful shutdown
// (WhatsApp client is handled in whatsappBot.js)
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down server...`);
    
    // Close the server
    server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
    });
    
    // timeout in case the server doesn't shut down
    setTimeout(() => {
        console.error('⚠️ Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
};

// Handle SIGINT (Ctrl+C) - WhatsApp client is handled in whatsappBot.js
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle SIGTERM (kill command)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    gracefulShutdown('uncaughtException');
});

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});