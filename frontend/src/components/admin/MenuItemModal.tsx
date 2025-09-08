import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import Modal from '../Modal';

interface MenuItem {
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: {
        url: string;
        cloudinaryId: string;
    };
    ingredients: string[];
    allergens: string[];
    nutritionInfo: {
        calories?: number;
        protein?: number;
        carbohydrates?: number;
        fat?: number;
    };
    isVegetarian: boolean;
    isVegan: boolean;
    isGlutenFree: boolean;
    isSpicy: boolean;
    spiceLevel: number;
    preparationTime: number;
    isAvailable: boolean;
    featured: boolean;
    discount: {
        percentage: number;
        validUntil?: string;
    };
}

interface FoodCategory {
    _id: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
    sortOrder: number;
}

interface MenuItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    menuItem?: MenuItem;
    onSave: (menuItemData: Omit<MenuItem, '_id'>) => Promise<void>;
    categories: FoodCategory[];
}

const MenuItemModal: React.FC<MenuItemModalProps> = ({
    isOpen,
    onClose,
    menuItem,
    onSave,
    categories
}) => {
    const [formData, setFormData] = useState<Omit<MenuItem, '_id'>>({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: {
            url: '',
            cloudinaryId: ''
        },
        ingredients: [],
        allergens: [],
        nutritionInfo: {},
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isSpicy: false,
        spiceLevel: 0,
        preparationTime: 15,
        isAvailable: true,
        featured: false,
        discount: {
            percentage: 0
        }
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (menuItem) {
            setFormData({
                name: menuItem.name,
                description: menuItem.description,
                price: menuItem.price,
                category: menuItem.category || '',
                image: menuItem.image || { url: '', cloudinaryId: '' },
                ingredients: menuItem.ingredients || [],
                allergens: menuItem.allergens || [],
                nutritionInfo: menuItem.nutritionInfo || {},
                isVegetarian: menuItem.isVegetarian || false,
                isVegan: menuItem.isVegan || false,
                isGlutenFree: menuItem.isGlutenFree || false,
                isSpicy: menuItem.isSpicy || false,
                spiceLevel: menuItem.spiceLevel || 0,
                preparationTime: menuItem.preparationTime || 15,
                isAvailable: menuItem.isAvailable !== undefined ? menuItem.isAvailable : true,
                featured: menuItem.featured || false,
                discount: menuItem.discount || { percentage: 0 }
            });
        }
    }, [menuItem, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.description.trim() || formData.price <= 0 || !formData.category) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving menu item:', error);
            alert('Failed to save menu item. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {menuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price *
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                        >
                            <option value="">Select a category</option>
                            {categories.map(category => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Preparation Time (minutes)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.preparationTime}
                                onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isAvailable}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                                    className="rounded border-gray-300"
                                />
                                <span>Available</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData(prev => ({ ...prev, featured: e.target.checked }))}
                                    className="rounded border-gray-300"
                                />
                                <span>Featured</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-yellow-600 text-white px-6 py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{menuItem ? 'Update' : 'Create'} Menu Item</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default MenuItemModal;
