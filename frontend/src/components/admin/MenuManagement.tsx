import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    category: string;
    isAvailable: boolean;
}

interface FoodCategory {
    _id: string;
    name: string;
    description: string;
    isActive: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';

const MenuManagement: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch menu items
            const menuResponse = await fetch(`${API_BASE_URL}/menu`, { headers });
            if (menuResponse.ok) {
                const menuData = await menuResponse.json();
                setMenuItems(menuData.data || []);
            }

            // Fetch food categories
            const categoriesResponse = await fetch(`${API_BASE_URL}/food-categories`, { headers });
            if (categoriesResponse.ok) {
                const categoriesData = await categoriesResponse.json();
                setFoodCategories(categoriesData.data || []);
            }
        } catch (error) {
            console.error('Error fetching menu data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (categoryId: string) => {
        const category = foodCategories.find(cat => cat._id === categoryId);
        return category ? category.name : 'Uncategorized';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white dark:glow-text-strong">Restaurant Management</h2>
                <div className="flex space-x-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <span>🏠</span>
                        <span>Home</span>
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Category</span>
                    </button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Menu Item</span>
                    </button>
                </div>
            </div>

            {/* Food Categories Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white dark:glow-text-strong mb-6">Food Categories</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {foodCategories.map((category) => (
                        <div key={category._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white dark:glow-text-strong">{category.name}</h4>
                                <div className="flex space-x-2">
                                    <button className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button className="bg-red-500 text-white p-1 rounded hover:bg-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 dark:glow-text mb-3">{category.description}</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">Order: {/* Add order if available */}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {foodCategories.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400 dark:glow-text">Menu management interface coming soon... You can currently view and manage menu items below.</p>
                    </div>
                )}
            </div>

            {/* Menu Items Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white dark:glow-text-strong mb-6">Menu Items</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item) => (
                        <div key={item._id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 dark:text-white dark:glow-text-strong">{item.name}</h4>
                                    <p className="text-sm text-orange-600 dark:text-orange-400 dark:glow-text">Menu Category</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600">
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button className="bg-red-500 text-white p-1 rounded hover:bg-red-600">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 dark:glow-text mb-3 line-clamp-2">{item.description}</p>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-gray-900 dark:text-white dark:glow-text-strong">${item.price}</span>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">min</span>
                                    <span className={`px-2 py-1 rounded-full text-xs ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {menuItems.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🍽️</div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white dark:glow-text-strong mb-2">No menu items found</h4>
                        <p className="text-gray-600 dark:text-gray-300 dark:glow-text">Get started by adding your first menu item.</p>
                    </div>
                )}
            </div>
        </div>
    );
        </div >
    );
};

export default MenuManagement;
