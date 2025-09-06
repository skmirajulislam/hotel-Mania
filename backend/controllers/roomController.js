const Room = require('../models/Room');

// Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        console.error('Error getting rooms:', error);
        res.status(500).json({ error: 'Failed to get rooms' });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        res.json(room);
    } catch (error) {
        console.error('Error getting room:', error);
        res.status(500).json({ error: 'Failed to get room' });
    }
};

// Create new room (admin only)
const createRoom = async (req, res) => {
    try {
        const { category, name, description, price, available, total, amenities } = req.body;

        // Create new room
        const room = new Room({
            category,
            name,
            description,
            price: Number(price),
            available: Number(available),
            total: Number(total),
            amenities: Array.isArray(amenities) ? amenities : JSON.parse(amenities),
            images: req.files ? req.files.map(file => file.path) : []
        });

        await room.save();
        res.status(201).json({ success: true, room });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ error: 'Failed to create room' });
    }
};

// Update room (admin only)
const updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body,
                updatedAt: Date.now()
            },
            { new: true }
        );

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ success: true, room });
    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({ error: 'Failed to update room' });
    }
};

// Delete room (admin only)
const deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting room:', error);
        res.status(500).json({ error: 'Failed to delete room' });
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};
