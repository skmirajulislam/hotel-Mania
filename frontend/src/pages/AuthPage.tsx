import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        emailOrPhone: '',
        password: ''
    });

    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        address: {
            street: '',
            city: '',
            state: '',
            country: '',
            zipCode: ''
        }
    });

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name.startsWith('address.')) {
            const addressField = name.split('.')[1];
            setRegisterData({
                ...registerData,
                address: {
                    ...registerData.address,
                    [addressField]: value
                }
            });
        } else {
            setRegisterData({
                ...registerData,
                [name]: value
            });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                // Redirect based on user role
                switch (data.user.role) {
                    case 'user':
                        navigate('/dashboard');
                        break;
                    case 'staff':
                        navigate('/staff-dashboard');
                        break;
                    case 'manager':
                    case 'admin':
                        navigate('/admin-dashboard');
                        break;
                    case 'ceo':
                        navigate('/executive-dashboard');
                        break;
                    default:
                        navigate('/');
                }
            } else {
                setError(data.error || 'Login failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validation
        if (registerData.password !== registerData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (registerData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/dashboard');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-600">
                        {isLogin
                            ? 'Sign in to your account to continue'
                            : 'Join us for an amazing hotel experience'
                        }
                    </p>
                </div>

                <div className="bg-white shadow-xl rounded-lg p-8">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${isLogin
                                ? 'bg-white text-yellow-600 shadow'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <LogIn className="h-4 w-4 inline mr-1" />
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${!isLogin
                                ? 'bg-white text-yellow-600 shadow'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <UserPlus className="h-4 w-4 inline mr-1" />
                            Register
                        </button>
                    </div>

                    {isLogin ? (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email or Phone
                                </label>
                                <input
                                    type="text"
                                    name="emailOrPhone"
                                    value={loginData.emailOrPhone}
                                    onChange={handleLoginChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Enter your email or phone number"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Signing in...' : 'Sign In'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={registerData.firstName}
                                        onChange={handleRegisterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={registerData.lastName}
                                        onChange={handleRegisterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={registerData.email}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={registerData.phone}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={registerData.dateOfBirth}
                                    onChange={handleRegisterChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={registerData.password}
                                            onChange={handleRegisterChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <Eye className="h-4 w-4 text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </button>
                        </form>
                    )}

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-yellow-600 hover:text-yellow-500 text-sm">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
