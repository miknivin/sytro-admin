// app/api/session-orders/[id]/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";
export async function GET(request, { params }) {
  try {
    await dbConnect();

    const { id } = params;

    const order = await SessionStartedOrder.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}
