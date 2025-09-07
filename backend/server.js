const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

// Initialize express
const app = express();

// Basic error handling for serverless
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Production security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:", "blob:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.stripe.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// Compression middleware for better performance
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// Global rate limiting for production
const globalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: 15 * 60 // 15 minutes in seconds
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// API-specific rate limiting
const apiRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 API requests per windowMs
    message: {
        error: 'Too many API requests from this IP, please try again later.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth-specific rate limiting (stricter)
const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: {
        error: 'Too many authentication attempts from this IP, please try again later.',
        retryAfter: 15 * 60
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply global rate limiting
app.use(globalRateLimit);

// Middleware - CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://hotel-mania-pqzv.vercel.app',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is working and healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database connection middleware for API routes
const ensureDbConnection = async (req, res, next) => {
    try {
        const mongoose = require('mongoose');

        // Check if connection is ready
        if (mongoose.connection.readyState === 1) {
            return next();
        }

        // If not connected, try to reconnect
        if (mongoose.connection.readyState === 0) {
            const connectDB = require('./config/db');
            await connectDB();
            return next();
        }

        // Connection is in progress, wait a bit
        if (mongoose.connection.readyState === 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            return next();
        }

        // Connection failed
        return res.status(503).json({
            error: 'Database connection not available',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Database connection middleware error:', error);
        return res.status(503).json({
            error: 'Database connection failed',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Test route to check if basic routing works
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: 'API routing is working',
        timestamp: new Date().toISOString()
    });
});

// Load routes conditionally to avoid crashes
async function initializeApp() {
    try {
        // Import database connection only when needed
        const connectDB = require('./config/db');

        // Connect to MongoDB first (critical for serverless)
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully');

        // Load routes one by one with error handling
        const routesToLoad = [
            { name: 'authRoutes', path: './routes/authRoutes', endpoint: '/api/auth' },
            { name: 'roomRoutes', path: './routes/roomRoutes', endpoint: '/api/rooms' },
            { name: 'roomCategoryRoutes', path: './routes/roomCategoryRoutes', endpoint: '/api/room-categories' },
            { name: 'menuRoutes', path: './routes/menuRoutes', endpoint: '/api/menu' },
            { name: 'foodCategoryRoutes', path: './routes/foodCategoryRoutes', endpoint: '/api/food-categories' },
            { name: 'galleryRoutes', path: './routes/galleryRoutes', endpoint: '/api/gallery' },
            { name: 'serviceRoutes', path: './routes/serviceRoutes', endpoint: '/api/services' },
            { name: 'packageRoutes', path: './routes/packageRoutes', endpoint: '/api/packages' },
            { name: 'testimonialRoutes', path: './routes/testimonials', endpoint: '/api/testimonials' },
            { name: 'utilRoutes', path: './routes/utilRoutes', endpoint: '/api/utils' },
            { name: 'bookingRoutes', path: './routes/bookingRoutes', endpoint: '/api/bookings' },
            { name: 'orderRoutes', path: './routes/orderRoutes', endpoint: '/api/orders' },
            { name: 'employeeRoutes', path: './routes/employeeRoutes', endpoint: '/api/employees' }
        ];

        for (const route of routesToLoad) {
            try {
                console.log(`Loading ${route.name}...`);
                const routeModule = require(route.path);

                if (route.name === 'utilRoutes') {
                    // Utils don't always need DB
                    app.use(route.endpoint, routeModule);
                } else if (route.name === 'authRoutes') {
                    // Apply stricter rate limiting to auth routes
                    app.use(route.endpoint, authRateLimit, ensureDbConnection, routeModule);
                } else {
                    // Apply API rate limiting to other routes
                    app.use(route.endpoint, apiRateLimit, ensureDbConnection, routeModule);
                }

                console.log(`✅ ${route.name} loaded successfully`);
            } catch (error) {
                console.error(`❌ Error loading ${route.name}:`, error.message);

                // Create a fallback route for this specific endpoint
                app.use(route.endpoint, (req, res) => {
                    res.status(503).json({
                        error: `${route.name} temporarily unavailable`,
                        message: error.message,
                        timestamp: new Date().toISOString()
                    });
                });
            }
        }

        console.log('All routes processing completed');

        // Add health endpoint after all routes are loaded
        app.get('/api/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                environment: process.env.NODE_ENV || 'development'
            });
        });

        // 404 handler for non-API routes (must be after all routes)
        app.use((req, res) => {
            res.status(404).json({
                error: 'Route not found',
                path: req.path,
                method: req.method,
                timestamp: new Date().toISOString()
            });
        });

        // Global error handling middleware (must be last)
        app.use((err, req, res, next) => {
            console.error('Global error handler:', err.stack);

            // Mongoose validation error
            if (err.name === 'ValidationError') {
                const errors = Object.values(err.errors).map(e => e.message);
                return res.status(400).json({
                    error: 'Validation Error',
                    messages: errors,
                    timestamp: new Date().toISOString()
                });
            }

            // MongoDB duplicate key error
            if (err.code === 11000) {
                const field = Object.keys(err.keyValue)[0];
                return res.status(400).json({
                    error: 'Duplicate Entry',
                    message: `${field} already exists`,
                    timestamp: new Date().toISOString()
                });
            }

            // JWT errors
            if (err.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Invalid token',
                    timestamp: new Date().toISOString()
                });
            }

            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Token expired',
                    timestamp: new Date().toISOString()
                });
            }

            // Default server error
            res.status(err.status || 500).json({
                error: process.env.NODE_ENV === 'production'
                    ? 'Internal server error'
                    : err.message,
                timestamp: new Date().toISOString(),
                ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
            });
        });

    } catch (error) {
        console.error('Error during app initialization:', error);

        // Fallback route when everything fails
        app.get('/api/health', (req, res) => {
            res.status(503).json({
                error: 'Service temporarily unavailable',
                message: 'App initialization failed',
                timestamp: new Date().toISOString(),
                route: req.path,
                reason: error.message
            });
        });
    }
}

// Initialize the app
initializeApp();

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
