"use client";
import OrderHeader from "./OrderHeader";
import ProductItem from "./ProductItem";
import OrderSummary from "./OrderSummary";
import CustomerDetails from "./CustomerDetails";
import { useOrderDetailsQuery } from "@/redux/api/orderApi";
import Spinner from "../common/Spinner";
import { formatDate } from "./../../utlis/formatDate";
import Link from "next/link";

interface OrderDetailsProps {
  orderId: string;
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const { data, isLoading } = useOrderDetailsQuery(orderId);
  const orderDetails = data?.order;

  if (isLoading) {
    return <Spinner />;
  }

  if (!orderDetails) {
    return <p>Error fetching details</p>;
  }

  return (
    <div className="px-4 py-14 2xl:container md:px-6 2xl:mx-auto 2xl:px-20">
      <div className="mb-4">
        <Link
          href="/orders"
          className=" me-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
        >
          Go back
        </Link>
      </div>

      <OrderHeader
        orderNumber={orderDetails._id.toString().slice(-6)}
        orderDate={formatDate(orderDetails.createdAt)}
        orderId={orderDetails._id.toString()}
        orderStatus={orderDetails.orderStatus}
        currentStatus={
          orderDetails.delhiveryCurrentStatus || orderDetails.orderStatus
        }
        hasSyncedDelhiveryStatus={!!orderDetails.delhiveryCurrentStatus}
        showCreateDelhiveryLink={!orderDetails.waybill}
        hasWaybill={!!orderDetails.waybill}
        waybill={orderDetails.waybill || ""}
      />
      <div className="mt-10 flex w-full flex-col items-stretch justify-center space-y-4 md:space-y-6 xl:flex-row xl:space-x-8 xl:space-y-0">
        <div className="flex w-full flex-col items-start justify-start space-y-4 md:space-y-6 xl:space-y-8">
          <div className="flex w-full flex-col items-start justify-start bg-gray-50 px-4 py-4 dark:bg-gray-800 md:p-6 md:py-6 xl:p-8">
            <p className="text-lg font-semibold leading-6 text-gray-800 dark:text-gray-100 md:text-xl xl:leading-5">
              Customer’s Cart
            </p>
            {orderDetails.orderItems.map((product:any, index:number) => (
              <ProductItem key={index} product={product} />
            ))}
          </div>
          <div className="flex w-full flex-col items-stretch justify-center space-y-4 md:flex-row md:space-x-6 md:space-y-0 xl:space-x-8">
            <OrderSummary order={orderDetails} />
            {/* <ShippingDetails shippingInfo={orderDetails.shippingInfo} /> */}
          </div>
        </div>
        <CustomerDetails customer={orderDetails.shippingInfo} />
      </div>
    </div>
  );
}
