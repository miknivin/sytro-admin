"use client";

import React, { useEffect } from "react";
import Barcode from "react-barcode";
import { useOrderDetailsQuery } from "@/redux/api/orderApi";
import Spinner from "@/components/common/Spinner";
import { formatDate } from "@/utlis/formatDate";

interface PageProps {
    params: {
        orderId: string;
    };
}

const CustomLabelPage: React.FC<PageProps> = ({ params }) => {
    const { orderId } = params;
    const { data, isLoading, error } = useOrderDetailsQuery(orderId);

    useEffect(() => {
        if (data?.order) {
            // document.title = `Shipping Label - ${data.order.waybill || orderId}`;
        }
    }, [data, orderId]);

    if (isLoading) return <Spinner />;
    if (error || !data?.order) return <div>Error loading order details</div>;

    const order = data.order;
    const waybill = order.waybill || "NO-WAYBILL";

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-8 print:bg-white print:p-0">
            <div className="w-[450px] border-2 border-black bg-white p-4 shadow-lg print:w-full print:border-0 print:shadow-none">

                {/* Header: Logos */}
                <div className="flex items-center justify-between border-b-2 border-black pb-2">
                    <div className="flex flex-col items-center">
                        {/* Replace with actual logo if available */}
                        <div className="text-xl font-bold italic text-orange-600">Florenza</div>
                        <div className="text-xs">Italiya</div>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="text-xl font-black text-blue-900">DELHIVERY</div>
                        <div className="h-1 w-full bg-red-600"></div>
                    </div>
                </div>

                {/* Top Barcode */}
                <div className="mt-4 flex flex-col items-center">
                    <Barcode
                        value={waybill}
                        width={1.5}
                        height={60}
                        fontSize={14}
                        margin={0}
                    />
                </div>

                {/* PIN and Route */}
                <div className="mt-2 flex justify-between border-t-2 border-black pt-1 text-sm font-bold">
                    <span>{order.shippingInfo.zipCode}</span>
                    <span>HAS/GAT</span>
                </div>

                {/* Ship To and Payment Info */}
                <div className="mt-2 flex border-2 border-black">
                    <div className="flex-[2] border-r-2 border-black p-2 text-xs">
                        <div className="font-bold">Ship To:</div>
                        <div className="text-sm font-black">{order.shippingInfo.fullName}</div>
                        <div className="mt-1">
                            {order.shippingInfo.address}<br />
                            {order.shippingInfo.city}, {order.shippingInfo.state}<br />
                            <span className="font-bold text-sm">PIN:{order.shippingInfo.zipCode}</span>
                        </div>
                        <div className="mt-1 font-bold">Ph: {order.shippingInfo.phoneNo}</div>
                    </div>
                    <div className="flex-1 p-2 text-center text-xs">
                        <div className="text-lg font-black">{order.paymentMethod === "COD" ? "COD" : "Prepaid"}</div>
                        <div className="font-bold">Surface</div>
                        <div className="mt-4 text-base font-black">INR {order.totalAmount}</div>
                    </div>
                </div>

                {/* Seller Info and Date */}
                <div className="mt-px flex border-2 border-black border-t-0">
                    <div className="flex-[2] border-r-2 border-black p-2 text-[10px] leading-tight">
                        <div className="font-bold">Seller: Florenza Italiya</div>
                        <div>
                            Address: Florenza Italiya Near ABS Traders Kodaklad, Opp: Rifa Medical Center, Palakkad Kozhikode Highway
                        </div>
                        <div className="font-bold mt-1">GST: 32AAIFO0471H1ZI</div>
                    </div>
                    <div className="flex-1 p-2 text-center text-[10px] font-bold">
                        <div>Date: {new Date(order.createdAt).toLocaleDateString()}</div>
                        <div>Time: {new Date(order.createdAt).toLocaleTimeString()}</div>
                    </div>
                </div>

                {/* Product Table */}
                <div className="mt-px border-2 border-black border-t-0 text-[10px]">
                    <div className="flex border-b-2 border-black font-bold">
                        <div className="flex-[3] border-r-2 border-black p-1">Product(Qty)</div>
                        <div className="flex-1 border-r-2 border-black p-1 text-center">Price</div>
                        <div className="flex-1 p-1 text-center">Total</div>
                    </div>
                    {order.orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex border-b border-gray-300 last:border-0 italic">
                            <div className="flex-[3] border-r-2 border-black p-1">
                                {item.name} ({item.quantity})
                            </div>
                            <div className="flex-1 border-r-2 border-black p-1 text-center">INR {item.price}</div>
                            <div className="flex-1 p-1 text-center">INR {Number(item.price) * item.quantity}</div>
                        </div>
                    ))}
                </div>

                {/* Total Row */}
                <div className="mt-px flex border-2 border-black border-t-0 text-[10px] font-bold">
                    <div className="flex-[3] border-r-2 border-black p-1">Total</div>
                    <div className="flex-1 border-r-2 border-black p-1 text-center">INR {order.totalAmount}</div>
                    <div className="flex-1 p-1 text-center">INR {order.totalAmount}</div>
                </div>

                {/* Bottom Barcode */}
                <div className="mt-2 flex flex-col items-center">
                    <Barcode
                        value={order._id.toString()}
                        width={0.8}
                        height={30}
                        fontSize={8}
                        margin={0}
                    />
                </div>

                {/* Return Address */}
                <div className="mt-2 text-[9px] leading-tight border-t border-black pt-1">
                    <span className="font-bold">Return Address:</span> Florenza Italiya Near ABS Traders Kodaklad, Opp: Rifa Medical Center, Palakkad Kozhikode Highway
                </div>

                {/* Print Button (Hidden on Print) */}
                <div className="mt-6 flex justify-center print:hidden">
                    <button
                        onClick={() => window.print()}
                        className="rounded bg-blue-600 px-6 py-2 font-bold text-white hover:bg-blue-700"
                    >
                        Print Label
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomLabelPage;
