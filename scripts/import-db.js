// Import database from JSON files
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const { User } = require('../backend/models/User');
const { Apartment } = require('../backend/models/Apartment');
const Expense = require('../backend/models/Expense');
const WhatsAppSession = require('../backend/models/WhatsAppSession');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/master_splitter';
const INPUT_DIR = './mongo-backup';

async function importDatabase() {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Import Users
        const usersFile = path.join(INPUT_DIR, 'users.json');
        if (fs.existsSync(usersFile)) {
            console.log('📦 Importing Users...');
            const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
            if (users.length > 0) {
                await User.insertMany(users, { ordered: false }).catch(err => {
                    if (err.code !== 11000) throw err; // Ignore duplicate key errors
                });
                console.log(`✅ Imported ${users.length} users`);
            }
        }

        // Import Apartments
        const apartmentsFile = path.join(INPUT_DIR, 'apartments.json');
        if (fs.existsSync(apartmentsFile)) {
            console.log('📦 Importing Apartments...');
            const apartments = JSON.parse(fs.readFileSync(apartmentsFile, 'utf8'));
            if (apartments.length > 0) {
                await Apartment.insertMany(apartments, { ordered: false }).catch(err => {
                    if (err.code !== 11000) throw err;
                });
                console.log(`✅ Imported ${apartments.length} apartments`);
            }
        }

        // Import Expenses
        const expensesFile = path.join(INPUT_DIR, 'expenses.json');
        if (fs.existsSync(expensesFile)) {
            console.log('📦 Importing Expenses...');
            const expenses = JSON.parse(fs.readFileSync(expensesFile, 'utf8'));
            if (expenses.length > 0) {
                await Expense.insertMany(expenses, { ordered: false }).catch(err => {
                    if (err.code !== 11000) throw err;
                });
                console.log(`✅ Imported ${expenses.length} expenses`);
            }
        }

        // Import WhatsApp Sessions
        const sessionsFile = path.join(INPUT_DIR, 'whatsapp_sessions.json');
        if (fs.existsSync(sessionsFile)) {
            console.log('📦 Importing WhatsApp Sessions...');
            const sessions = JSON.parse(fs.readFileSync(sessionsFile, 'utf8'));
            if (sessions.length > 0) {
                await WhatsAppSession.insertMany(sessions, { ordered: false }).catch(err => {
                    if (err.code !== 11000) throw err;
                });
                console.log(`✅ Imported ${sessions.length} WhatsApp sessions`);
            }
        }

        console.log('\n🎉 Database import completed!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error importing database:', error);
        process.exit(1);
    }
}

importDatabase();



