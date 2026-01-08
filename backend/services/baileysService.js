const pino = require('pino');

const {useMongoDBAuthState} = require('../utils/mongoAuthState');
const WhatsAppSession = require('../models/WhatsAppSession');

const {analyzeMessageForExpense} = require('./aiService');
const Expense = require('../models/Expense');
const {Apartment} = require('../models/Apartment');
const {User} = require('../models/User');
const { refreshOwned } = require('./ownService');

const SETTINGS = process.env.SETTINGS || 'default';
const connectionStatus = new Map();
const SETUP_PASSWORD = process.env.SETUP_PASSWORD || "1234";

// session map
const session = new Map();

// Dynamic import for baileys (ES Module)
let makeWASocket, DisconnectReason, getContentType, jidNormalizedUser;
let baileysLoaded = false;

async function loadBaileys() {
    if (baileysLoaded) return;
    
    const baileys = await import('@whiskeysockets/baileys');
    makeWASocket = baileys.default;
    DisconnectReason = baileys.DisconnectReason;
    getContentType = baileys.getContentType;
    jidNormalizedUser = baileys.jidNormalizedUser;
    
    baileysLoaded = true;
}

//text export function
function getMessageText(msg){
    if (!msg.message) return '';
    const type = getContentType(msg.message);
    switch(type){
        case 'conversation': return msg.message.conversation;
        case 'extendedTextMessage': return msg.message.extendedTextMessage.text;
        case 'imageMessage': return msg.message.imageMessage.caption;
        default: return '';
    }
} 

// פונקציה לחיפוש משתמש לפי JID (כולל טיפול ב-LID)
async function findUserByJid(apartmentId, senderJid) {
    // אם זה LID - חפש לפי whatsappLid
    if (senderJid.includes('@lid')) {
        const user = await User.findOne({ 
            apartmentId,
            whatsappLid: senderJid 
        });
        
        if (user) {
            console.log(`✅ Found user by LID: ${user.name}`);
            return user;
        }
        
        console.log(`⚠️ No user found with LID: ${senderJid}`);
        return null;
    }
    
    // מספר רגיל
    const phoneNumber = jidNormalizedUser(senderJid).split('@')[0];
    const normalizedPhone = phoneNumber.replace(/^972/, '').replace(/^0/, '');
    
    const user = await User.findOne({ 
        apartmentId,
        $or: [
            { phone: phoneNumber },
            { phone: `0${normalizedPhone}` },
            { phone: `972${normalizedPhone}` },
            { phone: { $regex: normalizedPhone.slice(-9) } }
        ]
    });
    
    if (user) {
        console.log(`✅ Found user by phone: ${user.name}`);
    }
    
    return user;
}


