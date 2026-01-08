const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Apartment } = require('../models/Apartment')
const { User } = require('../models/User');
const generateInviteCode = require('../utils/generateCode');

async function connectUserToApartment(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        //request validation
        const { apartmentId } = req.params;
        if (!apartmentId) return res.status(400).json({ error: 'Apartment ID is required' });
        
        if (!mongoose.Types.ObjectId.isValid(apartmentId)) {
            return res.status(400).json({ error: 'Invalid Apartment ID format' });
        }

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });

        const userId = decoded.userId;

        //system validation
        const apartment = await Apartment.findById(apartmentId).session(session);
        if (!apartment) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'Apartment not found' });
        }

        const user = await User.findById(userId).session(session);
        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.apartmentId) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'User already connected to an apartment' });
        }

        if (apartment.members.some(memberId => memberId.toString() === userId)) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'User already in the apartment' });
        }

        //process
        user.apartmentId = apartmentId;
        await user.save({ session });

        apartment.members.push(userId);
        await apartment.save({ session });

        await session.commitTransaction();

        //response
        const userResponse = user.toObject();
        delete userResponse.password;

        return res.status(200).json({ 
            message: 'User connected to apartment successfully', 
            apartment: apartment, 
            user: userResponse 
        });

    } catch (err) {
        await session.abortTransaction();
        return res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
}

async function getMyApartment(req, res) {
    try {
        //request validation
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'No token provided' });

        //system validation
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });

        const user = await User.findOne({ _id: decoded.userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        //process
        const apartment = await Apartment.findOne({ _id: user.apartmentId });
        if (!apartment) return res.status(404).json({ error: 'User not connected to an apartment' });

        //response
        return res.status(200).json({ message: 'My apartment retrieved successfully', apartment: apartment });
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function connectToGroup(req, res) {
    try {
        //request validation
        const { groupCode } = req.body;
        if (!groupCode) return res.status(400).json({ error: 'Group code is required' });

        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });
        const userId = decoded.userId;

        //system validation
        const user = await User.findOne({ _id: userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const apartment = await Apartment.findOne({ 'inviteCode.code': groupCode });
        if (!apartment) return res.status(404).json({ error: 'Apartment not found' });

        if (apartment.inviteCode.createdAt < new Date(Date.now() - 1000 * 60 * 5)) {
            return res.status(400).json({ error: 'Invite code expired' });
        }

        //process
        user.apartmentId = apartment._id;
        await user.save();
        apartment.members.push(userId);
        await apartment.save();

        //response
        return res.status(200).json({ message: 'User connected to apartment successfully', apartment: apartment, user: user });

    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

async function getInviteCode(req, res) {
    try {
        //request validation
        const token = req.headers.authorization;
        if (!token) return res.status(401).json({ error: 'No token provided' });

        //system validation
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const apartment = await Apartment.findOne({ _id: user.apartmentId });
        if (!apartment) return res.status(404).json({ error: 'User not connected to an apartment' });

        //process
        const inviteCode = generateInviteCode();
        apartment.inviteCode = {code: inviteCode, createdAt: new Date()};
        await apartment.save();

        //response
        return res.status(200).json({ message: 'Invite code generated successfully', inviteCode: apartment.inviteCode.code });

    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    connectUserToApartment,
    getMyApartment,
    connectToGroup,
    getInviteCode
}