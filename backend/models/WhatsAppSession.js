const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { ObjectId } = Schema.Types;

const WhatsAppSessionSchema = new Schema({
    sessionId: { type: String, required: true },
    key: { type: String, required: true },
    data: { type: Object, required: true },
})

WhatsAppSessionSchema.index({ sessionId: 1, key: 1 }, { unique: true });

const WhatsAppSession = mongoose.model('WhatsAppSession', WhatsAppSessionSchema, 'whatsapp_sessions');

module.exports = WhatsAppSession;