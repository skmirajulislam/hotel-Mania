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

    throw new Error(errorMessage);
};

// Utility function to create FormData for file uploads
const createFormData = (data) => {
    const formData = new FormData();

    // Add text fields
    for (const key in data) {
        if (key !== 'images' && key !== 'videos' && key !== 'image') {
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

    // Add single image
    if (data.image) {
        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (typeof data.image === 'string') {
            formData.append('existingImage', data.image);
        }
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

// Enhanced Auth service
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
            await api.post('/api/auth/logout');
        } catch (error) {
            console.warn('Logout API call failed:', error.message);
        } finally {
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

    getToken: () => localStorage.getItem('token'),

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
                headers: { 'Content-Type': 'multipart/form-data' }
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
                headers: { 'Content-Type': 'multipart/form-data' }
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

// Enhanced Menu service
export const menuService = {
    getAllMenuItems: async () => {
        try {
            const response = await api.get('/api/menu');
            return response.data;
        } catch (error) {
            handleApiError(error, 'menu.getAllMenuItems');
        }
    },

    createMenuItem: async (menuData) => {
        try {
            const formData = createFormData(menuData);
            const response = await api.post('/api/menu', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'menu.createMenuItem');
        }
    },

    updateMenuItem: async (id, menuData) => {
        try {
            if (!id) throw new Error('Menu item ID is required');
            const formData = createFormData(menuData);
            const response = await api.put(`/api/menu/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'menu.updateMenuItem');
        }
    },

    deleteMenuItem: async (id) => {
        try {
            if (!id) throw new Error('Menu item ID is required');
            const response = await api.delete(`/api/menu/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'menu.deleteMenuItem');
        }
    }
};

// Enhanced Gallery service
export const galleryService = {
    getAllGalleryItems: async () => {
        try {
            const response = await api.get('/api/gallery');
            return response.data;
        } catch (error) {
            handleApiError(error, 'gallery.getAllGalleryItems');
        }
    },

    createGalleryItem: async (galleryData) => {
        try {
            const formData = createFormData(galleryData);
            const response = await api.post('/api/gallery', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'gallery.createGalleryItem');
        }
    },

    updateGalleryItem: async (id, galleryData) => {
        try {
            if (!id) throw new Error('Gallery item ID is required');
            const formData = createFormData(galleryData);
            const response = await api.put(`/api/gallery/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            return response.data;
        } catch (error) {
            handleApiError(error, 'gallery.updateGalleryItem');
        }
    },

    deleteGalleryItem: async (id) => {
        try {
            if (!id) throw new Error('Gallery item ID is required');
            const response = await api.delete(`/api/gallery/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'gallery.deleteGalleryItem');
        }
    }
};

// Enhanced Booking service
export const bookingService = {
    getAllBookings: async () => {
        try {
            const response = await api.get('/api/bookings');
            return response.data;
        } catch (error) {
            handleApiError(error, 'bookings.getAllBookings');
        }
    },

    getBookingById: async (id) => {
        try {
            if (!id) throw new Error('Booking ID is required');
            const response = await api.get(`/api/bookings/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'bookings.getBookingById');
        }
    },

    createBooking: async (bookingData) => {
        try {
            const response = await api.post('/api/bookings', bookingData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'bookings.createBooking');
        }
    },

    updateBooking: async (id, bookingData) => {
        try {
            if (!id) throw new Error('Booking ID is required');
            const response = await api.put(`/api/bookings/${id}`, bookingData);
            return response.data;
        } catch (error) {
            handleApiError(error, 'bookings.updateBooking');
        }
    },

    deleteBooking: async (id) => {
        try {
            if (!id) throw new Error('Booking ID is required');
            const response = await api.delete(`/api/bookings/${id}`);
            return response.data;
        } catch (error) {
            handleApiError(error, 'bookings.deleteBooking');
        }
    },

    getBookingStats: async () => {
        try {
            const response = await api.get('/api/bookings/stats');
            return response.data;
        } catch (error) {
            handleApiError(error, 'bookings.getBookingStats');
        }
    }
};

// Testimonials service
export const testimonialService = {
    getAllTestimonials: async () => {
        try {
            const response = await api.get('/api/testimonials');
            return response.data;
        } catch (error) {
            handleApiError(error, 'testimonials.getAllTestimonials');
        }
    }
};

// Services service
export const servicesService = {
    getAllServices: async () => {
        try {
            const response = await api.get('/api/services');
            return response.data;
        } catch (error) {
            handleApiError(error, 'services.getAllServices');
        }
    }
};

// Packages service
export const packagesService = {
    getAllPackages: async () => {
        try {
            const response = await api.get('/api/packages');
            return response.data;
        } catch (error) {
            handleApiError(error, 'packages.getAllPackages');
        }
    }
};

export default api;
