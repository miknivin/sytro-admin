import { NextResponse } from "next/server";
import Order from "@/models/Order";
import Product from "@/models/Products";
import User from "@/models/User";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";

export async function GET(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 400 },
      );
    }

    authorizeRoles(user, "admin");

    // Common filter: exclude Vendor-Payment orders
    const filter = { paymentMethod: { $ne: "Vendor-Payment" } };

    // 1. Total number of valid orders
    const totalOrders = await Order.countDocuments(filter);

    // 2. Total revenue (sum of totalAmount)
    const totalAmountResult = await Order.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalAmount =
      totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

    // 3. Total products (unchanged - assumes this counts all products in DB)
    const totalProducts = await Product.countDocuments();

    // 4. Total users (unchanged - usually includes all registered users)
    const totalUsers = await User.countDocuments();

    return NextResponse.json(
      {
        success: true,
        totalOrders,
        totalAmount,
        totalProducts,
        totalUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error); // ← helpful for debugging in production logs
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
