import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";

export async function PATCH(req, { params}) {
  await dbConnect();

  try {
     const user = await isAuthenticatedUser(req)
        
        if (user) {
            
            authorizeRoles(user,'admin')
        }
    const { id } = params;
    const { orderStatus } = await req.json();

    if (!orderStatus) {
      return NextResponse.json({ error: "Order status is required" }, { status: 400 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    order.orderStatus = orderStatus;
    await order.save();

    return NextResponse.json({ success: true, message: "Order status updated", order });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
