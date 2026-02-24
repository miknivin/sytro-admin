import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function POST(req) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (user) {
      authorizeRoles(user, "admin");
    }

    const { name, email, phone, password, avatar } = await req.json();

    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { message: "Name, email, phone and password are required" },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists with this email or phone" },
        { status: 400 },
      );
    }

    const vendor = await User.create({
      name,
      email,
      phone,
      password,
      role: "vendor",
      ...(avatar?.url ? { avatar } : {}),
    });

    return NextResponse.json(
      { success: true, user: vendor },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
