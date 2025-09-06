const MenuItem = require('../models/MenuItem');

// Get all menu items
const getAllMenuItems = async (req, res) => {
    try {
        const menuItems = await MenuItem.find().sort({ category: 1 });
        res.json(menuItems);
    } catch (error) {
        console.error('Error getting menu:', error);
        res.status(500).json({ error: 'Failed to get menu' });
    }
};

// Add menu item (admin only)
const createMenuItem = async (req, res) => {
    try {
        const { name, description, price, category } = req.body;

        const menuItem = new MenuItem({
            name,
            description,
            price: Number(price),
            category,
            image: req.fileUrl
        });

        await menuItem.save();
        res.status(201).json({ success: true, item: menuItem });
    } catch (error) {
        console.error('Error adding menu item:', error);
        res.status(500).json({ error: 'Failed to add menu item' });
    }
};

// Update menu item (admin only)
const updateMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ success: true, item: menuItem });
    } catch (error) {
        console.error('Error updating menu item:', error);
        res.status(500).json({ error: 'Failed to update menu item' });
    }
};

// Delete menu item (admin only)
const deleteMenuItem = async (req, res) => {
    try {
        const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ error: 'Menu item not found' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting menu item:', error);
        res.status(500).json({ error: 'Failed to delete menu item' });
    }
};

module.exports = {
    getAllMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
};
