const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['Standard', 'Premium', 'Luxury']
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    available: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    images: [{
        type: String
    }],
    videos: [{
        type: String
    }],
    amenities: [{
        type: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);
