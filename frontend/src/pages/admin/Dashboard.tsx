import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, LogOut, Edit, Plus, Trash2,
  Home, Settings, Calendar, Eye, DollarSign, Building,
  ChefHat, Bed, AlertCircle, CheckCircle, Save
} from 'lucide-react';
import RoomModal from '../../components/admin/RoomModal';
import CategoryModal from '../../components/admin/CategoryModal';
import MenuManagement from '../../components/admin/MenuManagement';
import ThemeSwitcher from '../../components/ThemeSwitcher';
import StaffModal from '../../components/admin/StaffModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

interface Room {
  _id: string;
  name: string;
  description: string;
  price: number;
  availability: number;
  category?: string;
  images: string[];
  features: string[];
  amenities: string[];
  maxOccupancy: number;
  bedType: string;
  roomSize: number;
  // Legacy fields for compatibility
  roomNumber?: string;
  floor?: number;
  isAvailable?: boolean;
  maintenanceStatus?: string;
}

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category?: string;
  image: string;
  available: boolean;
  preparationTime: number;
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  // Legacy fields for compatibility
  ingredients?: string[];
  isSpicy?: boolean;
  spiceLevel?: number;
  isAvailable?: boolean;
}

interface Employee {
  _id: string;
  userDetails: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    department: string;
    employeeId: string;
    isActive: boolean;
    startDate: Date;
    profileImage?: string;
  };
  salary: {
    base: number;
    bonus: number;
    currency: string;
  };
  position: string;
  workSchedule: {
    type: string;
    hoursPerWeek: number;
    shift: string;
  };
  isActive: boolean;
}

interface Booking {
  _id: string;
  bookingNumber: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  room: {
    name: string;
    roomNumber: string;
    category: string;
  };
  checkInDate: Date;
  checkOutDate: Date;
  numberOfGuests: {
    adults: number;
    children: number;
  };
  specialRequests: {
    dietaryRestrictions: string[];
    accessibility: string[];
    preferences: string[];
    additionalRequests: string;
  };
  pricing: {
    totalAmount: number;
  };
  payment: {
    status: string;
  };
  status: string;
  createdAt: Date;
}

interface DashboardProps {
  onLogout: () => void;
}

interface RoomCategory {
  _id: string;
  name: string;
  description: string;
}

