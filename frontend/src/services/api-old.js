import axios from 'axios';

// Environment-based configuration
const config = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002',
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
};

// Create axios instance with production-ready configuration
const api = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false,
});

// Request retry configuration
let retryCount = 0;

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() };
        
        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with retry logic
api.interceptors.response.use(
    (response) => {
        // Calculate request duration
        if (response.config.metadata) {
            const duration = new Date() - response.config.metadata.startTime;
            if (import.meta.env.VITE_ENABLE_DEBUG === 'true') {
                console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
            }
        }
        
        retryCount = 0; // Reset retry count on success
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle network errors and specific status codes
        if (
            (!error.response || 
             error.response.status >= 500 || 
             error.code === 'NETWORK_ERROR' ||
             error.code === 'ECONNABORTED') &&
            retryCount < config.retries &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            retryCount++;
            
            console.warn(`API request failed, retrying... (${retryCount}/${config.retries})`);
            
            // Exponential backoff
            const delay = config.retryDelay * Math.pow(2, retryCount - 1);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return api(originalRequest);
        }
        
        // Handle 401 errors (token expired)
        if (error.response?.status === 401) {
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/auth') && !currentPath.includes('/login')) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/auth';
                return Promise.reject(new Error('Session expired. Please login again.'));
            }
        }
        
        // Enhanced error logging
        console.error('API Error:', {
            url: originalRequest?.url,
            method: originalRequest?.method,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data
        });
        
        retryCount = 0; // Reset retry count
        return Promise.reject(error);
    }
);

// Utility function for handling API errors
const handleApiError = (error, context = '') => {
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'An unexpected error occurred';
    
    const errorDetails = {
        message: errorMessage,
        status: error.response?.status,
        context,
        timestamp: new Date().toISOString()
    };
    
    // Log error in development
    if (import.meta.env.VITE_ENVIRONMENT === 'development') {
        console.error('API Error:', errorDetails);
    }
    
    // You can add error reporting service here
    // reportError(errorDetails);
    
    throw new Error(errorMessage);
};

// Enhanced Auth service with better error handling
export const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/api/auth/login', credentials);
            return response.data;
        } catch (error) {
            handleApiError(error, 'auth.login');
        }
    },
    
    register: async (userData) => {
        try {
            const response = await api.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'auth.register');
        }
    },
    
    logout: async () => {
        try {
            // Call backend logout endpoint
            await api.post('/api/auth/logout');
        } catch (error) {
            // Don't throw error on logout failure, just log it
            console.warn('Logout API call failed:', error.message);
        } finally {
            // Always clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    
    getCurrentUser: async () => {
        try {
            const response = await api.get('/api/auth/me');
            return response.data;
        } catch (error) {
            handleApiError(error, 'auth.getCurrentUser');
        }
    },
    
    updateProfile: async (userData) => {
        try {
            const response = await api.put('/api/auth/profile', userData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'auth.updateProfile');
        }
    },
    
    changePassword: async (passwordData) => {
        try {
            const response = await api.put('/api/auth/change-password', passwordData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'auth.changePassword');
        }
    },
    
    isAuthenticated: () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    },
    
    getToken: () => {
        return localStorage.getItem('token');
    },
    
    getUser: () => {
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('user');
            return null;
        }
    }
};

