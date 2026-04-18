import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";
import Order from "@/models/Order";
import { normalizePaymentData } from "@/lib/orders/paymentUtils";

const toAmount = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
};

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const sessionOrderId =
      typeof body === "string" ? body : body?.sessionOrderId;

    if (!sessionOrderId) {
      return NextResponse.json(
        { error: "Session Order ID is required" },
        { status: 400 },
      );
    }

    const sessionOrder = await SessionStartedOrder.findById(sessionOrderId);

    if (!sessionOrder) {
      return NextResponse.json(
        { error: "Session Order not found" },
        { status: 404 },
      );
    }

    const paymentMethod =
      body?.paymentMethod ?? sessionOrder.paymentMethod ?? "Online";
    const sessionTotalAmount = toAmount(
      sessionOrder.totalAmount ?? sessionOrder.itemsPrice,
    );
    const itemsTotalAmount = toAmount(sessionOrder.itemsPrice);
    const sessionAdvancePaid = toAmount(
      body?.paymentAmount ??
        sessionOrder.paymentAmount ??
        sessionOrder.advancePaidInThisSession,
    );
    const advancePaidAt = body?.advancePaidAt ?? sessionOrder.createdAt;

    let normalizedPayment;
    let orderTotalAmount = sessionTotalAmount;

    if (paymentMethod === "Partial-COD") {
      const codCharge = toAmount(
        body?.codCharge ??
          sessionOrder.codCharge ??
          body?.codChargeCollected ??
          sessionOrder.codChargeCollected,
      );
      const expectedPartialCodTotal = toAmount(itemsTotalAmount + codCharge);
      const remainingAmount = toAmount(
        Math.max(expectedPartialCodTotal - sessionAdvancePaid, 0),
      );

      normalizedPayment = normalizePaymentData({
        paymentMethod: "Partial-COD",
        totalAmount: expectedPartialCodTotal,
        itemsPrice: itemsTotalAmount,
        paymentAmount: sessionAdvancePaid,
        advancePaid: sessionAdvancePaid,
        advancePaidAt,
        remainingAmount,
        codAmount: remainingAmount,
        codCharge,
        codChargeCollected: codCharge,
      });

      const verifiedPartialCodTotal = toAmount(
        normalizedPayment.remainingAmount + normalizedPayment.advancePaid,
      );

      if (verifiedPartialCodTotal !== expectedPartialCodTotal) {
        return NextResponse.json(
          {
            error:
              "For Partial-COD, remaining amount + advance must equal items total amount + COD.",
          },
          { status: 400 },
        );
      }

      orderTotalAmount = expectedPartialCodTotal;
    } else {
      normalizedPayment = normalizePaymentData({
        paymentMethod: "Online",
        totalAmount: sessionTotalAmount,
        itemsPrice: itemsTotalAmount,
        paymentAmount: sessionAdvancePaid,
        advancePaid: sessionAdvancePaid,
        advancePaidAt,
      });
    }

    const newOrder = new Order({
      shippingInfo: {
        fullName: sessionOrder?.shippingInfo?.fullName,
        address: sessionOrder?.shippingInfo?.address,
        email: sessionOrder?.shippingInfo?.email,
        state: sessionOrder?.shippingInfo?.state,
        city: sessionOrder?.shippingInfo?.city,
        phoneNo: sessionOrder?.shippingInfo?.phoneNo,
        zipCode: sessionOrder?.shippingInfo?.zipCode,
        country: sessionOrder?.shippingInfo?.country,
      },
      user: sessionOrder?.user,
      orderItems: sessionOrder?.orderItems?.map((item) => ({
        name: item?.name,
        uploadedImage: item?.uploadedImage,
        quantity: item?.quantity,
        image: item?.image,
        price: item?.price,
        product: item?.product,
        customNameToPrint: item?.customNameToPrint,
      })),
      paymentMethod: normalizedPayment.paymentMethod,
      advancePaidAt: normalizedPayment.advancePaidAt,
      remainingAmount: normalizedPayment.remainingAmount,
      codAmount: normalizedPayment.codAmount,
      codChargeCollected: normalizedPayment.codChargeCollected,
      advancePaid: normalizedPayment.advancePaid,
      paymentInfo: {
        id: sessionOrder.paymentInfo?.id || sessionOrder.razorpayOrderId,
        status:
          sessionOrder.paymentInfo?.status ||
          sessionOrder.razorpayPaymentStatus,
      },
      itemsPrice: itemsTotalAmount,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: orderTotalAmount,
      orderStatus: "Processing",
      orderNotes: sessionOrder.orderNotes,
      deliveredAt: sessionOrder.deliveredAt,
    });

    const savedOrder = await newOrder.save();

    // Optional: Delete the SessionStartedOrder after successful conversion
    await SessionStartedOrder.findByIdAndDelete(sessionOrderId);

    return NextResponse.json(
      {
        message: "Order converted successfully",
        order: savedOrder,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error converting order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
