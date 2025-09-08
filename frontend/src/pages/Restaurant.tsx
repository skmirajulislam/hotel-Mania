
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, CreditCard, User, X } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import StripeCheckout from '../components/StripeCheckout';
import { menuService, authService, orderService, foodCategoriesService } from '../services/api';

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string | FoodCategory; // Can be ID string or populated object
  discount: {
    percentage: number;
  };
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isSpicy: boolean;
  spiceLevel: number;
  isAvailable: boolean;
  featured: boolean;
  popularity: number;
  discountedPrice: number;
  id: string;
}

interface FoodCategory {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

const Restaurant: React.FC = () => {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentClientSecret, setPaymentClientSecret] = useState('');
  const [currentOrderId, setCurrentOrderId] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch menu items and categories in parallel
        const [menuResponse, categoriesResponse] = await Promise.all([
          menuService.getAllMenuItems(),
          foodCategoriesService.getAllCategories()
        ]);

        console.log('Menu API Response:', menuResponse); // Debug log
        console.log('Categories API Response:', categoriesResponse); // Debug log

        // Ensure we have arrays
        setMenuItems(Array.isArray(menuResponse) ? menuResponse : []);
        setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load menu data');
      } finally {
        setLoading(false);
      }
    };

    // Check authentication status
    const checkAuth = () => {
      setIsAuthenticated(authService.isAuthenticated());
    };

    fetchData();
    checkAuth();
  }, []);

  // Cart management functions
  const addToCart = (item: MenuItem) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => {
      return prevCart.reduce((acc, item) => {
        if (item._id === itemId) {
          if (item.quantity > 1) {
            acc.push({ ...item, quantity: item.quantity - 1 });
          }
          // If quantity is 1, don't add it back (remove completely)
        } else {
          acc.push(item);
        }
        return acc;
      }, [] as CartItem[]);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Payment processing with Stripe
  const processPayment = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setProcessingPayment(true);
    try {
      // Get user info for the order
      const user = await authService.getCurrentUser();
      const customerInfo = {
        email: user?.email || 'guest@hotel.com',
        name: user?.name || 'Hotel Guest'
      };

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          category: item.category || 'general' // Provide default value
        })),
        totalAmount: getTotalPrice(),
        customerInfo
      };

      // Create payment intent
      const response = await orderService.createPaymentIntent(orderData);

      if (response.clientSecret) {
        setPaymentClientSecret(response.clientSecret);
        setCurrentOrderId(response.orderId);
        setShowCart(false);
        setShowCheckout(true);
      } else {
        throw new Error('Failed to create payment intent');
      }
    } catch (error) {
      console.error('Payment setup failed:', error);
      setError('Payment setup failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      // Confirm payment with backend
      await orderService.confirmPayment({
        paymentIntentId: paymentIntent.id,
        orderId: currentOrderId
      });

      // Clear cart and close modals
      clearCart();
      setShowCheckout(false);
      setPaymentClientSecret('');
      setCurrentOrderId('');

      // Show success message
      alert(`Payment successful! Your order ${currentOrderId} has been placed. Food will be delivered to your room.`);
    } catch (error) {
      console.error('Payment confirmation failed:', error);
      setError('Payment completed but order confirmation failed. Please contact support.');
    }
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    setError('Payment failed. Please try again.');
    setShowCheckout(false);
  };

  // Handle checkout cancellation
  const handleCheckoutCancel = () => {
    setShowCheckout(false);
    setPaymentClientSecret('');
    setCurrentOrderId('');
    setShowCart(true);
  };

  // Filter menu items by category
  const filteredItems = activeCategory === 'all'
    ? menuItems
    : menuItems.filter(item => {
      if (!item.category) return false;

      // Handle both populated category objects and category IDs
      const itemCategoryId = typeof item.category === 'object'
        ? (item.category as FoodCategory)._id
        : item.category;

      return itemCategoryId === activeCategory;
    });  // Create display categories with 'All' option
  const displayCategories = [
    { _id: 'all', name: 'All Items', icon: '🍽️', isActive: true },
    ...categories.filter(cat => cat.isActive)
  ];

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
        {/* Header with Cart Button */}
        <div className="text-center mb-16">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Restaurant Menu</h1>
            <div className="relative">
              <button
                onClick={() => setShowCart(true)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg transition-colors duration-200 flex items-center gap-2"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Indulge in our carefully crafted dishes made from the finest ingredients. Our chefs create culinary masterpieces that will delight your senses.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-2 rounded-xl shadow-lg">
            <div className="flex flex-wrap gap-2">
              {displayCategories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setActiveCategory(category._id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${activeCategory === category._id
                    ? 'bg-yellow-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <span>{category.icon || '🍽️'}</span>
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
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{item.description}</p>

                {/* Add to Cart Button */}
                <button
                  onClick={() => addToCart(item)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add to Cart - {item.price} INR
                </button>
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

        {/* Shopping Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {/* Cart Items */}
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item._id} className="flex items-center gap-4 border-b pb-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-gray-600 text-sm">{item.price} INR each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{item.price * item.quantity} INR</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total and Checkout */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Total:</span>
                        <span className="text-xl font-bold text-yellow-600">{getTotalPrice()} INR</span>
                      </div>
                      <button
                        onClick={processPayment}
                        disabled={processingPayment}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <CreditCard className="h-5 w-5" />
                        {processingPayment ? 'Processing...' : 'Place Order'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Authentication Prompt Modal */}
        {showAuthPrompt && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="text-center">
                <User className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
                <p className="text-gray-600 mb-6">
                  Please log in to your account to add items to cart and place orders.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowAuthPrompt(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthPrompt(false);
                      navigate('/auth');
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Login
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckout
        isOpen={showCheckout}
        onClose={handleCheckoutCancel}
        clientSecret={paymentClientSecret}
        totalAmount={getTotalPrice()}
        orderItems={cart}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};

export default Restaurant;