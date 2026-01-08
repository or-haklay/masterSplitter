// Script to delete a user by email
require('dotenv').config();
const mongoose = require('mongoose');
const { User } = require('./models/User');

async function deleteUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/master_splitter');
        console.log('✅ Connected to database');

        const email = process.argv[2];
        if (!email) {
            console.log('❌ Please provide an email address');
            console.log('Usage: node delete-user.js email@example.com');
            process.exit(1);
        }

        // Find and delete user
        const user = await User.findOneAndDelete({ email });
        
        if (!user) {
            console.log(`❌ User with email "${email}" not found`);
        } else {
            console.log('\n✅ User deleted successfully:');
            console.log('   Name:', user.name);
            console.log('   Email:', user.email);
            console.log('   Phone:', user.phone);
        }

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

deleteUser();

