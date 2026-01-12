// app/api/orders/webhook/schedule-pickup/[orderId]/route.ts

import { NextResponse } from "next/server";
import axios from "axios";
import qs from "qs";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";

const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function POST(
    request: Request,
    { params }: { params: { orderId: string } },
) {
    try {
        await dbConnect();

        const user = await isAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: "Need to login" },
                { status: 400 },
            );
        }
        authorizeRoles(user, "admin");

        const { orderId } = params;
        const body = await request.json();

        // Validate required fields
        const {
            pickupDate,
            pickupTime,
            expectedPackageCount,
        } = body;

        if (!pickupDate || !pickupTime || !expectedPackageCount) {
            return NextResponse.json(
                { success: false, message: "Missing required pickup details" },
                { status: 400 },
            );
        }

        // Fetch order to get waybill
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json(
                { success: false, message: "Order not found" },
                { status: 404 },
            );
        }

        if (!order.waybill) {
            return NextResponse.json(
                { success: false, message: "Order does not have a waybill. Please create Delhivery order first." },
                { status: 400 },
            );
        }

        if (!DELHIVERY_API_TOKEN) {
            return NextResponse.json(
                { success: false, message: "Delhivery API token not configured" },
                { status: 500 },
            );
        }

        // Prepare pickup request data
        // Delhivery FM API often expects data in HH:mm format and sometimes wrapped in 'data' string
        const startTime = pickupTime.split(":")[0] + ":" + pickupTime.split(":")[1];

        const pickupData = {
            pickup_location: body.pickupLocation || "Hifi bags",
            pickup_date: pickupDate,
            pickup_time: startTime,
            expected_package_count: parseInt(expectedPackageCount),
        };

        // Delhivery FM API often expects the payload as form-data with a single 'data' field containing JSON
        const formData = qs.stringify({
            data: JSON.stringify(pickupData)
        });

        // Call Delhivery Pickup API
        const options = {
            method: "POST" as const,
            url: "https://track.delhivery.com/fm/request/new/",
            headers: {
                Authorization: `Token ${DELHIVERY_API_TOKEN.trim()}`,
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
            },
            data: formData,
            timeout: 15000,
        };

        const { data: delhiveryResponse } = await axios.request(options);

        if (!delhiveryResponse.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Failed to schedule pickup with Delhivery",
                    error: delhiveryResponse.error || "Unknown error",
                },
                { status: 502 },
            );
        }

        // Update order with pickup details
        await Order.findByIdAndUpdate(orderId, {
            pickupScheduled: true,
            pickupDate,
            pickupTime,
            pickupRequestId: delhiveryResponse.pickup_request_id || null,
        });

        return NextResponse.json({
            success: true,
            message: "Pickup scheduled successfully",
            pickupRequestId: delhiveryResponse.pickup_request_id,
        });
    } catch (error: any) {
        const errorDetail = error.response?.data || error.message;
        console.error("Delhivery Pickup Error Detail:", JSON.stringify(errorDetail, null, 2));

        return NextResponse.json(
            {
                success: false,
                message: typeof errorDetail === 'string' ? errorDetail : (errorDetail.message || "Failed to schedule pickup"),
                details: errorDetail
            },
            { status: error.response?.status || 500 },
        );
    }
}
