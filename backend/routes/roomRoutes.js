const express = require('express');
const { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { auth, authorize } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

// Room routes
router.get('/', getAllRooms);
router.get('/:id', getRoomById);
router.post('/', auth, authorize(['admin']), upload.array('images', 5), createRoom);
router.put('/:id', auth, authorize(['admin']), updateRoom);
router.delete('/:id', auth, authorize(['admin']), deleteRoom);

module.exports = router;
