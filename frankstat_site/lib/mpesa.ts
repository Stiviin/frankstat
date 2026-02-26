import axios from 'axios';

// Cache access token
let cachedToken: { token: string; expiresAt: number } | null = null;

const getAccessToken = async () => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString('base64');

  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    {
      headers: { Authorization: `Basic ${auth}` },
    }
  );

  const token = response.data.access_token;
  // Cache for 3500 seconds
  cachedToken = { token, expiresAt: Date.now() + 3500 * 1000 };
  return token;
};

export const initiateSTKPush = async (phone: string, amount: number, orderId: string) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  // --- FIX: Robust Phone Number Formatting ---
  // 1. Remove all non-digits (spaces, +, etc)
  let formattedPhone = phone.replace(/\D/g, '');

  // 2. Handle local formats (07xx, 01xx, 7xx, 1xx) -> convert to 2547xx
  if (formattedPhone.startsWith('0')) {
    formattedPhone = '254' + formattedPhone.substring(1);
  } else if (formattedPhone.startsWith('7') || formattedPhone.startsWith('1')) {
    // Covers input like "712345678"
    formattedPhone = '254' + formattedPhone;
  } else if (formattedPhone.startsWith('254')) {
    // Already correct, do nothing
  } else {
    // Fallback for unexpected formats (prevent crash, though might fail at Safaricom)
    console.warn(`Unexpected phone format: ${phone}`);
  }
  
  // 3. Final validation (optional but good for debugging)
  if (formattedPhone.length !== 12) {
     throw new Error(`Invalid phone number length after formatting: ${formattedPhone}`);
  }
  // ------------------------------------------

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: process.env.MPESA_PASSWORD,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount), 
    PartyA: formattedPhone, // The phone number paying
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone, // Same as PartyA
    CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
    AccountReference: `ORDER-${orderId.substring(0, 8)}`,
    TransactionDesc: 'Deposit Payment for Printing',
  };

  try {
    console.log(`Initiating STK Push to: ${formattedPhone}`); // Debug log
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  } catch (error: any) {
    console.error('STK Push Error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};