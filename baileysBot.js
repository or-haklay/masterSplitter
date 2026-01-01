    const { 
        default: makeWASocket, 
        useMultiFileAuthState, 
        DisconnectReason,
        getContentType,
        jidNormalizedUser
    } = require('@whiskeysockets/baileys');
    const qrcode = require('qrcode-terminal');
    const pino = require('pino');

    const { analyzeMessageForExpense } = require('./backend/services/aiService');
    const Expense = require('./backend/models/Expense');
    const Apartment = require('./backend/models/Apartment');

    const SETUP_PASSWORD = process.env.SETUP_PASSWORD || "1234"
    const AUTH_FOLDER = 'baileys_auth_info';

    let sock; // Global socket instance

    // --- פונקציית עזר: חילוץ טקסט מהודעה ---
    function getMessageText(msg){
        if (!msg.message)return ''

        const type = getContentType(msg.message)

        switch(type){
            case 'conversation':
                return msg.message.conversation
            case 'extendedTextMessage':
                return msg.message.extendedTextMessage.text
            case 'imageMessage':
                return msg.message.imageMessage.caption
            default:
                return ''
        }
    }

    // --- פונקציית עזר: קבלת הדירה ---
    async function getCurrentApartment(){
        let apartment = await Apartment.findById();
        //בעתיד צריך להוסיף את הבקרה על איזה קבוצה פה
        if(!apartment){
            console.log("No apartment found in DB. Creating the defult one");
            apartment = await Apartment.create({name: "Our Apartment"})        
        }
        return apartment;
    }

    // --- הפונקציה הראשית ---
    async function startBaileysBot(){
        console.log('🔄 Initializing Baileys...')

        const {state, saveCreds} = await useMultiFileAuthState(AUTH_FOLDER)

        sock = makeWASocket({
            auth: state,
            logger: pino({level: "silent"}),
            browser: ['Master Splitter', 'Chrome', '10.0']
        })



        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                console.log('\n=== Scan this QR Code ===');
                qrcode.generate(qr, { small: true });
            }
            
            if(connection === 'close'){
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('🔄 Connection closed. Reconnecting...:', shouldReconnect)

                if(shouldReconnect){
                    startBaileysBot()
                }
            }
            else if(connection === 'open'){
                console.log('✅ Master Splitter Bot is Ready (Baileys)!');

                const apt = await getCurrentApartment(); //להשלים את הפרמטר של הקבוצה
                if(apt.whatsappGroupId){
                    console.log(`🎯 Group ID: ${apt.whatsappGroupId}`);
                }else{
                    console.log(`⚠️ There is no Group that connect, "!connect_group ${SETUP_PASSWORD}"`);
                }
            
            }
        })

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({messages, type}) => {
            if (type !== 'notify') return;

            for(const msg of messages){
                try{
                    if (!msg.message) continue;

                    const text = getMessageText(msg)?.trim();
                    if(!text) continue;

                    const chatId = msg.key.remoteJid;
                    const isGroup = chatId.endsWith('@g.us');

                    const apartment = await getCurrentApartment();

                    if (text.startsWith(`!connect_group `) && isGroup){
                        const password = text.replace('!connect_group', '').trim()
                        if (password === SETUP_PASSWORD){
                            apartment.whatsappGroupId = chatId
                            await apartment.save();
                            await sock.sendMessage(chatId, {text:"✅ הקבוצה הוגדרה בהצלחה!"})
                            console.log(`✅ הקבוצה הוגדרה: ${chatId}`);
                        }
                        continue;
                    }

                    if (!isGroup) return
                    if(!apartment.whatsappGroupId) return
                    if (chatId !== apartment.whatsappGroupId) return
                    if(!/\d/.test(text) || text.length < 3) return

                    const senderJid = msg.key.participant || msg.key.remoteJid;
                    const senderNumber = jidNormalizedUser(senderJid).split('@')[0];
                    const senderName = msg.pushName || senderNumber;
                    
                    console.log(`📨 הודעה מ-${senderName}: "${text}"`)

                    const analysisResult = await analyzeMessageForExpense(text, senderName);

                    if (analysisResult.is_expense && analysisResult.amount > 0){
                        console.log(`💰 הוצאה זוהתה: ${analysisResult.amount}₪`)
                        await Expense.create({
                            apartment: apartment._id,
                            title: analysisResult.title,
                            amount: analysisResult.amount,
                            payerName: senderName,
                            rawMessage: text
                        })                    
                    }

                }
                catch(err){
                    console.error("Error processing message (Baileys):", err);
                }
            }
        })  
    }   

    async function generateQRCode(qrCode){

    }

    module.exports = {startBaileysBot};