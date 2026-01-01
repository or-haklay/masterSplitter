// models/Expense.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema; // קיצור דרך נוח
const { ObjectId } = Schema.Types;


const ExpenseSchema = new Schema({
  // --- הוספת הקישור לדירה ---
  apartment: {
    type: ObjectId,
    ref: 'Apartment', 
    required: true,
    index: true 
  },
  // ---------------------------
  title: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  payer: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  payerName: {
    type: String, required: true
  },
  rawMessage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  splitAmong: [{ type: ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Expense', ExpenseSchema);