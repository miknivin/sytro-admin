// src/app/api/orders/webhook/create-shiprocket-orders/[orderId]/route.ts

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { isAuthenticatedUser, authorizeRoles } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import Product from "@/models/Products";
import { createShiprocketOrder, assignShiprocketAWB } from "@/lib/shipRocket/createShipRocketOrder";
import { getShipmentDimensionsFromOrderItems } from "@/utlis/shippingDimensions";
import {
  getCodCollectAmount,
  isCashCollectionPaymentMethod,
} from "@/lib/orders/paymentUtils";

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

    if (order.shiprocketOrderId) {
      return NextResponse.json(
        { success: false, message: "Order already has a Shiprocket Order ID" },
        { status: 400 },
      );
    }

    // Calculate total quantity & weight (300g per bag/backpack)
    const totalQuantity = order.orderItems.reduce(
      (acc: number, item: any) => acc + item.quantity,
      0,
    );
    const weightInKg = (totalQuantity * 300) / 1000; // Shiprocket expects KG

    const productIds = Array.from(
      new Set(
        order.orderItems
          .map((item: any) => item.product)
          .filter(Boolean)
          .map((id: any) => id.toString()),
      ),
    );
    const products = await Product.find({ _id: { $in: productIds } })
      .select("dimentions specifications")
      .lean();
    const productsById = products.reduce((acc: Record<string, any>, product: any) => {
      acc[product._id.toString()] = product;
      return acc;
    }, {});
    const shipmentDimensions = getShipmentDimensionsFromOrderItems(
      order.orderItems,
      productsById,
    );

    const shiprocketPayload = {
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toISOString().split("T")[0],
      pickup_location: "HIFI BAG", // Updated to match Shiprocket account
      billing_customer_name: order.shippingInfo.fullName || "Customer",
      billing_last_name: "",
      billing_address: order.shippingInfo.address,
      billing_city: order.shippingInfo.city,
      billing_pincode: order.shippingInfo.zipCode,
      billing_state: order.shippingInfo.state || "Kerala",
      billing_country: order.shippingInfo.country || "India",
      billing_email: order.shippingInfo.email || "",
      billing_phone: order.shippingInfo.phoneNo,
      shipping_is_billing: true,
      order_items: order.orderItems.map((item: any) => ({
        name: item.name,
        sku: item.product.toString(),
        units: item.quantity,
        selling_price: item.price,
        discount: 0,
        tax: 0,
        hsn: 4202,
      })),
      payment_method: isCashCollectionPaymentMethod(order.paymentMethod)
        ? "COD"
        : "Prepaid",
      sub_total: order.totalAmount,
      length: shipmentDimensions.length,
      breadth: shipmentDimensions.width,
      height: shipmentDimensions.height,
      weight: weightInKg,
    };

    const shiprocketResponse = await createShiprocketOrder(shiprocketPayload);

    if (!shiprocketResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Shiprocket order creation failed",
          error: shiprocketResponse.error,
        },
        { status: 502 },
      );
    }

    const shiprocketOrderId = shiprocketResponse.data.order_id;
    const shiprocketShipmentId = shiprocketResponse.data.shipment_id;

    // First check if awb_code is returned in the creation response
    let awbCode = shiprocketResponse.data.awb_code;

    // If not, fetch it using the assign AWB API
    if (!awbCode && shiprocketShipmentId) {
      const assignResponse = await assignShiprocketAWB(shiprocketShipmentId);
      if (assignResponse.success && assignResponse.data?.response?.data?.awb_code) {
        awbCode = assignResponse.data.response.data.awb_code;
      } else if (assignResponse.success && assignResponse.data?.awb_code) {
        // Fallback depending on exact response format
        awbCode = assignResponse.data.awb_code;
      }
    }

    const updateFields: any = {
      shiprocketOrderId,
      orderStatus: "Shipped",
    };

    if (awbCode) {
      updateFields.waybill = awbCode;
    }

    await Order.findByIdAndUpdate(orderId, updateFields);

    return NextResponse.json({
      success: true,
      message: "Shiprocket order created successfully",
      shiprocketOrderId,
      shiprocketShipmentId,
      waybill: awbCode || undefined,
    });
  } catch (error: any) {
    console.error("Error creating Shiprocket order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Shiprocket order",
      },
      { status: 500 },
    );
  }
}
