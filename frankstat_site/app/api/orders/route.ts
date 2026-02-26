import { NextRequest, NextResponse } from 'next/server';
//import { PrismaClient } from '@prisma/client';
import { writeFile, mkdir } from 'fs/promises';
import { prisma } from '@/lib/prisma';
import path from 'path';
import { initiateSTKPush } from '@/lib/mpesa';

//const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // 1. Extract Data
    const serviceId = formData.get('service') as string;
    const dimension = formData.get('dimension') as string;
    const customW = formData.get('customW') as string;
    const customH = formData.get('customH') as string;
    const quantity = parseInt(formData.get('quantity') as string) || 1;
    const paperType = formData.get('paperType') as string;
    const mpesaPhone = formData.get('mpesa') as string;
    const notes = formData.get('notes') as string;
    const totalPrice = parseFloat(formData.get('totalPrice') as string);
    const deposit = parseFloat(formData.get('deposit') as string);
    
    // File Handling
    const file = formData.get('imageFile') as File;
    if (!file) return NextResponse.json({ error: 'Artwork file is required' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    
    // Ensure directory exists (you might need to create 'uploads' folder manually or use fs.mkdir)
    await mkdir(uploadDir, { recursive: true }); 
    await writeFile(`${uploadDir}/${fileName}`, buffer);
    const artworkUrl = `/uploads/${fileName}`;

    // Resolve Dimensions string
    let finalDimensions = dimension;
    if (dimension === 'Custom' && customW && customH) {
      finalDimensions = `${customW}x${customH} ft`;
    }

    // 2. Create Order in Database
    const order = await prisma.order.create({
      data: {
        serviceId,
        serviceName: serviceId.charAt(0).toUpperCase() + serviceId.slice(1), // Simple name, ideally map from ID
        dimensions: finalDimensions,
        quantity,
        finishType: paperType,
        specialNotes: notes,
        totalPrice,
        depositAmount: deposit,
        artworkUrl,
        mpesaPhone: `+254${mpesaPhone}`, // Store with prefix
        status: 'PENDING_PAYMENT',
      },
    });

    // 3. Initiate M-Pesa STK Push
    // Note: Use the deposit amount, not the total price
    try {
      const mpesaResponse = await initiateSTKPush(mpesaPhone, deposit, order.id);
      
      // Save M-Pesa request IDs to database for later callback matching
      await prisma.order.update({
        where: { id: order.id },
        data: {
          merchantRequestID: mpesaResponse.MerchantRequestID,
          checkoutRequestID: mpesaResponse.CheckoutRequestID,
        },
      });

      return NextResponse.json({ 
        success: true, 
        orderId: order.id,
        message: 'Order created. Check your phone for payment prompt.' 
      });
    } catch (mpesaError) {
      // If M-Pesa fails, we might still want to keep the order but mark it, or delete it.
      // Here we return an error but the order is saved with PENDING_PAYMENT.
      return NextResponse.json({ 
        error: 'Order saved but M-Pesa failed to initiate', 
        details: (mpesaError as Error).message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Order Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}