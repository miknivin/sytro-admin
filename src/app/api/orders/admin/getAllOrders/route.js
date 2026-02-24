import { NextResponse } from "next/server";
import Order from "@/models/Order";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import mongoose from "mongoose";

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

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const paymentMethodsParam = searchParams.get("paymentMethods");
    const paymentMethods = paymentMethodsParam
      ? paymentMethodsParam
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 8, 1);

    const query = {};

    if (paymentMethodsParam !== null) {
      query.paymentMethod = { $in: paymentMethods };
    }

    if (search) {
      const regex = new RegExp(search, "i");
      const searchConditions = [
        { "shippingInfo.fullName": { $regex: regex } },
        { "shippingInfo.phoneNo": { $regex: regex } },
        { "shippingInfo.email": { $regex: regex } },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$_id" },
              regex: search,
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
      .limit(limit);

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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
