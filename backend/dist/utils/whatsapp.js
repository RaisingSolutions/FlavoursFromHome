"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = void 0;
const axios_1 = __importDefault(require("axios"));
const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const TOKEN = process.env.GREEN_API_TOKEN;
const sendWhatsAppMessage = async (phoneNumber, message) => {
    if (!INSTANCE_ID || !TOKEN) {
        console.error('WhatsApp not configured - missing INSTANCE_ID or TOKEN');
        return;
    }
    try {
        // Format phone number (remove spaces, add country code if missing)
        const formattedPhone = phoneNumber.replace(/\s/g, '').replace(/^0/, '44');
        console.log(`Sending WhatsApp to: ${formattedPhone}`);
        const response = await axios_1.default.post(`https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${TOKEN}`, {
            chatId: `${formattedPhone}@c.us`,
            message: message
        });
        console.log('WhatsApp message sent successfully:', response.data);
        return response.data;
    }
    catch (error) {
        console.error('WhatsApp send failed:', error.response?.data || error.message);
        console.error('Full error:', error);
        // Don't throw - we don't want order creation to fail if WhatsApp fails
    }
};
exports.sendWhatsAppMessage = sendWhatsAppMessage;
