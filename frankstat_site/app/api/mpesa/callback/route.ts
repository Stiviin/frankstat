import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Safarican Daraja Callback Structure
    const { Body } = body;
    const { stkCallback } = Body;
    
    const merchantRequestID = stkCallback.MerchantRequestID;
    const checkoutRequestID = stkCallback.CheckoutRequestID;
    const resultCode = stkCallback.ResultCode;
    const resultDesc = stkCallback.ResultDesc;

    // Find the order using the MerchantRequestID we saved earlier
    const order = await prisma.order.findFirst({
      where: { merchantRequestID },
    });

    if (!order) {
      console.error(`Order not found for MerchantRequestID: ${merchantRequestID}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (resultCode === 0) {
      // SUCCESS
      // Extract Metadata (Receipt Number, etc.)
      const callbackMetadata = stkCallback.CallbackMetadata.Item;
      const mpesaReceipt = callbackMetadata.find((item: any) => item.Name === 'MpesaReceiptNumber')?.Value;
      
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID_DEPOSIT',
          mpesaReceipt: mpesaReceipt || 'N/A',
        },
      });
      
      // TODO: Send SMS/Email notification to user/admin here
    } else {
      // FAILED
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'CANCELLED', // Or specific 'PAYMENT_FAILED' status
          specialNotes: `Payment Failed: ${resultDesc}`, // Append to notes
        },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    return NextResponse.json({ error: 'Callback processing failed' }, { status: 500 });
  }
}