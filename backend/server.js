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

// Test route to check if basic routing works
app.get('/api/test', (req, res) => {
    res.status(200).json({
        message: 'API routing is working',
        timestamp: new Date().toISOString()
    });
});

// Load routes conditionally to avoid crashes
try {
    // Import database connection only when needed
    const connectDB = require('./config/db');
    
    // Connect to MongoDB (async for serverless)
    (async () => {
        try {
            await connectDB();
            console.log('Database connected successfully');
        } catch (error) {
            console.error('Database connection failed:', error);
        }
    })();

    // Import routes
    const authRoutes = require('./routes/authRoutes');
    const roomRoutes = require('./routes/roomRoutes');
    const menuRoutes = require('./routes/menuRoutes');
    const galleryRoutes = require('./routes/galleryRoutes');
    const bookingRoutes = require('./routes/bookingRoutes');
    const serviceRoutes = require('./routes/serviceRoutes');
    const packageRoutes = require('./routes/packageRoutes');
    const utilRoutes = require('./routes/utilRoutes');
    const testimonialRoutes = require('./routes/testimonials');

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/rooms', roomRoutes);
    app.use('/api/menu', menuRoutes);
    app.use('/api/gallery', galleryRoutes);
    app.use('/api/bookings', bookingRoutes);
    app.use('/api/services', serviceRoutes);
    app.use('/api/packages', packageRoutes);
    app.use('/api/testimonials', testimonialRoutes);
    app.use('/api', utilRoutes);

} catch (error) {
    console.error('Error loading routes or database:', error);
    
    // Fallback route when main routes fail
    app.get('/api/*', (req, res) => {
        res.status(503).json({
            error: 'Service temporarily unavailable',
            message: 'Database or routes are not available',
            timestamp: new Date().toISOString()
        });
    });
}

// Error handling middleware
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
