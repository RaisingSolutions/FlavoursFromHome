import axios from 'axios';

const INSTANCE_ID = process.env.GREEN_API_INSTANCE_ID;
const TOKEN = process.env.GREEN_API_TOKEN;

export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  if (!INSTANCE_ID || !TOKEN) {
    console.error('WhatsApp not configured - missing INSTANCE_ID or TOKEN');
    return;
  }
  
  try {
    // Format phone number (remove spaces, add country code if missing)
    const formattedPhone = phoneNumber.replace(/\s/g, '').replace(/^0/, '44');
    console.log(`Sending WhatsApp to: ${formattedPhone}`);
    
    const response = await axios.post(
      `https://api.green-api.com/waInstance${INSTANCE_ID}/sendMessage/${TOKEN}`,
      {
        chatId: `${formattedPhone}@c.us`,
        message: message
      }
    );
    
    console.log('WhatsApp message sent successfully:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('WhatsApp send failed:', error.response?.data || error.message);
    console.error('Full error:', error);
    // Don't throw - we don't want order creation to fail if WhatsApp fails
  }
};
