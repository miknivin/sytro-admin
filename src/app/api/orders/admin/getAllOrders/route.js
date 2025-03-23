import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";

export async function GET(req) {
  try {
    await dbConnect();

    // Authenticate the user
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 400 },
      );
    }

    authorizeRoles(user, "admin");

    // Fetch all orders sorted by latest first
    const orders = await Order.find().sort({ createdAt: -1 });

    if (!orders) {
      return NextResponse.json(
        { success: false, message: "No orders found" },
        { status: 404 },
      );
    }

    if (orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] }, { status: 200 });
    }

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
