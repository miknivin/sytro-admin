import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import SessionStartedOrder from "@/models/SessionStartedOrders";

export async function GET(request) {
  try {
    await dbConnect();

    // Get all SessionStartedOrders
    const sessionOrders = await SessionStartedOrder.find().sort({
      createdAt: -1,
    });

    // Get all Orders
    const orders = await Order.find().sort({ createdAt: -1 });

    // Function to compare shippingInfo objects
    const isShippingInfoEqual = (shipping1, shipping2) => {
      if (!shipping1 || !shipping2) return false;
      return (
        shipping1.fullName === shipping2.fullName &&
        shipping1.address === shipping2.address &&
        shipping1.email === shipping2.email &&
        shipping1.state === shipping2.state &&
        shipping1.city === shipping2.city &&
        shipping1.phoneNo === shipping2.phoneNo &&
        shipping1.zipCode === shipping2.zipCode &&
        shipping1.country === shipping2.country
      );
    };

    // Filter out SessionStartedOrders that have matching shippingInfo with any Order
    const filteredSessionOrders = sessionOrders.filter((sessionOrder) => {
      return !orders.some((order) =>
        isShippingInfoEqual(sessionOrder.shippingInfo, order.shippingInfo),
      );
    });

    return NextResponse.json({
      success: true,
      data: filteredSessionOrders,
      total: filteredSessionOrders.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
