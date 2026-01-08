const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;
const JOI = require('joi');



const UserSchema = new Schema({
    _id: { type: ObjectId, auto: true },
    name:  { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, select: false },

    apartmentId: { type: ObjectId, ref: 'Apartment' },
    whatsappLid: { type: String, default: null },
    owned: [{ 
        owner: { type: ObjectId, ref: 'User' },
        ownerName: { type: String, required: true },
        owned: { type: ObjectId, ref: 'User' },
        ownedName: { type: String, required: true },
        amount: { type: Number, default: 0 }
    }], 
    balance: { type: Number, default: 0 },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { minimize: false })

const User = mongoose.model('User', UserSchema, 'users');

const userRegisterValidationSchema = JOI.object({
    name: JOI.string().required(),
    phone: JOI.string().required().pattern(/^[0-9]{10}$/),
    email: JOI.string().required().email(),
    password: JOI.string().required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d@$!%*?&]{8,}$/),
})

const validateUserRegister = (user) => {
    const result = userRegisterValidationSchema.validate(user);
    return result.error ? result.error : null;
}

const userLoginValidationSchema = JOI.object({
    email: JOI.string().required().email(),
    password: JOI.string().required().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d])[A-Za-z\d@$!%*?&]{8,}$/),
})

const validateUserLogin = (user) => {
    const result = userLoginValidationSchema.validate(user);
    return result.error ? result.error.message : null;
}


module.exports = {
    User,
    validateUserRegister,
    validateUserLogin
}