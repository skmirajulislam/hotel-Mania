const express = require('express');
const cors = require('cors');
const path = require('path');
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

// Middleware - CORS configuration
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://hotel-mania-pqzv.vercel.app',
        'https://hotel-mania-two.vercel.app',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Server is working and healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Simple test route without database
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        service: 'Hotel API',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
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
            { name: 'menuRoutes', path: './routes/menuRoutes', endpoint: '/api/menu' },
            { name: 'galleryRoutes', path: './routes/galleryRoutes', endpoint: '/api/gallery' },
            { name: 'serviceRoutes', path: './routes/serviceRoutes', endpoint: '/api/services' },
            { name: 'packageRoutes', path: './routes/packageRoutes', endpoint: '/api/packages' },
            { name: 'testimonialRoutes', path: './routes/testimonials', endpoint: '/api/testimonials' },
            { name: 'utilRoutes', path: './routes/utilRoutes', endpoint: '/api' },
            { name: 'bookingRoutes', path: './routes/bookingRoutes', endpoint: '/api/bookings' }
        ];

        for (const route of routesToLoad) {
            try {
                console.log(`Loading ${route.name}...`);
                const routeModule = require(route.path);

                if (route.name === 'utilRoutes') {
                    // Utils don't always need DB
                    app.use(route.endpoint, routeModule);
                } else {
                    app.use(route.endpoint, ensureDbConnection, routeModule);
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

    } catch (error) {
        console.error('Error during app initialization:', error);

        // Fallback route when everything fails
        app.get('/api/*', (req, res) => {
            res.status(503).json({
                error: 'Service temporarily unavailable',
                message: 'App initialization failed',
                timestamp: new Date().toISOString(),
                route: req.path,
                reason: error.message
            });
        });
    }
}// Initialize the app
initializeApp();// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server (only in development)
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
