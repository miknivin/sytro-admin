// src/app/api/orders/webhook/[orderId]/delhivery/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { createDelhiveryShipment } from "@/utlis/createDelhiveryShipment";

const INTERNAL_API_TOKEN = process.env.INTERNAL_API_TOKEN;
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    const authHeader = request.headers.get("x-internal-token");
    if (!INTERNAL_API_TOKEN || authHeader !== INTERNAL_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { orderId } = params;
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    await dbConnect();

    // 2. Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // 3. Prevent duplicate shipment
    if (order.waybill) {
      return NextResponse.json(
        {
          success: true,
          message: "Already shipped",
          waybill: order.waybill,
        },
        { status: 200 },
      );
    }

    // 4. Calculate quantity & weight (300g per bag)
    const totalQuantity = order.orderItems.reduce(
      (t: number, i: any) => t + i.quantity,
      0,
    );
    const weightInGrams = totalQuantity * 300;

    // 5. NEW Hifi bags payload (Ernakulam) + HSN 4202
    const shipmentData = {
      shipments: [
        {
          name: order.shippingInfo.fullName || "Customer",
          add: order.shippingInfo.address,
          pin: order.shippingInfo.zipCode,
          city: order.shippingInfo.city,
          state: order.shippingInfo.state || "Kerala",
          country: order.shippingInfo.country || "India",
          phone: order.shippingInfo.phoneNo,
          order: order._id.toString(),
          payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",

          // Return address = Hifi bags (Ernakulam)
          return_pin: "682031",
          return_city: "Kochi",
          return_state: "Kerala",
          return_country: "India",
          return_add:
            "Hifi bags, Panakal tower, North basin road, Broadway, Ernakulam",
          return_phone: "7293333483",

          products_desc: order.orderItems
            .map((i: any) => `${i.name}${i.variant ? ` (${i.variant})` : ""}`)
            .join(", "),

          hsn_code: "4202", // ← Bags, backpacks, travel goods

          cod_amount:
            order.paymentMethod === "COD" ? order.totalAmount.toString() : "0",
          order_date: new Date(order.createdAt).toISOString().split("T")[0],
          total_amount: order.totalAmount.toString(),

          seller_add:
            "Hifi bags, Panakal tower, North basin road, Broadway, Ernakulam",
          seller_name: "Hifi bags",
          seller_inv: `INV${order._id.toString()}`,

          quantity: totalQuantity.toString(),
          shipment_width: "30", // realistic for bags (in cm)
          shipment_height: "40",
          shipment_length: "15",
          weight: weightInGrams.toString(),
          shipping_mode: "Surface",
          address_type: "home",

          // Optional: Add your GST if needed
          seller_gst: process.env.GSTNO || "",
        },
      ],
      pickup_location: {
        name: "Hifi bags",
        add: "Hifi bags, Panakal tower, North basin road, Broadway, Ernakulam",
        pin: "682031",
        city: "Kochi",
        state: "Kerala",
        country: "India",
        phone: "7293333483",
        // Add these if Delhivery requires in future:
        // email: "hifibagsernakulam@gmail.com",
        // contact_person: "Minzar T N",
        gst: process.env.GSTNO || "",
      },
    };

    // 6. Validate Delhivery token
    if (!DELHIVERY_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Delhivery token not configured" },
        { status: 500 },
      );
    }

    // 7. Create shipment
    const delhiveryResponse = await createDelhiveryShipment(
      DELHIVERY_API_TOKEN,
      shipmentData,
    );

    // 8. Extract waybill with better error handling
    const waybill = delhiveryResponse.packages?.[0]?.waybill;
    if (!waybill) {
      return NextResponse.json(
        {
          success: false,
          message: "No waybill returned from Delhivery",
          delhiveryRaw: delhiveryResponse,
        },
        { status: 500 },
      );
    }

    // 9. Update order
    await Order.findByIdAndUpdate(orderId, {
      waybill,
      orderStatus: "Shipped",
    });

    return NextResponse.json({
      success: true,
      message: "Shipment created successfully via webhook",
      waybill,
      orderId,
    });
  } catch (error: any) {
    console.error("Webhook Delhivery error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create shipment",
      },
      { status: 500 },
    );
  }
}
