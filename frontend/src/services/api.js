import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'https://hotel-mania-git-master-skmirajulislams-projects.vercel.app/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercept requests to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth service
export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    },
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

// Rooms service
export const roomsService = {
    getAllRooms: async () => {
        const response = await api.get('/rooms');
        return response.data;
    },
    getRoomById: async (id) => {
        const response = await api.get(`/rooms/${id}`);
        return response.data;
    },
    createRoom: async (roomData) => {
        const formData = new FormData();

        // Add text fields
        for (const key in roomData) {
            if (key !== 'images' && key !== 'videos') {
                if (typeof roomData[key] === 'object') {
                    formData.append(key, JSON.stringify(roomData[key]));
                } else {
                    formData.append(key, roomData[key]);
                }
            }
        }

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

        const response = await api.post('/rooms', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },
    updateRoom: async (id, roomData) => {
        const formData = new FormData();

        // Add text fields
        for (const key in roomData) {
            if (key !== 'images' && key !== 'videos') {
                if (typeof roomData[key] === 'object') {
                    formData.append(key, JSON.stringify(roomData[key]));
                } else {
                    formData.append(key, roomData[key]);
                }
            }
        }

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
