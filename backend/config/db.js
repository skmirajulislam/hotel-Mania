const mongoose = require('mongoose');
require('dotenv').config();

let cachedConnection = null;

const connectDB = async () => {
    // If we have a cached connection, return it
    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // Remove bufferCommands: false to prevent immediate query failures
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            // Add retry configuration
            retryWrites: true,
            retryReads: true
        });

        cachedConnection = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        // In serverless, don't exit the process
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
        throw error;
    }
};

module.exports = connectDB;
