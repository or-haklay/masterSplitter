const { User, validateUserRegister, validateUserLogin } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();


async function registerUser(req, res) {
    try{
        //request validation
        const error = validateUserRegister(req.body);
        if(error) return res.status(400).json({ error: error });
        
        const { name, phone, email, password } = req.body;
        //system validation
        const existingPhone = await User.findOne({ phone });
        const existingEmail = await User.findOne({ email });

        if(existingPhone) return res.status(409).json({ error: 'Phone number already exists' });
        if(existingEmail) return res.status(409).json({ error: 'Email already exists' });


        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        //process
        const user = await User.create({ name, phone, email, password: hashedPassword });
        //generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        //response
        return res.status(201).json({ message: 'User registered successfully', user: user, token: token });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function loginUser(req, res) {
    try{
        //request validation
        const error = validateUserLogin(req.body);
        if(error) return res.status(400).json({ error: error });

        const { email, password } = req.body;
        //system validation
        const user = await User.findOne({ email }).select('+password');
        if(!user) return res.status(401).json({ error: 'Invalid email or password' });
        //compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid) return res.status(401).json({ error: 'Invalid email or password' });

        //generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        //response
        return res.status(200).json({ message: 'User logged in successfully', token: token });
    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function getUser(req, res) {
    try{
        //request validation
        const token = req.headers.authorization;
        if(!token) return res.status(400).json({ error: 'Token is required' });
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({ error: 'Invalid token' });
        //get user
        const user = await User.findById(decoded.userId);
        if(!user) return res.status(401).json({ error: 'User not found' });
        //response
        return res.status(200).json({ message: 'User found successfully', user: user });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function getUserById(req, res) {
    try{
        //request validation
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({ error: 'User ID is required' });
        //get user
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error: 'User not found' });
        //response
        return res.status(200).json({ message: 'User found successfully', user: user });

    }catch(err){
        return res.status(500).json({ error: err.message });
    }
}

async function updateUser(req, res) {
    try{
        //request validation
        const isValidate = validateUserUpdate(req.body);
        if(!isValidate) return res.status(400).json({ error: isValidate });

        const token = req.headers.authorization;
        const userId = req.params.userId;
        if(!token) return res.status(400).json({ error: 'Token is required' });
        if(!userId) return res.status(400).json({ error: 'User ID is required' });
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({ error: 'Invalid token' });
        if(decoded.userId !== userId) return res.status(401).json({ error: 'Unauthorized' });

        //system validation
        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ error: 'User not found' });
        
        //process

        //response
        return res.status(200).json({ message: 'User updated successfully', user: user });
    }catch(err){
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}

async function getMyOwnedUsers(req, res) {
    try{
        //request validation
        const token = req.headers.authorization;
        if(!token) return res.status(400).json({ error: 'Token is required' });
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded) return res.status(401).json({ error: 'Invalid token' });
        //system validation
        const user = await User.findById(decoded.userId);
        if(!user) return res.status(404).json({ error: 'User not found' });

        //response
        return res.status(200).json({ message: 'Owned found successfully', owned: user.owned });
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
}

module.exports = {
    registerUser, 
    loginUser,
    getUser,
    getUserById,
    getMyOwnedUsers,
};