import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
import SessionStartedOrder from "@/models/SessionStartedOrders";
import Order from "@/models/Order";
import { createShiprocketOrder } from '@/lib/shipRocket/createShipRocketOrder';

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

    const currentDate = new Date().toISOString();
    const shiprocketPayload = {
      order_id: savedOrder._id.toString().slice(-6),
      order_date: currentDate,
      pickup_location: "HIFI BAG",
      channel_id: "6458223",
      comment: sessionOrder.orderNotes || "Order via Razorpay",
      billing_customer_name: sessionOrder.shippingInfo.fullName || "Customer",
      billing_last_name: sessionOrder.shippingInfo.lastName || "lastname",
      billing_address: sessionOrder.shippingInfo.address || "",
      billing_address_2: "",
      billing_city: sessionOrder.shippingInfo.city || "",
      billing_pincode: sessionOrder.shippingInfo.zipCode || "",
      billing_state: "Kerala",
      billing_country: "India",
      billing_email: sessionOrder.shippingInfo.email || "",
      billing_phone: sessionOrder.shippingInfo.phoneNo || "",
      shipping_is_billing: true,
      shipping_customer_name: "",
      shipping_last_name: "",
      shipping_address: "",
      shipping_address_2: "",
      shipping_city: "",
      shipping_pincode: "",
      shipping_country: "",
      shipping_state: "",
      shipping_email: "",
      shipping_phone: "",
      order_items: sessionOrder.orderItems.map((item) => ({
        name: item.name,
        sku: item.sku || `sku_${item.name}_${Date.now()}`,
        units: item.quantity,
        selling_price: item.price.toString(),
        discount: "0",
        tax: "18",
        hsn: "",
      })),
      payment_method: "Prepaid",
      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      sub_total: sessionOrder.totalAmount,
      length: 34,
      breadth: 6.5,
      height: 44,
      weight: 0.7,
    };

    // Attempt Shiprocket integration
    let shiprocketResult = null;
    try {
      const shiprocketResponse = await createShiprocketOrder(shiprocketPayload);
      if (shiprocketResponse.success) {
        savedOrder.shiprocketOrderId = shiprocketResponse.data.order_id;
        await savedOrder.save();
        console.log("Added shiprocket order", shiprocketResponse);
        shiprocketResult = shiprocketResponse.data;
      } else {
        console.warn(
          "Shiprocket integration failed:",
          shiprocketResponse.error,
        );
      }
    } catch (shiprocketError) {
      console.warn("Shiprocket integration error:", shiprocketError.message);
    }

    // Optional: Delete the SessionStartedOrder after successful conversion
    await SessionStartedOrder.findByIdAndDelete(sessionOrderId);

    return NextResponse.json(
      {
        message: "Order converted successfully",
        order: savedOrder,
        shiprocketResult, // Optionally include Shiprocket result
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
