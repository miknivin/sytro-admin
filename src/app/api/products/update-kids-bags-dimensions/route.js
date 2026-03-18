import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Product from "@/models/Products";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function POST(req) {
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

    const result = await Product.updateMany(
      { category: "Kids Bags" },
      {
        $set: {
          dimentions: {
            length: 34,
            width: 39,
            height: 3,
            unit: "cm",
          },
        },
      },
    );

    return NextResponse.json(
      {
        success: true,
        matchedCount: result.matchedCount ?? result.n ?? 0,
        modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating Kids Bags dimensions:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}

