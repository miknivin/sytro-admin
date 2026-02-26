import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import mongoose from "mongoose";

// Helper to escape special regex characters
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 401 },
      );
    }
    authorizeRoles(user, "admin");

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const paymentMethodsParam = searchParams.get("paymentMethods");
    const userId = searchParams.get("userId")?.trim(); // ← NEW
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 8, 1);

    const query = {};

    // ── NEW: Filter by specific user ────────────────
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = new mongoose.Types.ObjectId(userId);
    }
    // ────────────────────────────────────────────────

    if (paymentMethodsParam) {
      const paymentMethods = paymentMethodsParam
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      if (paymentMethods.length > 0) {
        query.paymentMethod = { $in: paymentMethods };
      }
    }

    if (search) {
      const escaped = escapeRegex(search);
      const regex = new RegExp(escaped, "i");

      const searchConditions = [
        { "shippingInfo.fullName": { $regex: regex } },
        { "shippingInfo.phoneNo": { $regex: regex } },
        { "shippingInfo.email": { $regex: regex } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: escaped,
              options: "i",
            },
          },
        },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
      }

      query.$or = searchConditions;
    }

    const totalOrders = await Order.countDocuments(query);
    const totalPages = Math.max(Math.ceil(totalOrders / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json(
      {
        success: true,
        orders,
        pagination: {
          currentPage: safePage,
          totalPages,
          totalOrders,
          limit,
        },
      },
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
