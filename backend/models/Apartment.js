// models/Apartment.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const ApartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'My Apartment'
  },
  whatsappGroupId: {
    type: String,
    unique: true, 
    sparse: true  // מאפשר שבהתחלה השדה יהיה ריק (לפני ההגדרה)
  },
  inviteCode: {
    type: Object,
    required: true,
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },

  manager: { type: ObjectId, ref: 'User' },
  members: [{ type: ObjectId, ref: 'User' }],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

  const Apartment = mongoose.model('Apartment', ApartmentSchema, 'apartments');

// עדכון אוטומטי של updatedAt לפני שמירה
ApartmentSchema.pre('save', async function() {
  this.updatedAt = Date.now();
});

module.exports = {
  Apartment,
}