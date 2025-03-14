import { NextResponse } from "next/server";
import products from "@/models/Products";
import dbConnect from "@/lib/db/connection";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function GET(req) {
  try {
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login as admin" },
        { status: 400 },
      );
    }

    authorizeRoles(user, "admin");

    await dbConnect();

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    const allProducts = await products.find().skip(skip).limit(limit);

    const totalProducts = await products.countDocuments();

    return NextResponse.json(
      {
        success: true,
        allProducts,
        totalProducts,
        currentPage: page,
        totalPages: Math.ceil(totalProducts / limit),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching admin products:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
