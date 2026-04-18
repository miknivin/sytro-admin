import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import { normalizePaymentData } from "@/lib/orders/paymentUtils";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const user = await isAuthenticatedUser(req);
    if (user) {
      authorizeRoles(user, "admin");
    }

    const { id } = params;
    const body = await req.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const normalizedPayment = normalizePaymentData({
      paymentMethod: body?.paymentMethod ?? "Partial-COD",
      totalAmount: body?.totalAmount ?? order.totalAmount,
      itemsPrice: order.itemsPrice,
      advancePaid: body?.advancePaid,
      advancePaidAt: body?.advancePaidAt,
      remainingAmount: body?.remainingAmount,
      codAmount: body?.codAmount,
      codChargeCollected: body?.codChargeCollected,
      advancePayment: body?.advancePayment,
    });

    if (normalizedPayment.paymentMethod !== "Partial-COD") {
      return NextResponse.json(
        { error: "This route only supports conversion to Partial-COD" },
        { status: 400 },
      );
    }

    if (normalizedPayment.advancePaid <= 0) {
      return NextResponse.json(
        { error: "Advance paid amount must be greater than 0" },
        { status: 400 },
      );
    }

    if (normalizedPayment.remainingAmount < 0) {
      return NextResponse.json(
        { error: "Remaining amount cannot be negative" },
        { status: 400 },
      );
    }

    order.paymentMethod = normalizedPayment.paymentMethod;
    order.advancePaid = normalizedPayment.advancePaid;
    order.advancePaidAt = normalizedPayment.advancePaidAt;
    order.remainingAmount = normalizedPayment.remainingAmount;
    order.codAmount = normalizedPayment.codAmount;
    order.codChargeCollected = normalizedPayment.codChargeCollected;

    if (body?.paymentInfo && typeof body.paymentInfo === "object") {
      order.paymentInfo = {
        ...(order.paymentInfo?.toObject?.() ?? order.paymentInfo ?? {}),
        ...body.paymentInfo,
      };
    }

    await order.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order converted to Partial-COD successfully",
        order,
        advancePaidAtUtc: order.advancePaidAt
          ? order.advancePaidAt.toISOString()
          : null,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Server error" },
      { status: 500 },
    );
  }
}
