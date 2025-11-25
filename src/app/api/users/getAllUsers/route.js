import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
export async function GET(req) {
  try {
    await dbConnect();
    const user = await isAuthenticatedUser(req);
    if (user) {
      authorizeRoles(user, "admin");
    }
    const users = await User.find().sort({ updatedAt: -1 });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
