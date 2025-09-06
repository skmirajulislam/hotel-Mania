const express = require('express');
const { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } = require('../controllers/menuController');
const { auth, authorize } = require('../middleware/auth');
const { upload, uploadToCloudinary } = require('../middleware/upload');

const router = express.Router();

// Menu routes
router.get('/', getAllMenuItems);
router.post('/', auth, authorize(['admin']), upload.single('image'), uploadToCloudinary, createMenuItem);
router.put('/:id', auth, authorize(['admin']), updateMenuItem);
router.delete('/:id', auth, authorize(['admin']), deleteMenuItem);

module.exports = router;