//maon function - start baileys session
async function startSessionForApartment(apartmentId, onQRUpdate = null, onConnected = null){
    
    // טען את baileys אם עוד לא נטען
    await loadBaileys();
    
    const sessionId = apartmentId.toString();
    console.log(`🔄 Starting MongoDB session for apartment: ${sessionId}`);

    const {state, saveCreds} = await useMongoDBAuthState(sessionId);

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // לא מדפיסים ללוג, שולחים ל-Frontend
        logger: pino({level:"silent"}),
        browser: ['Master Splitter', 'Chrome', '10.0'],
        msgRetryCounterCache: new Map()// חשוב למניעת שליחות כפולות
    });

    // שמירה בזיכרון הגלובלי
    session.set(sessionId, sock);

    // connection events
    sock.ev.on('connection.update', async (update) => {
        
        const {connection, lastDisconnect, qr} = update;
        //there is a QR code to be displayed
        if(qr && onQRUpdate){
            console.log(`📷 QR Generated for apartment ${sessionId}`);
            connectionStatus.set(sessionId, 'CONNECTING');
            onQRUpdate(qr);
        }

        //disconnected
        if(connection === 'close'){
            connectionStatus.delete(sessionId);
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(`❌ Connection closed for ${sessionId}. Reconnecting: ${shouldReconnect}`);

            session.delete(sessionId);

            if(shouldReconnect){
                startSessionForApartment(sessionId, onQRUpdate, onConnected);
            }else{
                console.log(`🚪 Logged out. Cleaning up DB data for ${sessionId}`);
                await WhatsAppSession.deleteMany({sessionId: sessionId})
            }
        }
        //connected
        else if(connection === 'open'){
            connectionStatus.set(sessionId, 'CONNECTED');
            console.log(`✅ Connected successfully: ${sessionId}`);
            if (onConnected) onConnected();
        }
    });

    sock.ev.on('creds.update', saveCreds);

    //message events
    sock.ev.on('messages.upsert', async ({messages, type}) => {
        if (type !== 'notify') return;

        for (const msg of messages){
            try{
                if(!msg.message) continue;
                const text = getMessageText(msg)?.trim();
                if(!text) continue;

                //check if message is from a group
                const chatId = msg.key.remoteJid;
                const isGroup = chatId.endsWith('@g.us');

                //get group info from DB
                const apartment = await Apartment.findById(apartmentId);
                if(!apartment) return;

                //1 - setup group chat
                if (text.startsWith(`!connect_group `) && isGroup){
                    const password = text.replace('!connect_group', '').trim();
                    if (password === SETUP_PASSWORD){
                        try {
                            // בדוק אם הקבוצה כבר מחוברת לדירה הזאת
                            if (apartment.whatsappGroupId === chatId) {
                                await sock.sendMessage(chatId, { text: '✅ הקבוצה כבר מקושרת לדירה הזאת!' });
                                continue;
                            }
                            
                            // בדוק אם הקבוצה מחוברת לדירה אחרת
                            const existingApartment = await Apartment.findOne({ whatsappGroupId: chatId });
                            if (existingApartment && existingApartment._id.toString() !== apartmentId) {
                                await sock.sendMessage(chatId, { 
                                    text: '❌ הקבוצה הזאת כבר מחוברת לדירה אחרת!\nאם אתה רוצה לשנות את החיבור, צור קשר עם המנהל.' 
                                });
                                continue;
                            }
                            
                            apartment.whatsappGroupId = chatId;
                            await apartment.save();
                            await sock.sendMessage(chatId, { text: '✅ קבוצה מקושרת בהצלחה!' });
                        } catch (err) {
                            console.error('❌ Error connecting group:', err);
                            if (err.code === 11000) {
                                await sock.sendMessage(chatId, { 
                                    text: '❌ הקבוצה כבר מחוברת. אנא נסה שוב או פנה למנהל.' 
                                });
                            } else {
                                await sock.sendMessage(chatId, { text: '❌ שגיאה בחיבור הקבוצה' });
                            }
                        }
                    }
                    continue;
                }

                //2 - connect user phone to LID (NEW!)
if (text.startsWith('!connect_my ') && isGroup) {
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const senderPushName = msg.pushName || 'Unknown';
    const phone = text.replace('!connect_my', '').trim().replace(/[^0-9]/g, '');
    
    if (!phone || phone.length < 9) {
        await sock.sendMessage(chatId, { 
            text: '❌ מספר טלפון לא תקין. נסה שוב:\n!connect_my 0558827804' 
        });
        continue;
    }
    
    // בדוק שהמשתמש קיים בדירה
    const normalizedPhone = phone.replace(/^972/, '').replace(/^0/, '');
    const user = await User.findOne({
        apartmentId: apartment._id,
        $or: [
            { phone: phone },
            { phone: `0${normalizedPhone}` },
            { phone: `972${normalizedPhone}` },
            { phone: { $regex: normalizedPhone.slice(-9) } }
        ]
    });
    
    if (!user) {
        await sock.sendMessage(chatId, { 
            text: `❌ לא מצאתי משתמש עם המספר ${phone} בדירה הזו.\nודא שנרשמת למערכת עם המספר הנכון.` 
        });
        continue;
    }
    
    // שמור את ה-LID במשתמש
    user.whatsappLid = senderJid;
    await user.save();
    
    await sock.sendMessage(chatId, { 
        text: `✅ הי ${user.name}!\nהמספר שלך קושר בהצלחה. מעכשיו ההוצאות שלך יירשמו אוטומטית 🎉` 
    });
    
    console.log(`✅ LID saved for user ${user.name}: ${senderJid}`);
    continue;
}

            //2 - manage expenses

            //first filter
            if (!isGroup) continue ;
            if(!apartment.whatsappGroupId) continue ; //check if group is connected
            if (chatId !== apartment.whatsappGroupId) continue ; //check if message is from the correct group
            if (!/\d/.test(text) || text.length < 3) continue ; // check for numbers and length

            //check sender
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const senderPushName = msg.pushName || 'Unknown';

            let payingUser = await findUserByJid(apartment._id, senderJid);

        if (!payingUser) {
    console.log(`⚠️ User not found for: ${senderJid} (${senderPushName})`);
    
    // שלח הודעת עזרה רק אם זה LID
    if (senderJid.includes('@lid')) {
        await sock.sendMessage(chatId, { 
            text: `היי ${senderPushName}! 👋\n\nזיהיתי הוצאה אבל אני לא מזהה את המספר שלך.\n\n📱 כדי לקשר את החשבון, שלח:\n!connect_my 0558827804\n\n(החלף במספר שלך)` 
        });
    }
    continue;
}

// LLM analysis
const analysisResult = await analyzeMessageForExpense(text, senderPushName);

if (analysisResult.is_expense && analysisResult.amount > 0){
    await Expense.create({
        apartment: apartment._id,
        title: analysisResult.title,
        amount: analysisResult.amount,
        payer: payingUser._id,
        payerName: payingUser.name,
        rawMessage: text,
        date: new Date()
    });

    await refreshOwned(apartment._id);
    console.log(`💰 Expense saved: ${analysisResult.amount} by ${payingUser.name}`);
}
                // שליחת תגובת אימוג'י ✓ על ההודעה
                await sock.sendMessage(chatId, { 
                    react: { 
                        text: '✅', 
                        key: msg.key 
                    } 
                });
                
            }catch(err){
                console.error(`Error processing msg for apt ${apartmentId}:`, err);
            }
        }
    });

    return sock;
}

// --- שחזור חיבורים בעליית השרת ---

async function initAllActiveSessions(){
    console.log("🔄 Initializing all active WhatsApp sessions from DB...")

    // טען את baileys אם עוד לא נטען
    await loadBaileys();

    // bring all apartments with whatsappSession
    const distinctSessions = await WhatsAppSession.distinct('sessionId');

    for (const apartmentId of distinctSessions){
        if(apartmentId && apartmentId.length > 5){
            startSessionForApartment(apartmentId).catch(err => {
                console.error(`❌ Error starting session for apartment ${apartmentId}:`, err);
            });
        }
    }
}

//status check function
function getSessionStatus(apartmentId){
    const sessionId = apartmentId.toString();
    return connectionStatus.get(sessionId) || 'DISCONNECTED';
}

module.exports = {
    startSessionForApartment,
    initAllActiveSessions,
    getSessionStatus,
}