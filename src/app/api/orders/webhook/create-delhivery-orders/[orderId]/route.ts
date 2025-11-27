// app/api/orders/[orderId]/delhivery/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { createDelhiveryShipment } from "@/utlis/createDelhiveryShipment";

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
    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    if (order.waybill) {
      return NextResponse.json(
        { success: false, message: "Order already has a waybill" },
        { status: 400 },
      );
    }

    // Calculate total quantity & weight (300g per bag/backpack)
    const totalQuantity = order.orderItems.reduce(
      (acc: number, item: any) => acc + item.quantity,
      0,
    );
    const weightInGrams = totalQuantity * 300;

    // NEW Hifi bags address + HSN 4202 for bags/backpacks
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

          products_desc: order.orderItems.map((i: any) => i.name).join(", "),
          hsn_code: "4202", // Bags & backpacks

          cod_amount:
            order.paymentMethod === "COD" ? order.totalAmount.toString() : "0",
          order_date: new Date(order.createdAt).toISOString().split("T")[0],
          total_amount: order.totalAmount.toString(),

          seller_add:
            "Hifi bags, Panakal tower, North basin road, Broadway, Ernakulam",
          seller_name: "Hifi bags",
          seller_inv: `INV${order._id.toString()}`,

          quantity: totalQuantity.toString(),
          shipment_width: "30",
          shipment_height: "40",
          shipment_length: "15",
          weight: weightInGrams.toString(),
          shipping_mode: "Surface",
          address_type: "home",
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
        // email & contact person optional – add if Delhivery starts requiring them
      },
    };

    if (!DELHIVERY_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Delhivery API token not configured" },
        { status: 500 },
      );
    }

    const delhiveryResponse = await createDelhiveryShipment(
      DELHIVERY_API_TOKEN,
      shipmentData,
    );

    // Detailed failure handling
    const topLevelSuccess = delhiveryResponse.success === true;
    const failedPackages = (delhiveryResponse.packages ?? []).filter(
      (pkg: any) => pkg.status === "Fail",
    );

    if (!topLevelSuccess || failedPackages.length > 0) {
      const remarks = failedPackages
        .flatMap((pkg: any) => pkg.remarks ?? [])
        .filter(Boolean);
      const message =
        remarks.length > 0
          ? remarks.join("; ")
          : (delhiveryResponse.rmk ?? "Unknown error from Delhivery");

      return NextResponse.json(
        {
          success: false,
          message: "Delhivery shipment creation failed",
          remarks,
          delhiveryRaw: delhiveryResponse,
        },
        { status: 502 },
      );
    }

    const waybill = delhiveryResponse.packages?.[0]?.waybill;
    if (!waybill) {
      return NextResponse.json(
        { success: false, message: "No waybill returned from Delhivery" },
        { status: 500 },
      );
    }

    await Order.findByIdAndUpdate(orderId, {
      waybill,
      orderStatus: "Shipped",
    });

    return NextResponse.json({
      success: true,
      message: "Delhivery shipment created successfully",
      waybill,
    });
  } catch (error: any) {
    console.error("Error creating Delhivery order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Delhivery order",
      },
      { status: 500 },
    );
  }
}
