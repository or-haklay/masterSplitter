const WhatsAppSession = require('../models/WhatsAppSession');

// Dynamic import for baileys (ES Module)
let proto, initAuthCreds, BufferJSON;
let baileysLoaded = false;

async function loadBaileys() {
    if (baileysLoaded) return;
    
    const baileys = await import('@whiskeysockets/baileys');
    proto = baileys.proto;
    initAuthCreds = baileys.initAuthCreds;
    BufferJSON = baileys.BufferJSON;
    
    baileysLoaded = true;
}

const useMongoDBAuthState = async (sessionId) => {
    // טען את baileys אם עוד לא נטען
    await loadBaileys();
    
    //1 - get session from database
    const readData = async (key) =>{
        try {
            // Security check: if the model is not loaded properly
            if (!WhatsAppSession || !WhatsAppSession.findOne) {
                throw new Error('WhatsAppSession model is not defined or invalid');
            }

            const result = await WhatsAppSession.findOne({ sessionId, key });
            
            if (result && result.data) {
                return JSON.parse(JSON.stringify(result.data), BufferJSON.reviver);
            }
            return null;
        } catch (error) {
            // Check if key is defined before logging it
            const keyName = key || 'unknown-key';
            console.error(`❌ Error reading auth key (${keyName}):`, error.message);
            return null;
        }
    };

    //2 - save session to database
    const writeData = async (data, key) => {
        try {
            await WhatsAppSession.updateOne(
                { sessionId, key },
                { 
                    sessionId, 
                    key, 
                    data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)) 
                },
                { upsert: true }
            );
        } catch (error) {
            const keyName = key || 'unknown-key';
            console.error(`❌ Error writing auth key (${keyName}):`, error.message);
        }
    };

    //3 - delete session from database
    const removeData = async (key) => {
        try {
            await WhatsAppSession.deleteOne({ sessionId, key });
        } catch (error) {
            const keyName = key || 'unknown-key';
            console.error(`❌ Error removing auth key (${keyName}):`, error.message);
        }
    };

    // 
    const creds = (await readData('creds')) || initAuthCreds();

    return {
        state: {
            creds,
            keys: {
                get: async (type, ids) => {
                    const data = {};
                    await Promise.all(
                        ids.map(async (id) => {
                            let value = await readData(`${type}-${id}`);
                            if (type === 'app-state-sync-key' && value) {
                                value = proto.Message.AppStateSyncKeyData.fromObject(value);
                            }
                            if (value) {
                                data[id] = value;
                            }
                        })
                    );
                    return data;
                },
                set: async (data) => {
                    const tasks = [];
                    for (const category in data) {
                        for (const id in data[category]) {
                            const value = data[category][id];
                            const key = `${category}-${id}`;
                            if (value) {
                                tasks.push(writeData(value, key));
                            } else {
                                tasks.push(removeData(key));
                            }
                        }
                    }
                    await Promise.all(tasks);
                }
            }
        },
        saveCreds: () => {
            return writeData(creds, 'creds');
        }
    };
};

module.exports = { useMongoDBAuthState };