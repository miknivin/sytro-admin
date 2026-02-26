import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";

export async function POST(req) {
  await dbConnect();

  try {
    const body = await req.json();
    const { field, orderId, newValue, columnLetter, row, sheetName } = body;

    console.log("GSheet webhook:", {
      row,
      sheetName,
      column: columnLetter,
      field,
      orderId,
      newValue,
    });

    // ── Security ────────────────────────────────────────
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split(" ")?.[1];
    const expectedToken = process.env.GSHEET_API_TOKEN;

    if (!token || token !== expectedToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ── Validation ──────────────────────────────────────
    if (!orderId || !field || newValue === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: orderId, field, newValue" },
        { status: 400 },
      );
    }

    // Only allow these two fields from sheet (security)
    const allowedFields = ["orderStatus", "waybill"];
    if (!allowedFields.includes(field)) {
      return NextResponse.json(
        { error: `Unsupported field: ${field}` },
        { status: 400 },
      );
    }

    // Prepare atomic update
    const update = { $set: { [field]: newValue.trim() || null } };

    // If waybill is being cleared → allow null/empty
    if (field === "waybill" && !newValue.trim()) {
      update.$set.waybill = null;
      // update.$set.orderTracking = [];
    }

    const updatedOrder = await Order.findOneAndUpdate(
      { _id: orderId },
      update,
      { new: true, runValidators: true },
    );

    if (!updatedOrder) {
      console.warn(`Order not found: ${orderId}`);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `${field} updated to "${newValue}"`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 },
    );
  }
}
