import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    await dbConnect();

    const { sessionOrderId } = await request.json();

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
      paymentMethod: "Online",
      paymentInfo: {
        id: sessionOrder.razorpayOrderId,
        status: sessionOrder.razorpayPaymentStatus,
      },
      itemsPrice: sessionOrder.itemsPrice,
      taxAmount: 0,
      shippingAmount: 0,
      totalAmount: sessionOrder.totalAmount,
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
