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

    // Import routes one by one to identify issues
    console.log('Loading authRoutes...');
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);

    console.log('Loading roomRoutes...');
    const roomRoutes = require('./routes/roomRoutes');
    app.use('/api/rooms', roomRoutes);

    console.log('Loading menuRoutes...');
    const menuRoutes = require('./routes/menuRoutes');
    app.use('/api/menu', menuRoutes);

    console.log('Loading galleryRoutes...');
    const galleryRoutes = require('./routes/galleryRoutes');
    app.use('/api/gallery', galleryRoutes);

    console.log('Loading serviceRoutes...');
    const serviceRoutes = require('./routes/serviceRoutes');
    app.use('/api/services', serviceRoutes);

    console.log('Loading packageRoutes...');
    const packageRoutes = require('./routes/packageRoutes');
    app.use('/api/packages', packageRoutes);

    console.log('Loading testimonialRoutes...');
    const testimonialRoutes = require('./routes/testimonials');
    app.use('/api/testimonials', testimonialRoutes);

    console.log('Loading utilRoutes...');
    const utilRoutes = require('./routes/utilRoutes');
    app.use('/api', utilRoutes);

    // Load booking routes last as they seem to have the most complex patterns
    console.log('Loading bookingRoutes...');
    const bookingRoutes = require('./routes/bookingRoutes');
    app.use('/api/bookings', bookingRoutes);

} catch (error) {
    console.error('Error loading routes or database:', error);
    
    // Fallback route when main routes fail
    app.get('/api/*', (req, res) => {
        res.status(503).json({
            error: 'Service temporarily unavailable',
            message: 'Database or routes are not available',
            timestamp: new Date().toISOString(),
            route: req.path
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
