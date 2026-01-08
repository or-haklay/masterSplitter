const mongoose = require('mongoose');
const {User} = require('./models/User');
const {Apartment} = require('./models/Apartment');
const Expense = require('./models/Expense');

mongoose.connect('mongodb://localhost:27017/master_splitter').then(async () => {
    const userCount = await User.countDocuments();
    const apartmentCount = await Apartment.countDocuments();
    const expenseCount = await Expense.countDocuments();
    
    console.log('✅ Database contents:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Apartments: ${apartmentCount}`);
    console.log(`   Expenses: ${expenseCount}`);
    
    process.exit(0);
});



