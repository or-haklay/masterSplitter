const {startSessionForApartment, getSessionStatus} = require('../services/baileysService');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Apartment } = require('../models/Apartment');
const { User } = require('../models/User');
const generateInviteCode = require('../utils/generateCode');

let qrCache = new Map();

async function connectApartment(req, res){
    try{
        //request validation - apartmentId יכול להיות undefined (אם ה-route היה בלי פרמטר)
        const {apartmentId} = req.params;
        
        // קבל את המשתמש מה-token
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });
        
        const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) return res.status(401).json({ error: 'Invalid token' });
        
        const user = await User.findOne({ _id: decoded.userId });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        let finalApartmentId = apartmentId || undefined;
        let apartment = null;
        
        // אם יש apartmentId בפרמטרים, נסה להשתמש בו
        if (apartmentId && mongoose.Types.ObjectId.isValid(apartmentId)) {
            apartment = await Apartment.findOne({ _id: apartmentId });
            if (apartment) {
                finalApartmentId = apartmentId;
            }
        }
        
        // אם אין דירה (או לא שלחו apartmentId), בדוק אם למשתמש יש דירה
        if (!apartment && user.apartmentId) {
            apartment = await Apartment.findOne({ _id: user.apartmentId });
            if (apartment) {
                finalApartmentId = user.apartmentId.toString();
            }
        }
        
        // אם עדיין אין דירה, צור דירה חדשה
if (!apartment) {
    try {
        // 🔍 בדיקה נוספת - אולי למשתמש כבר יש דירה שנוצרה באמצע
        const existingApartment = await Apartment.findOne({ 
            manager: user._id 
        });
        
        if (existingApartment) {
            // נמצאה דירה קיימת, השתמש בה
            apartment = existingApartment;
            finalApartmentId = apartment._id.toString();
            
            // עדכן את המשתמש אם צריך
            if (!user.apartmentId || user.apartmentId.toString() !== finalApartmentId) {
                user.apartmentId = apartment._id;
                await user.save({ validateBeforeSave: false });
            }
        } else {
            // באמת אין דירה, צור אחת חדשה
            const inviteCode = generateInviteCode();
            
            apartment = await Apartment.create({
                name: `${user.name}'s Apartment`,
                inviteCode: {
                    code: inviteCode,
                    createdAt: new Date()
                },
                manager: user._id,
                members: [user._id]
            });
            
            finalApartmentId = apartment._id.toString();
            
            user.apartmentId = apartment._id;
            await user.save({ validateBeforeSave: false });
        }
    } catch (err) {
        console.error(`❌ Error creating apartment:`, err);
        throw err;
    }
}

        //system validation - בדוק סטטוס חיבור
        const status = getSessionStatus(finalApartmentId);
        if (status === 'CONNECTED'){
            return res.status(200).json({message: 'Apartment is already connected', status: 'CONNECTED'});
        }

        // process - התחל תהליך חיבור
        await startSessionForApartment(finalApartmentId, (qrCode) => {
            qrCache.set(finalApartmentId, qrCode);
        }, () => {
            qrCache.delete(finalApartmentId);
        })
        
        //response
        return res.status(200).json({
            message: 'Connection process started. Please poll for QR.', 
            status: 'INITIALIZING',
            apartmentId: finalApartmentId // החזר את ה-apartmentId (חדש או קיים)
        });

    }catch(err){
        return res.status(500).json({error: err.message});
    }
}

function getQRCode(req, res){
    try{
    //request validation
    const {apartmentId} = req.params;
    if(!apartmentId) return res.status(400).json({error: 'Apartment ID is required'});

    //system validation
    const qrCode = qrCache.get(apartmentId);
    if (!qrCode) {
        // בדיקה האם הסיבה היא שאנחנו כבר מחוברים
        if (getSessionStatus(apartmentId) === 'CONNECTED') {
            return res.status(409).json({ error: "Already connected" }); // 409 Conflict
        }
        return res.status(404).json({ error: "QR not ready yet" });
    }
    //response
    return res.status(200).json({qrCode});
    }catch(err){
        return res.status(500).json({error: err.message});
    }
}

function getStatus(req, res){
    try{
        //request validation
        const {apartmentId} = req.params;
        if(!apartmentId) return res.status(400).json({error: 'Apartment ID is required'});
        //system validation
        const status = getSessionStatus(apartmentId);
        if(status === 'DISCONNECTED') return res.status(404).json({error: 'Apartment not connected'});
        //response
        return res.status(200).json({ status});
    }catch(err){
        return res.status(500).json({error: err.message});
    }
}

module.exports = {
    connectApartment,
    getQRCode,
    getStatus
}