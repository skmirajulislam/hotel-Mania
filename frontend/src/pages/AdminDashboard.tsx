import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    Calendar,
    Home,
    Utensils,
    Settings,
    Bell,
    LogOut,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    BarChart3,
    DollarSign
} from 'lucide-react';

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    department?: string;
    isActive: boolean;
    createdAt: string;
}

interface Booking {
    _id: string;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
    room: {
        number: string;
        type: string;
    };
    checkIn: string;
    checkOut: string;
    status: string;
    totalAmount: number;
    createdAt: string;
}

const AdminDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [users, setUsers] = useState<User[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        monthlyRevenue: 0
    });
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    const fetchDashboardData = React.useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Don't make API calls if no token
            if (!token) {
                setLoading(false);
                return;
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch users (admin only)
            if (currentUser?.role === 'admin' || currentUser?.role === 'ceo') {
                try {
                    const usersResponse = await fetch('http://localhost:5002/api/auth/users', { headers });
                    if (usersResponse.ok) {
                        const usersData = await usersResponse.json();
                        setUsers(usersData.data || []);
                    }
                } catch (error) {
                    console.error('Error fetching users:', error);
                }
            }

            // Fetch bookings
            try {
                const bookingsResponse = await fetch('http://localhost:5002/api/bookings', { headers });
                if (bookingsResponse.ok) {
                    const bookingsData = await bookingsResponse.json();
                    setBookings(bookingsData.data || []);
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
            }

            // Fetch stats
            try {
                const statsResponse = await fetch('http://localhost:5002/api/bookings/stats', { headers });
                if (statsResponse.ok) {
                    const statsData = await statsResponse.json();
                    setStats(statsData.data || {});
                }
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [currentUser?.role]);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userData && token) {
            const user = JSON.parse(userData);
            setCurrentUser(user);

            // Check if user has admin access
            if (!['admin', 'manager', 'ceo'].includes(user.role)) {
                navigate('/dashboard');
                return;
            }

            // Only fetch data if user is properly authenticated
            fetchDashboardData();
        } else {
            // No user or token found, redirect to login
            navigate('/auth');
        }
    }, [navigate, fetchDashboardData]);

    const handleLogout = () => {
        // Clear all state first
        setCurrentUser(null);
        setUsers([]);
        setBookings([]);
        setStats({
            totalUsers: 0,
            totalBookings: 0,
            totalRevenue: 0,
            monthlyRevenue: 0
        });

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Navigate to auth page immediately
        navigate('/auth', { replace: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ceo': return 'bg-purple-100 text-purple-800';
            case 'admin': return 'bg-red-100 text-red-800';
            case 'manager': return 'bg-blue-100 text-blue-800';
            case 'staff': return 'bg-green-100 text-green-800';
            case 'user': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredBookings = bookings.filter(booking =>
        booking.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.status.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && bookings.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {currentUser?.role === 'ceo' ? 'Executive Dashboard' :
                                currentUser?.role === 'manager' ? 'Manager Dashboard' : 'Admin Dashboard'}
                        </h1>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-500">
                                <Bell className="h-6 w-6" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={`https://ui-avatars.com/api/?name=${currentUser?.firstName}+${currentUser?.lastName}&background=f59e0b&color=fff`}
                                    alt="Profile"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {currentUser?.firstName} {currentUser?.lastName}
                                </span>
                                <span className={`ml-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(currentUser?.role || '')}`}>
                                    {currentUser?.role?.toUpperCase()}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-gray-500"
                            >
                                <LogOut className="h-6 w-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 mb-8">
                    <nav className="-mb-px flex space-x-8">
                        {[
                            { id: 'overview', name: 'Overview', icon: BarChart3 },
                            { id: 'bookings', name: 'Bookings', icon: Calendar },
                            ...(currentUser?.role === 'admin' || currentUser?.role === 'ceo' ? [
                                { id: 'users', name: 'Users', icon: Users },
                                { id: 'rooms', name: 'Rooms', icon: Home },
                                { id: 'menu', name: 'Restaurant', icon: Utensils }
                            ] : []),
                            { id: 'settings', name: 'Settings', icon: Settings }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`${activeTab === tab.id
                                    ? 'border-yellow-500 text-yellow-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <tab.icon className="h-5 w-5 mr-2" />
                                {tab.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Users className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.totalUsers}
                                        </p>
                                        <p className="text-gray-600">Total Users</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Calendar className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {stats.totalBookings}
                                        </p>
                                        <p className="text-gray-600">Total Bookings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <DollarSign className="h-8 w-8 text-yellow-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            ${stats.totalRevenue}
                                        </p>
                                        <p className="text-gray-600">Total Revenue</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <BarChart3 className="h-8 w-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            ${stats.monthlyRevenue}
                                        </p>
                                        <p className="text-gray-600">Monthly Revenue</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Bookings */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Bookings</h3>
                            </div>
                            <div className="p-6">
                                {bookings.slice(0, 5).map((booking) => (
                                    <div key={booking._id} className="flex items-center justify-between py-3 border-b border-gray-200 last:border-b-0">
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {booking.user.firstName} {booking.user.lastName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Room {booking.room.number} • {formatDate(booking.checkIn)}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            <span className="font-medium text-gray-900">${booking.totalAmount}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search bookings..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                                    <Filter className="h-4 w-4 mr-2" />
                                    Filter
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Guest
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Room
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Dates
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredBookings.map((booking) => (
                                        <tr key={booking._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {booking.user.firstName} {booking.user.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{booking.user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">Room {booking.room.number}</div>
                                                <div className="text-sm text-gray-500">{booking.room.type}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{formatDate(booking.checkIn)}</div>
                                                <div className="text-sm text-gray-500">to {formatDate(booking.checkOut)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                ${booking.totalAmount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-yellow-600 hover:text-yellow-900 mr-3">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Tab (Admin/CEO only) */}
                {activeTab === 'users' && (currentUser?.role === 'admin' || currentUser?.role === 'ceo') && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
                            <div className="flex items-center space-x-4">
                                <div className="relative">
                                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                </div>
                                <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Staff
                                </button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img
                                                        className="h-10 w-10 rounded-full"
                                                        src={`https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=f59e0b&color=fff`}
                                                        alt=""
                                                    />
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {user.firstName} {user.lastName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                                    {user.role.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.department || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(user.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-yellow-600 hover:text-yellow-900 mr-3">
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-900">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Rooms Management</h2>
                            <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Room
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600">Room management interface coming soon...</p>
                        </div>
                    </div>
                )}

                {/* Restaurant Tab */}
                {activeTab === 'menu' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">Restaurant Management</h2>
                            <button className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Menu Item
                            </button>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600">Menu management interface coming soon...</p>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        value={currentUser?.firstName || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        value={currentUser?.lastName || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={currentUser?.email || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <input
                                        type="text"
                                        value={currentUser?.role || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