interface FoodCategory {
  _id: string;
  name: string;
  description: string;
}

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  confirmColor?: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  confirmColor = "bg-red-600"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${confirmColor} text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
  const [confirmTitle, setConfirmTitle] = useState<string>('');
  const [confirmMessage, setConfirmMessage] = useState<string>('');

  // Current user info
  const [currentUser, setCurrentUser] = useState<{
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  } | null>(null);
  const [editingCredentials, setEditingCredentials] = useState<boolean>(false);
  const [newCredentials, setNewCredentials] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Modal states
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [showRoomModal, setShowRoomModal] = useState<boolean>(false);
  const [showRoomCategoryModal, setShowRoomCategoryModal] = useState<boolean>(false);
  const [showFoodCategoryModal, setShowFoodCategoryModal] = useState<boolean>(false);
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>(undefined);
  const [editingRoomCategory, setEditingRoomCategory] = useState<RoomCategory | undefined>(undefined);
  const [editingFoodCategory, setEditingFoodCategory] = useState<FoodCategory | undefined>(undefined);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping user fetch');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 429) {
        console.log('Rate limited, will retry after delay');
        setTimeout(() => fetchCurrentUser(), 5000);
        return;
      }

      if (response.ok) {
        const userData = await response.json();
        console.log('User data response:', userData); // Debug log
        // Handle both possible response structures
        const user = userData.data || userData;
        setCurrentUser(user);
        setNewCredentials({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          password: ''
        });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch all data with error handling and rate limiting
      const fetchWithRetry = async (url: string, retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(url, { headers });
            if (response.status === 429) {
              console.log(`Rate limited for ${url}, retrying in ${(i + 1) * 2}s...`);
              await new Promise(resolve => setTimeout(resolve, (i + 1) * 2000));
              continue;
            }
            return response;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        return null;
      };

      const [
        roomsResponse,
        menuResponse,
        employeesResponse,
        bookingsResponse,
        roomCategoriesResponse
      ] = await Promise.all([
        fetchWithRetry(`${API_BASE_URL}/api/rooms`),
        fetchWithRetry(`${API_BASE_URL}/api/menu`),
        fetchWithRetry(`${API_BASE_URL}/api/employees`),
        fetchWithRetry(`${API_BASE_URL}/api/bookings`),
        fetchWithRetry(`${API_BASE_URL}/api/room-categories`)
      ]);

      if (roomsResponse?.ok) {
        const data = await roomsResponse.json();
        setRooms(data.data || data || []);
      }

      if (menuResponse?.ok) {
        const data = await menuResponse.json();
        setMenuItems(data.data || data || []);
      }

      if (employeesResponse?.ok) {
        const data = await employeesResponse.json();
        setEmployees(data.data || []);
      }

      if (bookingsResponse?.ok) {
        const data = await bookingsResponse.json();
        setBookings(data.data || data || []);
      }

      if (roomCategoriesResponse?.ok) {
        const data = await roomCategoriesResponse.json();
        setRoomCategories(data.data || data || []);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCredentials = async () => {
    setConfirmTitle('Update Admin Credentials');
    setConfirmMessage('Are you sure you want to update your admin credentials? This will require you to log in again.');
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newCredentials)
        });

        if (response.ok) {
          alert('Credentials updated successfully! Please log in again.');
          onLogout();
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error('Error updating credentials:', error);
        alert('Error updating credentials');
      }
    });
    setShowConfirmModal(true);
  };

  const handleDeleteItem = async (id: string, type: string, name: string) => {
    setConfirmTitle(`Delete ${type}`);
    setConfirmMessage(`Are you sure you want to delete "${name}"? This action cannot be undone.`);
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = type === 'room' ? 'rooms' :
          type === 'menu-item' ? 'menu' :
            type === 'employee' ? 'employees' :
              type === 'room-category' ? 'room-categories' :
                type === 'food-category' ? 'food-categories' : '';

        const response = await fetch(`${API_BASE_URL}/api/${endpoint}/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          // Refresh data
          fetchData();
          alert(`${type} deleted successfully`);
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        alert(`Error deleting ${type}`);
      }
    });
    setShowConfirmModal(true);
  };

  // CRUD Functions
  const handleSaveRoom = async (roomData: Omit<Room, '_id'>) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingRoom
        ? `${API_BASE_URL}/api/rooms/${editingRoom._id}`
        : `${API_BASE_URL}/api/rooms`;

      const response = await fetch(url, {
        method: editingRoom ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(roomData)
      });

      if (response.ok) {
        await fetchData();
        setEditingRoom(undefined);
        alert(`Room ${editingRoom ? 'updated' : 'created'} successfully`);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error saving room:', error);
      throw error;
    }
  };

  const handleSaveRoomCategory = async (categoryData: Omit<RoomCategory, '_id'>) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingRoomCategory
        ? `${API_BASE_URL}/api/room-categories/${editingRoomCategory._id}`
        : `${API_BASE_URL}/api/room-categories`;

      const response = await fetch(url, {
        method: editingRoomCategory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        await fetchData();
        setEditingRoomCategory(undefined);
        alert(`Room category ${editingRoomCategory ? 'updated' : 'created'} successfully`);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error saving room category:', error);
      throw error;
    }
  };

  const handleSaveFoodCategory = async (categoryData: Omit<FoodCategory, '_id'>) => {
    try {
      const token = localStorage.getItem('token');
      const url = editingFoodCategory
        ? `${API_BASE_URL}/api/food-categories/${editingFoodCategory._id}`
        : `${API_BASE_URL}/api/food-categories`;

      const response = await fetch(url, {
        method: editingFoodCategory ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)
      });

      if (response.ok) {
        await fetchData();
        setEditingFoodCategory(undefined);
        alert(`Food category ${editingFoodCategory ? 'updated' : 'created'} successfully`);
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error('Error saving food category:', error);
      throw error;
    }
  };

  const renderOverviewTab = () => {
    const totalRooms = rooms.length;
    const availableRooms = rooms.filter(room => room.isAvailable).length;
    const totalBookings = Array.isArray(bookings) ? bookings.length : 0;
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp.isActive).length;
    const totalRevenue = Array.isArray(bookings) ? bookings.reduce((sum, booking) => sum + (booking.pricing?.totalAmount || 0), 0) : 0;

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Dashboard Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Rooms</p>
                <p className="text-2xl font-bold">{totalRooms}</p>
              </div>
              <Bed className="h-8 w-8 text-blue-200" />
            </div>
          </div>

          <div className="bg-green-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Available Rooms</p>
                <p className="text-2xl font-bold">{availableRooms}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </div>
          </div>

          <div className="bg-purple-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold">{totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-200" />
            </div>
          </div>

          <div className="bg-orange-500 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Room Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Available Rooms</span>
                <span className="text-sm font-semibold text-green-600">{availableRooms}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Occupied Rooms</span>
                <span className="text-sm font-semibold text-red-600">{totalRooms - availableRooms}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Occupancy Rate</span>
                <span className="text-sm font-semibold">{totalRooms > 0 ? Math.round(((totalRooms - availableRooms) / totalRooms) * 100) : 0}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Staff Overview</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Staff</span>
                <span className="text-sm font-semibold">{totalEmployees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Staff</span>
                <span className="text-sm font-semibold text-green-600">{activeEmployees}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Menu Items</span>
                <span className="text-sm font-semibold">{menuItems.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBookingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Bookings Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {Array.isArray(bookings) && bookings.length > 0 ? (
            bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Booking #{booking.bookingNumber}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Guest: {booking.user?.firstName} {booking.user?.lastName}</p>
                        <p className="text-sm text-gray-600">Email: {booking.user?.email}</p>
                        <p className="text-sm text-gray-600">Phone: {booking.user?.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Room: {booking.room?.name} ({booking.room?.roomNumber})</p>
                        <p className="text-sm text-gray-600">Check-in: {new Date(booking.checkInDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Check-out: {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <h4 className="font-medium text-sm mb-2">Special Requests:</h4>
                        {booking.specialRequests.dietaryRestrictions?.length > 0 && (
                          <p className="text-sm text-gray-600">Dietary: {booking.specialRequests.dietaryRestrictions.join(', ')}</p>
                        )}
                        {booking.specialRequests.accessibility?.length > 0 && (
                          <p className="text-sm text-gray-600">Accessibility: {booking.specialRequests.accessibility.join(', ')}</p>
                        )}
                        {booking.specialRequests.additionalRequests && (
                          <p className="text-sm text-gray-600">Additional: {booking.specialRequests.additionalRequests}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">${booking.pricing?.totalAmount || 0}</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${booking.payment?.status === 'paid' ? 'bg-green-100 text-green-800' :
                      booking.payment?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                      {booking.payment?.status || 'unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Employee Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={() => setShowStaffModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Staff
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    {employee.userDetails.profileImage ? (
                      <img
                        src={employee.userDetails.profileImage}
                        alt={employee.userDetails.firstName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="h-6 w-6 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {employee.userDetails.firstName} {employee.userDetails.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{employee.position}</p>
                    <p className="text-sm text-gray-600">{employee.userDetails.department}</p>
                    <p className="text-sm text-gray-500">ID: {employee.userDetails.employeeId}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Role: {employee.userDetails.role}</p>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'ceo' || currentUser?.role === 'owner') && employee.userDetails.role !== 'manager' && (
                      <p className="text-sm font-medium">${employee.salary.base.toLocaleString()}/month</p>
                    )}
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'owner') && employee.userDetails.role !== 'manager' && (
                      <>
                        <button className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(employee._id, 'employee', `${employee.userDetails.firstName} ${employee.userDetails.lastName}`)}
                          className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRoomsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Room Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Home
          </button>
          <button
            onClick={() => {
              setEditingRoomCategory(undefined);
              setShowRoomCategoryModal(true);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </button>
          <button
            onClick={() => {
              setEditingRoom(undefined);
              setShowRoomModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Room
          </button>
        </div>
      </div>

      {/* Room Categories */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Room Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomCategories.map(category => (
            <div key={category._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditingRoomCategory(category);
                      setShowRoomCategoryModal(true);
                    }}
                    className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(category._id, 'room-category', category.name)}
                    className="bg-red-500 text-white p-2 rounded hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Rooms */}
      <div>
        <h3 className="text-xl font-semibold mb-4 dark:text-white">Individual Rooms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold">{room.name}</h4>
                  <p className="text-sm text-gray-600">Room {room.roomNumber} - Floor {room.floor}</p>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => {
                      setEditingRoom(room);
                      setShowRoomModal(true);
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(room._id, 'room', room.name)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Room Category</p>
              <div className="flex justify-between text-sm mb-2">
                <span>${room.price}/night</span>
                <span className={`px-2 py-1 rounded-full text-xs ${room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                  {room.isAvailable ? 'Available' : 'Occupied'}
                </span>
              </div>
              <p className="text-xs text-gray-500">Status: {room.maintenanceStatus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRestaurantTab = () => (
    <div>
      <MenuManagement />
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
        <button
          onClick={() => setActiveTab('overview')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          Home
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Account Settings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              type="text"
              value={newCredentials.firstName}
              onChange={(e) => setNewCredentials({ ...newCredentials, firstName: e.target.value })}
              disabled={!editingCredentials}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              type="text"
              value={newCredentials.lastName}
              onChange={(e) => setNewCredentials({ ...newCredentials, lastName: e.target.value })}
              disabled={!editingCredentials}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={newCredentials.email}
              onChange={(e) => setNewCredentials({ ...newCredentials, email: e.target.value })}
              disabled={!editingCredentials}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <input
              type="text"
              value={currentUser?.role || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        {editingCredentials && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password (optional)</label>
            <input
              type="password"
              value={newCredentials.password}
              onChange={(e) => setNewCredentials({ ...newCredentials, password: e.target.value })}
              placeholder="Enter new password or leave blank to keep current"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          {editingCredentials ? (
            <>
              <button
                onClick={() => setEditingCredentials(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCredentials}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditingCredentials(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Credentials
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'bookings':
        return renderBookingsTab();
      case 'users':
        return renderUsersTab();
      case 'rooms':
        return renderRoomsTab();
      case 'restaurant':
        return renderRestaurantTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>

            <div className="flex items-center space-x-4">
              {/* Theme Switcher */}
              <ThemeSwitcher />

              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {currentUser?.firstName?.charAt(0) || 'A'}
                  </span>
                </div>
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 uppercase">
                    {currentUser?.role || 'ADMIN'}
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <nav className="flex space-x-1 mb-8 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: Building },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'rooms', label: 'Rooms', icon: Bed },
            { id: 'restaurant', label: 'Restaurant', icon: ChefHat },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Tab Content */}
        {renderTabContent()}
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          confirmAction();
          setShowConfirmModal(false);
        }}
        title={confirmTitle}
        message={confirmMessage}
      />

      {/* Room Modal */}
      <RoomModal
        isOpen={showRoomModal}
        onClose={() => {
          setShowRoomModal(false);
          setEditingRoom(undefined);
        }}
        room={editingRoom}
        onSave={handleSaveRoom}
        categories={roomCategories}
      />

      {/* Room Category Modal */}
      <CategoryModal
        isOpen={showRoomCategoryModal}
        onClose={() => {
          setShowRoomCategoryModal(false);
          setEditingRoomCategory(undefined);
        }}
        category={editingRoomCategory}
        onSave={handleSaveRoomCategory}
        type="room"
      />

      {/* Food Category Modal */}
      <CategoryModal
        isOpen={showFoodCategoryModal}
        onClose={() => {
          setShowFoodCategoryModal(false);
          setEditingFoodCategory(undefined);
        }}
        category={editingFoodCategory}
        onSave={handleSaveFoodCategory}
        type="food"
      />

      {/* Staff Modal */}
      <StaffModal
        isOpen={showStaffModal}
        onClose={() => setShowStaffModal(false)}
        onStaffCreated={fetchData}
      />
    </div>
  );
};

export default Dashboard;