// Enhanced Rooms service
export const roomsService = {
    getAllRooms: async () => {
        try {
            const response = await api.get('/api/rooms');
            return response.data;
        } catch (error) {
            handleApiError(error, 'rooms.getAllRooms');
        }
    },
    
    getRoomById: async (id) => {
        try {
            if (!id) throw new Error('Room ID is required');
            const response = await api.get(`/api/rooms/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'rooms.getRoomById');
        }
    },
    
    createRoom: async (roomData) => {
        try {
            const formData = createFormData(roomData);
            const response = await api.post('/api/rooms', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'rooms.createRoom');
        }
    },
    
    updateRoom: async (id, roomData) => {
        try {
            if (!id) throw new Error('Room ID is required');
            const formData = createFormData(roomData);
            const response = await api.put(`/api/rooms/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'rooms.updateRoom');
        }
    },
    
    deleteRoom: async (id) => {
        try {
            if (!id) throw new Error('Room ID is required');
            const response = await api.delete(`/api/rooms/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'rooms.deleteRoom');
        }
    }
};

// Utility function to create FormData for file uploads
const createFormData = (data) => {
    const formData = new FormData();

    // Add text fields
    for (const key in data) {
        if (key !== 'images' && key !== 'videos') {
            if (typeof data[key] === 'object' && data[key] !== null) {
                formData.append(key, JSON.stringify(data[key]));
            } else if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        }
    }

    // Add images
    if (data.images && Array.isArray(data.images)) {
        data.images.forEach((image) => {
            if (image instanceof File) {
                formData.append('images', image);
            } else if (typeof image === 'string') {
                formData.append('existingImages', image);
            }
        });
    }

    // Add videos
    if (data.videos && Array.isArray(data.videos)) {
        data.videos.forEach((video) => {
            if (video instanceof File) {
                formData.append('videos', video);
            } else if (typeof video === 'string') {
                formData.append('existingVideos', video);
            }
        });
    }

    return formData;
};

        // Add images
        if (roomData.images && roomData.images.length) {
            roomData.images.forEach((image, index) => {
                if (image instanceof File) {
                    formData.append('images', image);
                } else if (typeof image === 'string') {
                    formData.append('existingImages', image);
                }
            });
        }

        // Add videos
        if (roomData.videos && roomData.videos.length) {
            roomData.videos.forEach((video, index) => {
                if (video instanceof File) {
                    formData.append('videos', video);
                } else if (typeof video === 'string') {
                    formData.append('existingVideos', video);
                }
            });
        }

        const response = await api.put(`/rooms/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteRoom: async (id) => {
        const response = await api.delete(`/rooms/${id}`);
        return response.data;
    }
};

// Menu service
export const menuService = {
    getAllMenuItems: async () => {
        const response = await api.get('/menu');
        return response.data;
    },
    createMenuItem: async (menuData) => {
        const formData = new FormData();

        // Add text fields
        for (const key in menuData) {
            if (key !== 'image') {
                formData.append(key, menuData[key]);
            }
        }

        // Add image
        if (menuData.image instanceof File) {
            formData.append('image', menuData.image);
        } else if (typeof menuData.image === 'string') {
            formData.append('existingImage', menuData.image);
        }

        const response = await api.post('/menu', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    updateMenuItem: async (id, menuData) => {
        const formData = new FormData();

        // Add text fields
        for (const key in menuData) {
            if (key !== 'image') {
                formData.append(key, menuData[key]);
            }
        }

        // Add image
        if (menuData.image instanceof File) {
            formData.append('image', menuData.image);
        } else if (typeof menuData.image === 'string') {
            formData.append('existingImage', menuData.image);
        }

        const response = await api.put(`/menu/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteMenuItem: async (id) => {
        const response = await api.delete(`/menu/${id}`);
        return response.data;
    }
};

// Gallery service
export const galleryService = {
    getAllGalleryItems: async () => {
        const response = await api.get('/gallery');
        return response.data;
    },
    createGalleryItem: async (galleryData) => {
        const formData = new FormData();

        // Add text fields
        for (const key in galleryData) {
            if (key !== 'file') {
                formData.append(key, galleryData[key]);
            }
        }

        // Add file (image or video)
        if (galleryData.file instanceof File) {
            formData.append('file', galleryData.file);
        }

        const response = await api.post('/gallery', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    deleteGalleryItem: async (id) => {
        const response = await api.delete(`/gallery/${id}`);
        return response.data;
    }
};

// Booking service
export const bookingService = {
    createBooking: async (bookingData) => {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },
    getBookings: async () => {
        const response = await api.get('/bookings');
        return response.data;
    },
    createPaymentIntent: async (bookingDetails) => {
        const response = await api.post('/util/create-payment-intent', bookingDetails);
        return response.data;
    }
};

export default {
    authService,
    roomsService,
    menuService,
    galleryService,
    bookingService
};
