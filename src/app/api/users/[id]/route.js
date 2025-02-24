import dbConnect from "@/lib/db/connection";
import User from "@/models/User";
import { NextResponse } from "next/server";
import { authorizeRoles, isAuthenticatedUser } from '@/middlewares/auth';
export async function GET(req, { params }) {
  try {
    await dbConnect(); 
    const user = await isAuthenticatedUser(req)
   // console.log(user);
    
    if (user) {
        // console.log(user.role);     
        authorizeRoles(user,'admin')
    }
    const users = await User.findById(params.id);
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
