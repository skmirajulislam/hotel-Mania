import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    User,
    Clock,
    MapPin,
    Phone,
    MessageSquare,
    Utensils,
    Star,
    LogOut,
    Settings,
    Bell,
    Package
} from 'lucide-react';

const UserDashboard: React.FC = () => {
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const [bookings, setBookings] = useState<Record<string, unknown>[]>([]);
    const [serviceRequests, setServiceRequests] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch user bookings
            const bookingsResponse = await fetch('/api/bookings/my-bookings', { headers });
            if (bookingsResponse.ok) {
                const bookingsData = await bookingsResponse.json();
                setBookings(bookingsData.data || []);
            }

            // Fetch service requests
            const requestsResponse = await fetch('/api/bookings/service-requests', { headers });
            if (requestsResponse.ok) {
                const requestsData = await requestsResponse.json();
                setServiceRequests(requestsData.data || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const handleServiceRequest = async (type: string, description: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bookings/service-request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    bookingId: bookings[0]?._id, // Use current booking
                    type,
                    description,
                    priority: 'medium'
                })
            });

            if (response.ok) {
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error('Error creating service request:', error);
        }
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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
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
                        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                        <div className="flex items-center space-x-4">
                            <button className="p-2 text-gray-400 hover:text-gray-500">
                                <Bell className="h-6 w-6" />
                            </button>
                            <div className="flex items-center space-x-2">
                                <img
                                    className="h-8 w-8 rounded-full"
                                    src={`https://ui-avatars.com/api/?name=${user?.firstName}+${user?.lastName}&background=f59e0b&color=fff`}
                                    alt="Profile"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    {user?.firstName} {user?.lastName}
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
                            { id: 'overview', name: 'Overview', icon: Calendar },
                            { id: 'bookings', name: 'My Bookings', icon: MapPin },
                            { id: 'services', name: 'Services', icon: Utensils },
                            { id: 'profile', name: 'Profile', icon: User }
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
                        {/* Welcome Section */}
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
                            <h2 className="text-2xl font-bold mb-2">
                                Welcome back, {user?.firstName}!
                            </h2>
                            <p className="text-yellow-100">
                                Here's what's happening with your bookings and services.
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Calendar className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {bookings.length}
                                        </p>
                                        <p className="text-gray-600">Total Bookings</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <MessageSquare className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {serviceRequests.length}
                                        </p>
                                        <p className="text-gray-600">Service Requests</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Star className="h-8 w-8 text-yellow-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {user?.loyaltyPoints || 0}
                                        </p>
                                        <p className="text-gray-600">Loyalty Points</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Current Booking */}
                        {bookings.length > 0 && (
                            <div className="bg-white rounded-lg shadow">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">Current Booking</h3>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-xl font-semibold text-gray-900">
                                                Room {bookings[0].room?.number || 'N/A'}
                                            </h4>
                                            <p className="text-gray-600 mt-1">
                                                {formatDate(bookings[0].checkIn)} - {formatDate(bookings[0].checkOut)}
                                            </p>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(bookings[0].status)}`}>
                                                {bookings[0].status}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-gray-900">
                                                ${bookings[0].totalAmount}
                                            </p>
                                            <p className="text-gray-600">Total Amount</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <button
                                        onClick={() => handleServiceRequest('housekeeping', 'Room cleaning request')}
                                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <Settings className="h-8 w-8 text-blue-600 mb-2" />
                                        <span className="text-sm font-medium">Housekeeping</span>
                                    </button>

                                    <button
                                        onClick={() => handleServiceRequest('room_service', 'Food delivery request')}
                                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <Utensils className="h-8 w-8 text-green-600 mb-2" />
                                        <span className="text-sm font-medium">Room Service</span>
                                    </button>

                                    <button
                                        onClick={() => handleServiceRequest('maintenance', 'Room maintenance request')}
                                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <Settings className="h-8 w-8 text-yellow-600 mb-2" />
                                        <span className="text-sm font-medium">Maintenance</span>
                                    </button>

                                    <button
                                        onClick={() => handleServiceRequest('concierge', 'General assistance request')}
                                        className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        <Phone className="h-8 w-8 text-purple-600 mb-2" />
                                        <span className="text-sm font-medium">Concierge</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">My Bookings</h2>
                            <button
                                onClick={() => navigate('/rooms')}
                                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700"
                            >
                                Book New Room
                            </button>
                        </div>

                        {bookings.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                                <p className="text-gray-600">Book your first room to get started!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {bookings.map((booking) => (
                                    <div key={booking._id} className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-semibold text-gray-900">
                                                    Room {booking.room?.number || 'N/A'}
                                                </h3>
                                                <p className="text-gray-600 mt-1">
                                                    {booking.room?.type} - {booking.room?.category}
                                                </p>
                                                <div className="mt-4 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Check-in</p>
                                                        <p className="text-gray-900">{formatDate(booking.checkIn)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-500">Check-out</p>
                                                        <p className="text-gray-900">{formatDate(booking.checkOut)}</p>
                                                    </div>
                                                </div>

                                                {booking.packages && booking.packages.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-gray-500 mb-2">Packages</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {booking.packages.map((pkg: any, index: number) => (
                                                                <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    <Package className="h-3 w-3 mr-1" />
                                                                    {pkg.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-right">
                                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                                                    {booking.status}
                                                </span>
                                                <p className="text-2xl font-bold text-gray-900 mt-2">
                                                    ${booking.totalAmount}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Service Requests</h2>

                        {serviceRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow">
                                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No service requests</h3>
                                <p className="text-gray-600">Use quick actions above to request services!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {serviceRequests.map((request) => (
                                    <div key={request._id} className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                                    {request.type.replace('_', ' ')}
                                                </h3>
                                                <p className="text-gray-600 mt-1">{request.description}</p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    <Clock className="h-4 w-4 inline mr-1" />
                                                    {new Date(request.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        value={user?.firstName || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        value={user?.lastName || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        value={user?.phone || ''}
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                                        readOnly
                                    />
                                </div>
                            </div>

                            <div className="mt-6">
                                <button className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserDashboard;
