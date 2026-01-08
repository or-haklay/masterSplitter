// Export database to JSON files
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const { User } = require('../backend/models/User');
const { Apartment } = require('../backend/models/Apartment');
const Expense = require('../backend/models/Expense');
const WhatsAppSession = require('../backend/models/WhatsAppSession');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/master_splitter';
const OUTPUT_DIR = './mongo-backup';

async function exportDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Create output directory
        if (!fs.existsSync(OUTPUT_DIR)) {
            fs.mkdirSync(OUTPUT_DIR, { recursive: true });
        }

        // Export Users
        console.log('📦 Exporting Users...');
        const users = await User.find({}).lean();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'users.json'),
            JSON.stringify(users, null, 2)
        );
        console.log(`✅ Exported ${users.length} users`);

        // Export Apartments
        console.log('📦 Exporting Apartments...');
        const apartments = await Apartment.find({}).lean();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'apartments.json'),
            JSON.stringify(apartments, null, 2)
        );
        console.log(`✅ Exported ${apartments.length} apartments`);

        // Export Expenses
        console.log('📦 Exporting Expenses...');
        const expenses = await Expense.find({}).lean();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'expenses.json'),
            JSON.stringify(expenses, null, 2)
        );
        console.log(`✅ Exported ${expenses.length} expenses`);

        // Export WhatsApp Sessions
        console.log('📦 Exporting WhatsApp Sessions...');
        const sessions = await WhatsAppSession.find({}).lean();
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'whatsapp_sessions.json'),
            JSON.stringify(sessions, null, 2)
        );
        console.log(`✅ Exported ${sessions.length} WhatsApp sessions`);

        console.log('\n🎉 Database export completed!');
        console.log(`📁 Files saved in: ${OUTPUT_DIR}`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error exporting database:', error);
        process.exit(1);
    }
}

exportDatabase();



