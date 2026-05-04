import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";


export async function GET(request) {
  try {
    await dbConnect();

    // Get all pending/cancelled SessionStartedOrders (completed ones are auto-deleted by webhook)
    const filteredSessionOrders = await SessionStartedOrder.find().sort({
      createdAt: -1,
    });


    const response = NextResponse.json({
      success: true,
      data: filteredSessionOrders,
      total: filteredSessionOrders.length,
    });

    // Set cache-control headers after creating response
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 },
    );
  }
}

// Optional: Ensure dynamic rendering
export const dynamic = "force-dynamic";
