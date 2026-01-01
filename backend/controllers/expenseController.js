const Expense = require('../models/Expense');
const {Apartment} = require('../models/Apartment');
const { User } = require('../models/User');
const { refreshOwned } = require('../services/ownService');
const jwt = require('jsonwebtoken');

// --- create manual expense (via website) ---
async function createManualExpense(req, res) {
    try {
        //request validation
        const { apartmentId, title, amount, date, payer, payerName, rawMessage, splitAmong } = req.body;
        
        if (!apartmentId) return res.status(400).json({ error: 'Apartment ID is required' });
        if (!title) return res.status(400).json({ error: 'Title is required' });

        if (!amount || isNaN(amount)) return res.status(400).json({ error: 'Valid amount is required' });
        if (!payer) return res.status(400).json({ error: 'Payer ID (payer) is required' });

        //system validation
        const apartment = await Apartment.findOne({ _id: apartmentId });
        if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

        const user = await User.findOne({ _id: payer });
        if (!user) return res.status(404).json({ error: 'Paying user not found' });

        // check if the user is really a member of the apartment (optional but recommended)
        // note: this depends on whether members store ID or objects, here we assumed ObjectId
        if (!apartment.members.some(member => member.toString() === payer)) {
             return res.status(400).json({ error: 'User is not a member of this apartment' });
        }

        //process
        const newExpense = await Expense.create({
            apartment: apartmentId,
            title,
            amount,
            payer, 
            payerName: payerName || user.name, // save the name for backup
            date: date || new Date(),
            rawMessage: rawMessage || 'Manual entry via website',
            splitAmong: splitAmong || null
        });

        await refreshOwned(apartmentId);
        //response
        return res.status(201).json({ status: 201, message: 'Expense created successfully', expense: newExpense });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// --- get all expenses of an apartment ---
async function getApartmentExpenses(req, res) {
    try {
        //request validation
        const { apartmentId } = req.params;
        if (!apartmentId) return res.status(400).json({ error: 'Apartment ID is required' });

        //system validation
        const apartment = await Apartment.findOne({ _id: apartmentId });
        if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

        //process
        // get expenses, sort by date (new to old), דand fill the payer details
        const expenses = await Expense.find({ apartment: apartment._id })
            .sort({ createdAt: -1 })
        
        refreshOwned(apartmentId);
        //response
        return res.status(200).json({ message: 'Expenses retrieved successfully', expenses });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getMyApartmentExpenses(req, res) {
    try {
        //request validation
        const token = req.headers.authorization;
        if (!token) return res.status(400).json({ error: 'Token is required' });
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });
        const userId = decoded.userId;
        


        //system validation
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const apartment = await Apartment.findOne({ _id: user.apartmentId });
        if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

        //process
        // get expenses, sort by date (new to old), דand fill the payer details
        const expenses = await Expense.find({ apartment: apartment._id })
            .sort({ createdAt: -1 })
        
        refreshOwned(apartment._id);

        //response
        return res.status(200).json({ message: 'Expenses retrieved successfully', expenses });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// --- delete expense ---
async function deleteExpense(req, res) {
    try {
        //request validation
        const { expenseId } = req.params;
        if (!expenseId) return res.status(400).json({ error: 'Expense ID is required' });

        //system validation
        const expense = await Expense.findOne({ _id: expenseId });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        //process
        await Expense.findOneAndDelete({ _id: expenseId });

        //response
        return res.status(200).json({ message: 'Expense deleted successfully', deletedId: expenseId });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

// --- update expense ---
async function updateExpense(req, res) {
    try {
        //request validation
        const { expenseId } = req.params;
        const updates = req.body; // { title, amount, ... }
        
        if (!expenseId) return res.status(400).json({ error: 'Expense ID is required' });
        if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'No fields to update' });

        //system validation
            const expense = await Expense.findOne({ _id: expenseId });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        //process
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: expenseId }, 
            { $set: updates }, 
            { new: true, runValidators: true }
        ).populate('payer', 'name');

        //response
        return res.status(200).json({ message: 'Expense updated successfully', expense: updatedExpense });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getExpense(req, res) {
    try {
        //request validation
        const { expenseId } = req.params;
        if (!expenseId) return res.status(400).json({ error: 'Expense ID is required' });

        //system validation
        const expense = await Expense.findOne({ _id: expenseId });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
        
        //populate payer
        const populatedExpense = await expense.populate('payer', 'name');
        refreshOwned(expense.apartment);
        //response
        return res.status(200).json({ message: 'Expense retrieved successfully', expense: populatedExpense });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}



module.exports = {
    createManualExpense,
    getApartmentExpenses,
    deleteExpense,
    updateExpense,
    getMyApartmentExpenses,
    getExpense,
}