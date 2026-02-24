import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import mongoose from "mongoose";
export async function GET(req) {
  try {
    await dbConnect();
    const user = await isAuthenticatedUser(req);
    if (user) {
      authorizeRoles(user, "admin");
    }
    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const search = (searchParams.get("search") || "").trim();
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);

    const query = {};
    if (role) {
      query.role = role;
    }
    if (search) {
      const regex = new RegExp(search, "i");
      const searchConditions = [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        { phone: { $regex: regex } },
        { role: { $regex: regex } },
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

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.max(Math.ceil(totalUsers / limit), 1);
    const safePage = Math.min(page, totalPages);
    const skip = (safePage - 1) * limit;

    const users = await User.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const usersWithOrderCount = await Promise.all(
      users.map(async (fetchedUser) => {
        const totalOrders = await Order.countDocuments({ user: fetchedUser._id });
        const userObject = fetchedUser.toObject();
        return {
          ...userObject,
          totalOrders,
        };
      }),
    );

    return NextResponse.json(
      {
        users: usersWithOrderCount,
        pagination: {
          currentPage: safePage,
          totalPages,
          totalUsers,
          limit,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
