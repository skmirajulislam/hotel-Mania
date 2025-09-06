const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Import seed data
const roomsData = require('./data/rooms_seed.json');
const menuData = require('./data/menu_items_seed.json');
const galleryData = require('./data/gallery_items_seed.json');
const packagesData = require('./data/packages_seed.json');
const servicesData = require('./data/services_seed.json');
const testimonialsData = require('./data/testimonials_seed.json');

// Import models
const Room = require('./models/Room');
const MenuItem = require('./models/MenuItem');
const GalleryItem = require('./models/GalleryItem');
const Package = require('./models/Package');
const Service = require('./models/Service');
const Testimonial = require('./models/Testimonial');

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Room.deleteMany({}),
            MenuItem.deleteMany({}),
            GalleryItem.deleteMany({}),
            Package.deleteMany({}),
            Service.deleteMany({}),
            Testimonial.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create admin user
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@grandhotel.com',
            phone: '+1234567890',
            password: 'admin123',
            role: 'admin',
            department: 'management',
            staffId: 'ADMIN001',
            isActive: true
        });
        await adminUser.save();
        console.log('Created admin user');

        // Create manager user
        const managerUser = new User({
            firstName: 'Manager',
            lastName: 'User',
            email: 'manager@grandhotel.com',
            phone: '+1234567891',
            password: 'manager123',
            role: 'manager',
            department: 'management',
            staffId: 'MGR001',
            isActive: true
        });
        await managerUser.save();
        console.log('Created manager user');

        // Seed rooms
        await Room.insertMany(roomsData);
        console.log(`Seeded ${roomsData.length} rooms`);

        // Seed menu items
        await MenuItem.insertMany(menuData);
        console.log(`Seeded ${menuData.length} menu items`);

        // Seed gallery items
        await GalleryItem.insertMany(galleryData);
        console.log(`Seeded ${galleryData.length} gallery items`);

        // Seed packages
        await Package.insertMany(packagesData);
        console.log(`Seeded ${packagesData.length} packages`);

        // Seed services
        await Service.insertMany(servicesData);
        console.log(`Seeded ${servicesData.length} services`);

        // Seed testimonials
        await Testimonial.insertMany(testimonialsData);
        console.log(`Seeded ${testimonialsData.length} testimonials`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📧 Admin Credentials:');
        console.log('Email: admin@grandhotel.com');
        console.log('Password: admin123');
        console.log('\n📧 Manager Credentials:');
        console.log('Email: manager@grandhotel.com');
        console.log('Password: manager123');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
        process.exit(0);
    }
};

// Run the seed function
seedDatabase();
