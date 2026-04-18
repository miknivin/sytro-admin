import dbConnect from '@/lib/db/connection';
import { isAuthenticatedUser } from '@/middlewares/auth';
import Order from '@/models/Order';
import { NextResponse } from 'next/server';
import { normalizePaymentData } from "@/lib/orders/paymentUtils";

export async function POST(req) {
    try {
        await dbConnect();
        const user = await isAuthenticatedUser(req);
        
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Need to login" },
                { status: 401 }
            );
        }

        const body = await req.json();
        
        const {
            orderItems,
            shippingInfo,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount,
            paymentMethod,
            paymentInfo,
            advancePaid,
            advancePaidAt,
            remainingAmount,
            codAmount,
            codChargeCollected,
            advancePayment,
        } = body;

        const normalizedPayment = normalizePaymentData({
            paymentMethod,
            totalAmount,
            itemsPrice,
            advancePaid,
            advancePaidAt,
            remainingAmount,
            codAmount,
            codChargeCollected,
            advancePayment,
        });

        const order = await Order.create({
            orderItems,
            shippingInfo,
            itemsPrice,
            taxAmount,
            shippingAmount,
            totalAmount: normalizedPayment.totalAmount,
            paymentMethod: normalizedPayment.paymentMethod,
            advancePaid: normalizedPayment.advancePaid,
            advancePaidAt: normalizedPayment.advancePaidAt,
            remainingAmount: normalizedPayment.remainingAmount,
            codAmount: normalizedPayment.codAmount,
            codChargeCollected: normalizedPayment.codChargeCollected,
            paymentInfo,
            user: user._id, // Ensure you use the authenticated user
        });

        return NextResponse.json(
            { success: true, order },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
