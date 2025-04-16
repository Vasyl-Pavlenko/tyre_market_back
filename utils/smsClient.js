const axios = require('axios');

const SMSCLUB_API_URL = process.env.SMSCLUB_API_URL;
const SMSCLUB_TOKEN = process.env.SMSCLUB_TOKEN;

const sendSMS = async ({ phone, message, src_addr = 'AUTO' }) => {
  try {
    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    const phones = Array.isArray(phone) ? phone : [phone];

    const response = await axios.post(
      SMSCLUB_API_URL,
      {
        phone: phones,
        message,
        src_addr,
      },
      {
        headers: {
          Authorization: `Bearer ${SMSCLUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('SMS send error:', error.response?.data || error.message);

    // Provide more specific error response
    if (error.response && error.response.data) {
      throw new Error(`SMS error: ${error.response.data.message}`);
    }

    throw new Error('Unknown SMS send error');
  }
};

module.exports = { sendSMS };
