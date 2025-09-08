# Grand Hotel Website

A modern, responsive hotel website built with React, TypeScript, Tailwind CSS, and Vite. Enhanced with MongoDB database integration, Cloudinary media storage, JWT authentication, and Stripe payment processing.

<img width="1357" height="596" alt="image" src="https://github.com/user-attachments/assets/8263a754-9852-4410-bf5d-e1ebdc3cd935" />

## Enhanced Features

- **MongoDB Database**: Replaced JSON files with MongoDB for scalable data storage
- **Cloudinary Integration**: Cloud storage for media files (images and videos)
- **JWT Authentication**: Secure authentication with role-based access control
- **Online Booking System**: End-to-end booking process with payment integration
- **Email Notifications**: Placeholder for booking confirmations
- **Payment Processing**: Integration with Stripe for secure payments
- **Responsive Design**: Looks great on all devices from mobile to desktop
- **Admin Dashboard**: Manage rooms, menu items, and gallery content
- **Interactive Components**: Interactive room booking, gallery view, and contact form
- **Backend API**: Express.js backend for data management
- **Clean Architecture**: Separated frontend and backend codebases

## Pages

- **Home**: Welcome page with hotel introduction and featured content
- **Rooms**: Browse different room categories and availability
- **Restaurant**: View the restaurant menu with various meal options
- **Gallery**: Photo gallery showcasing hotel amenities and experiences
- **Contact**: Contact information and inquiry form
- **Admin**: Protected admin dashboard for content management

## Technologies Used

- **React**: Frontend library for building the user interface
- **TypeScript**: Type-safe JavaScript for better developer experience
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Vite**: Next generation frontend tooling for faster development
- **Express.js**: Backend framework for API endpoints
- **Lucide React**: Icons library

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or Atlas)
- Cloudinary account
- Stripe account

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/hotel_Grand_hotel.git
cd hotel_Grand_hotel
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
   - Rename `.env.example` to `.env` in the backend folder
   - Add your MongoDB connection string
   - Add your Cloudinary credentials
   - Add your Stripe API keys
   - Set a JWT secret

4. Run data migration (optional)
```bash
npm run migrate
```

5. Start development servers (frontend and backend)
```bash
npm run dev:all
```

6. Open your browser and visit `http://localhost:5173`

### Admin Access

To access the admin dashboard, navigate to `/admin/login` and use the following default credentials:
- Username: `admin`
- Password: `admin123` (change this in production)

## Project Structure

```
hotel_Grand_hotel/
├── backend/              # Backend server code
│   ├── config/           # Configuration files
│   ├── controllers/      # API controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── services/         # Service layer
│   └── server.js         # Express server entry point
├── public/               # Static assets
├── src/                  # Frontend code
│   ├── components/       # Reusable components
│   │   └── admin/        # Admin components
│   ├── data/             # JSON data files (legacy)
│   ├── pages/            # Page components
│   │   └── admin/        # Admin dashboard pages
│   ├── services/         # Frontend services
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Entry point
├── .env                  # Environment variables
└── README.md             # This file
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- Images from [Unsplash](https://unsplash.com)
- Icons from [Lucide](https://lucide.dev)
