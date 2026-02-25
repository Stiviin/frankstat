import axios from 'axios';

// Cache access token to prevent re-fetching for every request
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
  // Token expires in 3600s, we cache it for 3500s to be safe
  cachedToken = { token, expiresAt: Date.now() + 3500 * 1000 };
  return token;
};

export const initiateSTKPush = async (phone: string, amount: number, orderId: string) => {
  const token = await getAccessToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString('base64');

  // Clean phone number (remove +254 or 0, ensure 254 format)
  const formattedPhone = phone.startsWith('0') 
    ? `254${phone.substring(1)}` 
    : (phone.startsWith('+') ? phone.substring(1) : phone);

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount), // Round up for safety
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
    AccountReference: `ORDER-${orderId.substring(0, 8)}`,
    TransactionDesc: 'Deposit Payment for Printing',
  };

  try {
    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data; // Contains MerchantRequestID, CheckoutRequestID
  } catch (error: any) {
    console.error('STK Push Error:', error.response?.data || error.message);
    throw new Error('Failed to initiate M-Pesa payment');
  }
};