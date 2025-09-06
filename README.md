# Grand Hotel Management System

A full-stack hotel management system built with React, Node.js, Express, and MongoDB.

## Features

- 🏨 Room management and booking system
- 🍽️ Restaurant menu management
- 🖼️ Gallery management
- 👥 User authentication and role-based access
- 📊 Admin dashboard with analytics
- 💳 Payment integration with Stripe
- ☁️ Image upload with Cloudinary

## Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- Lucide React for icons

**Backend:**
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Cloudinary for image storage
- Stripe for payments

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hotel_Grand_hotel
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**
   
   Copy the environment example file:
   ```bash
   cp backend/.env.example backend/.env
   ```
   
   Update `backend/.env` with your actual values:
   ```env
   MONGODB_URI='your_mongodb_connection_string'
   JWT_SECRET='your_jwt_secret_key'
   JWT_EXPIRATION=30d
   CLOUDINARY_CLOUD_NAME='your_cloudinary_cloud_name'
   CLOUDINARY_API_KEY='your_cloudinary_api_key'
   CLOUDINARY_API_SECRET='your_cloudinary_api_secret'
   STRIPE_SECRET_KEY='your_stripe_secret_key'
   STRIPE_PUBLISHABLE_KEY='your_stripe_publishable_key'
   PORT=5002
   ```

5. **Seed the Database**
   ```bash
   cd backend
   node seed.js
   ```

6. **Start the Application**
   
   Start the backend server:
   ```bash
   cd backend
   npm start
   ```
   
   Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

## Default Credentials

After running the seed script:

**Admin Account:**
- Email: admin@grandhotel.com
- Password: admin123

**Manager Account:**
- Email: manager@grandhotel.com
- Password: manager123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create room (admin only)
- `PUT /api/rooms/:id` - Update room (admin only)
- `DELETE /api/rooms/:id` - Delete room (admin only)

### Menu
- `GET /api/menu` - Get all menu items
- `POST /api/menu` - Create menu item (admin only)

### Gallery
- `GET /api/gallery` - Get all gallery items
- `POST /api/gallery` - Create gallery item (admin only)

### Bookings
- `GET /api/bookings` - Get all bookings (admin/manager)
- `POST /api/bookings` - Create booking
- `GET /api/bookings/stats` - Get booking statistics

## Deployment

1. **Backend Deployment**
   - Deploy to platforms like Heroku, Railway, or DigitalOcean
   - Set environment variables in your hosting platform
   - Ensure MongoDB is accessible

2. **Frontend Deployment**
   - Build the frontend: `npm run build`
   - Deploy to Vercel, Netlify, or any static hosting service
   - Update API URLs to point to your backend deployment

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, email support@grandhotel.com or create an issue in the repository.
