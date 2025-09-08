import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Bell,
    LogOut,
    Settings,
    CheckSquare,
    AlertTriangle,
    MessageSquare
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

interface ServiceRequest {
    _id: string;
    type: string;
    description: string;
    status: string;
    priority: string;
    user: {
        firstName: string;
        lastName: string;
    };
    booking: {
        room: {
            number: string;
        };
    };
    createdAt: string;
}

interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: string;
}

const StaffDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState('tasks');
    const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const user = JSON.parse(userData);
            setCurrentUser(user);

            // Check if user has staff access
            if (!['staff'].includes(user.role)) {
                navigate('/dashboard');
                return;
            }
        }

        fetchStaffData();
    }, [navigate]);

    const fetchStaffData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            // Fetch service requests assigned to this staff member
            const requestsResponse = await fetch(`${API_BASE_URL}/api/bookings/service-requests`, { headers });
            if (requestsResponse.ok) {
                const requestsData = await requestsResponse.json();
                setServiceRequests(requestsData.data || []);
            }
        } catch (error) {
            console.error('Error fetching staff data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/auth');
    };

    const updateRequestStatus = async (requestId: string, status: string) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/bookings/service-request/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                fetchStaffData(); // Refresh data
            }
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDepartmentTasks = () => {
        const department = currentUser?.department?.toLowerCase();

        switch (department) {
            case 'housekeeping':
                return serviceRequests.filter(req => req.type === 'housekeeping' || req.type === 'maintenance');
            case 'food_service':
                return serviceRequests.filter(req => req.type === 'room_service' || req.type === 'restaurant');
            case 'concierge':
                return serviceRequests.filter(req => req.type === 'concierge' || req.type === 'information');
            case 'maintenance':
                return serviceRequests.filter(req => req.type === 'maintenance' || req.type === 'technical');
            default:
                return serviceRequests;
        }
    };

    if (loading && serviceRequests.length === 0) {
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
                        <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
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
                                <div className="text-sm">
                                    <p className="font-medium text-gray-700">
                                        {currentUser?.firstName} {currentUser?.lastName}
                                    </p>
                                    <p className="text-gray-500 capitalize">
                                        {currentUser?.department || 'Staff'} • {currentUser?.role}
                                    </p>
                                </div>
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
                            { id: 'tasks', name: 'My Tasks', icon: CheckSquare },
                            { id: 'schedule', name: 'Schedule', icon: Calendar },
                            { id: 'profile', name: 'Profile', icon: Settings }
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

                {/* Tasks Tab */}
                {activeTab === 'tasks' && (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <AlertTriangle className="h-8 w-8 text-red-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {getDepartmentTasks().filter(req => req.status === 'pending').length}
                                        </p>
                                        <p className="text-gray-600">Pending Tasks</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <Clock className="h-8 w-8 text-blue-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {getDepartmentTasks().filter(req => req.status === 'in_progress').length}
                                        </p>
                                        <p className="text-gray-600">In Progress</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <CheckSquare className="h-8 w-8 text-green-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {getDepartmentTasks().filter(req => req.status === 'completed').length}
                                        </p>
                                        <p className="text-gray-600">Completed</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <div className="flex items-center">
                                    <MessageSquare className="h-8 w-8 text-purple-600" />
                                    <div className="ml-4">
                                        <p className="text-2xl font-semibold text-gray-900">
                                            {getDepartmentTasks().filter(req => req.priority === 'high').length}
                                        </p>
                                        <p className="text-gray-600">High Priority</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Service Requests */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Service Requests - {currentUser?.department ? currentUser.department.replace('_', ' ').toUpperCase() : 'All Departments'}
                                </h3>
                            </div>
                            <div className="p-6">
                                {getDepartmentTasks().length === 0 ? (
                                    <div className="text-center py-12">
                                        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
                                        <p className="text-gray-600">You're all caught up! Check back later for new tasks.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {getDepartmentTasks().map((request) => (
                                            <div key={request._id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2 mb-2">
                                                            <h4 className="text-lg font-semibold text-gray-900 capitalize">
                                                                {request.type.replace('_', ' ')}
                                                            </h4>
                                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(request.priority)}`}>
                                                                {request.priority} priority
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mb-2">{request.description}</p>
                                                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                                                            <span>
                                                                Guest: {request.user.firstName} {request.user.lastName}
                                                            </span>
                                                            <span>
                                                                Room: {request.booking.room.number}
                                                            </span>
                                                            <span>
                                                                Requested: {formatDate(request.createdAt)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(request.status)}`}>
                                                            {request.status.replace('_', ' ')}
                                                        </span>
                                                        {request.status === 'pending' && (
                                                            <button
                                                                onClick={() => updateRequestStatus(request._id, 'in_progress')}
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                                            >
                                                                Start Task
                                                            </button>
                                                        )}
                                                        {request.status === 'in_progress' && (
                                                            <button
                                                                onClick={() => updateRequestStatus(request._id, 'completed')}
                                                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                                            >
                                                                Complete
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Tab */}
                {activeTab === 'schedule' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Schedule</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center">
                                        <Clock className="h-5 w-5 text-yellow-600 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-900">Shift Start</p>
                                            <p className="text-sm text-gray-600">8:00 AM - 4:00 PM</p>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                        Active
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Department</h4>
                                        <p className="text-gray-600 capitalize">
                                            {currentUser?.department?.replace('_', ' ') || 'General Staff'}
                                        </p>
                                    </div>

                                    <div className="p-4 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium text-gray-900 mb-2">Tasks Today</h4>
                                        <p className="text-gray-600">
                                            {getDepartmentTasks().filter(req => req.status !== 'completed').length} pending
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Information</h3>
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
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        value={currentUser?.department?.replace('_', ' ') || 'General'}
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

export default StaffDashboard;
