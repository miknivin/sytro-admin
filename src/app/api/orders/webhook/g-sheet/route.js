import { NextResponse } from "next/server";
import Order from "@/models/Order";
import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
// Server-side token (store in environment variables for security)
const API_TOKEN = process.env.GSHEET_API_TOKEN || "your-static-token-here";

// Middleware to verify token
async function verifyToken(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { success: false, message: "No token provided or invalid format" };
    }
    const token = authHeader.replace("Bearer ", "");
    if (token !== API_TOKEN) {
      return { success: false, message: "Invalid token" };
    }
    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: "Token verification failed: " + error.message,
    };
  }
}

export async function GET(req) {
  try {
    User;
    await dbConnect();

    // Verify token (required for Google Sheets webhook)
    const authResult = await verifyToken(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 },
      );
    }

    // Fetch orders + populate user (only select the name field)
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "name", // We only need the name (vendor name)
      })
      .lean(); // Faster + plain objects

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: true, orders: [] }, { status: 200 });
    }

    // Add a clean vendorName field using user.name
    const enrichedOrders = orders.map((order) => {
      const user = order.user || {}; // fallback if populate fails for some reason

      return {
        ...order, // keep all original order fields
        vendorName: user.name || "Unknown Vendor", // ← this is the vendor name
      };
    });

    return NextResponse.json(
      { success: true, orders: enrichedOrders },
      { status: 200 },
    );
  } catch (error) {
    console.error("Orders fetch error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Server error" },
      { status: 500 },
    );
  }
}
