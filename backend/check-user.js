// Quick script to check a specific user
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/User');

async function checkUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/master_splitter');
        console.log('✅ Connected to database');

        // Find user by email
        const email = process.argv[2] || 'or1@gmail.com';
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            console.log(`❌ User with email "${email}" not found`);
        } else {
            console.log('\n👤 User found:');
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Phone:', user.phone);
            console.log('   Password exists:', !!user.password);
            console.log('   Password length:', user.password ? user.password.length : 0);
            console.log('   Apartment ID:', user.apartmentId);
            console.log('   Balance:', user.balance);
            console.log('   Created:', user.createdAt);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUser();

