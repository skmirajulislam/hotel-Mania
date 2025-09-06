
import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { menuService } from '../services/api';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

const Restaurant: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('breakfast');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await menuService.getAllMenuItems();
        console.log('Menu API Response:', response); // Debug log

        // Handle the flat array of menu items
        if (Array.isArray(response)) {
          setMenuItems(response);
        } else {
          setError('Invalid menu data format');
        }
      } catch (error) {
        console.error('Error fetching menu:', error);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const categories = [
    { id: 'breakfast', name: 'Breakfast', icon: '🌅' },
    { id: 'lunch', name: 'Lunch', icon: '🌞' },
    { id: 'dinner', name: 'Dinner', icon: '🌙' },
    { id: 'snacks', name: 'Snacks', icon: '🍿' },
  ];

  // Filter menu items by category
  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Restaurant Menu</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Indulge in our carefully crafted dishes made from the finest ingredients. Our chefs create culinary masterpieces that will delight your senses.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${activeCategory === category.id
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span>{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Food Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {item.price} INR
                  </span>
                </div>
              </div>

              {/* Food Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Restaurant Info */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Dining Hours</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold text-gray-900">Breakfast</span>
                  <span className="text-gray-600">6:00 AM - 11:00 AM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold text-gray-900">Lunch</span>
                  <span className="text-gray-600">12:00 PM - 4:00 PM</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-semibold text-gray-900">Dinner</span>
                  <span className="text-gray-600">6:00 PM - 11:00 PM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Room Service</span>
                  <span className="text-gray-600">24/7 Available</span>
                </div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Our Cuisine</h2>
              <p className="text-gray-600 leading-relaxed">
                Our award-winning restaurant features international cuisine prepared by world-class chefs.
                We source the finest local and imported ingredients to create memorable dining experiences.
                Whether you're enjoying a leisurely breakfast, business lunch, or romantic dinner,
                our culinary team is dedicated to exceeding your expectations.
              </p>
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 font-semibold">
                  🍷 Extensive wine collection available | 🌱 Vegetarian and vegan options | 👨‍🍳 Private chef available upon request
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Restaurant;