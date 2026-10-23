const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Event = require('./models/Event');
const Booking = require('./models/Booking');

dotenv.config();

const users = [
    { name: 'Admin User', email: 'admin@evora.com', password: 'password123', role: 'admin' },
    { name: 'Demo User', email: 'user@evora.com', password: 'password123', role: 'user' },
    { name: 'Alice Smith', email: 'alice@evora.com', password: 'password123', role: 'user' },
    { name: 'Bob Johnson', email: 'bob@evora.com', password: 'password123', role: 'user' },
    { name: 'Charlie Dave', email: 'charlie@evora.com', password: 'password123', role: 'user' },
    { name: 'Diana Prince', email: 'diana@evora.com', password: 'password123', role: 'user' },
    { name: 'Ethan Hunt', email: 'ethan@evora.com', password: 'password123', role: 'user' },
    { name: 'Fiona Gallagher', email: 'fiona@evora.com', password: 'password123', role: 'user' },
    { name: 'George Miller', email: 'george@evora.com', password: 'password123', role: 'user' },
    { name: 'Hannah Montana', email: 'hannah@evora.com', password: 'password123', role: 'user' }
];
    
const events = [
    {
        title: 'React & Node.js Developer Retreat',
        description: 'Join us for a 3-day deep dive into modern full-stack web development. Perfect for developers looking to take their skills to the next level.',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        location: 'Silicon Valley Innovation Center, CA',
        category: 'Technology',
        totalSeats: 200,
        ticketPrice: 0,
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Neon Nights EDM Festival',
        description: 'Experience an unforgettable night of EDM, techno, and dazzling light shows with top DJs from around the globe.',
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        location: 'Grand Arena, New York',
        category: 'Music',
        totalSeats: 500,
        ticketPrice: 1500,
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Global Leaders Business Summit',
        description: 'A premium gathering of CEOs, founders, and investors discussing the future of global commerce and AI integration.',
        date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        location: 'The Ritz-Carlton, London',
        category: 'Business',
        totalSeats: 150,
        ticketPrice: 5000,
        image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Modern Art Expo 2024',
        description: 'Discover breathtaking contemporary and modern arts from underground and trending artists this season.',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        location: 'Downtown Art Museum',
        category: 'Art',
        totalSeats: 300,
        ticketPrice: 200,
        image: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Startup Pitch & Pitch Competition',
        description: 'Watch 25 startups pitch for 1 million dollars in seed funding. Great networking for entrepreneurs and angel investors.',
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        location: 'Convention Center, Miami',
        category: 'Business',
        totalSeats: 250,
        ticketPrice: 1000,
        image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Cloud Computing Architecture Seminar',
        description: 'A purely technical breakdown of scalable cloud solutions, multi-region routing, and serverless compute processing.',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        location: 'Tech Hub, Seattle',
        category: 'Technology',
        totalSeats: 100,
        ticketPrice: 600,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'AI & Machine Learning Conference',
        description: 'Explore the latest advancements in artificial intelligence, machine learning, generative AI, and real-world AI applications with industry experts.',
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
        location: 'India Expo Centre, Greater Noida',
        category: 'Technology',
        totalSeats: 400,
        ticketPrice: 800,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Live Jazz Under the Stars',
        description: 'Enjoy an enchanting evening of live jazz performances, soulful melodies, talented musicians, and a beautiful outdoor atmosphere.',
        date: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000),
        location: 'Central Park Amphitheater, New York',
        category: 'Music',
        totalSeats: 350,
        ticketPrice: 1200,
        image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'City Marathon & Fitness Expo',
        description: 'Participate in an exciting community marathon featuring fitness challenges, wellness workshops, professional trainers, and exciting prizes.',
        date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        location: 'Buddh International Circuit, Greater Noida',
        category: 'Sports',
        totalSeats: 1000,
        ticketPrice: 500,
        image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Full-Stack Developer Bootcamp',
        description: 'Build practical web development skills through hands-on sessions covering React, Node.js, Express, MongoDB, REST APIs, and deployment.',
        date: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        location: 'Microsoft Office, Noida',
        category: 'Education',
        totalSeats: 150,
        ticketPrice: 999,
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Street Food Carnival',
        description: 'Discover delicious street food, regional Indian specialties, live cooking demonstrations, local food vendors, and exciting culinary experiences.',
        date: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000),
        location: 'DLF Mall of India, Noida',
        category: 'Food',
        totalSeats: 600,
        ticketPrice: 300,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=800'
    },
    {
        title: 'Gaming & Esports Championship',
        description: 'Experience competitive gaming with exciting esports tournaments, live streaming, gaming challenges, community competitions, and exclusive prizes.',
        date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        location: 'India Expo Mart, Greater Noida',
        category: 'Entertainment',
        totalSeats: 500,
        ticketPrice: 700,
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800'
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/evora');
        console.log('\n✅ MongoDB connection open...');

        await User.deleteMany();
        await Event.deleteMany();
        await Booking.deleteMany();
        console.log('🗑️  Cleared existing data.');

        // Hash user passwords
        const salt = await bcrypt.genSalt(10);
        const hashedUsers = users.map(u => ({
            ...u,
            password: bcrypt.hashSync(u.password, salt),
            isVerified: true
        }));

        const createdUsers = await User.insertMany(hashedUsers);
        const adminUser = createdUsers.find(u => u.role === 'admin');
        const normalUsers = createdUsers.filter(u => u.role === 'user');
        console.log(`👤 Created ${createdUsers.length} total dummy users.`);

        // Link events to admin
        const eventsWithAdmin = events.map(e => ({
            ...e,
            availableSeats: e.totalSeats,
            createdBy: adminUser._id
        }));

        const createdEvents = await Event.insertMany(eventsWithAdmin);
        console.log(`🎉 Created ${createdEvents.length} distinct events with Unsplash images.`);

        // Generate Bookings Data
        const bookingsData = [];

        for (const event of createdEvents) {
            // Assign 3-6 random users to each event
            const randomCount = Math.floor(Math.random() * 4) + 3;
            // Shuffle and pick random users
            const shuffledUsers = [...normalUsers].sort(() => 0.5 - Math.random());
            const selectedUsers = shuffledUsers.slice(0, randomCount);

            for (const user of selectedUsers) {
                // Randomize statuses
                const statuses = ['pending', 'confirmed', 'cancelled'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];

                let paymentStatus = 'not_paid';
                if (status === 'confirmed' && event.ticketPrice > 0) {
                    // Usually confirmed tickets are marked paid (90% of the time)
                    paymentStatus = Math.random() > 0.1 ? 'paid' : 'not_paid';
                } else if (event.ticketPrice === 0) {
                    paymentStatus = 'paid';
                }

                bookingsData.push({
                    userId: user._id,
                    eventId: event._id,
                    status: status,
                    paymentStatus: paymentStatus,
                    amount: event.ticketPrice
                });

                // Deduct available seats specifically for confirmed tickets!
                if (status === 'confirmed') {
                    event.availableSeats -= 1;
                    await event.save();
                }
            }
        }

        await Booking.insertMany(bookingsData);
        console.log(`🎫 Inserted ${bookingsData.length} randomized dummy bookings (confirmed, pending, cancelled, paid, not_paid).`);

        console.log('\n🚀 Database seeded successfully!');
        console.log('-------------------------------------------');
        console.log('Admin Email: admin@evora.com');
        console.log('User Email:  user@evora.com');
        console.log('Password for all users: password123');
        console.log('-------------------------------------------\n');

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
};

seedDatabase();