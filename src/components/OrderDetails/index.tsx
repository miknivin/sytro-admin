"use client";
import { useEffect, useState } from "react";
import OrderHeader from "./OrderHeader";
import ProductItem from "./ProductItem";
import OrderSummary from "./OrderSummary";
import ShippingDetails from "./ShippingDetails";
import CustomerDetails from "./CustomerDetails";
import { useOrderDetailsQuery } from "@/redux/api/orderApi";
import Spinner from "../common/Spinner";
import { Order } from "@/types/order";
import { formatDate } from './../../utlis/formatDate';

interface OrderDetailsProps {
  orderId: string;  
}

export default function OrderDetails({ orderId }: OrderDetailsProps) {
  const { data, error, isLoading } = useOrderDetailsQuery(orderId);
  const [orderDetails, setOrderDetails] = useState<Order | null>(null);

  useEffect(() => {
    if (data) {
      setOrderDetails(data.order);
      console.log("Order Details:", data);
    }
  }, [data]);

  useEffect(() => {
    console.log("Order ID:", orderId);  // Log the orderId
  }, [orderId]);

  if (isLoading) {
    return <Spinner />;
  }

  if (!orderDetails) {
    return <p>Error fetching details</p>;
  }

  return (
    <div className="py-14 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
      <OrderHeader orderNumber={orderDetails._id.slice(-6)} orderDate={formatDate(orderDetails.createdAt)} orderId={orderDetails._id} orderStatus={orderDetails.orderStatus} />
      <div className="mt-10 flex flex-col xl:flex-row justify-center items-stretch w-full xl:space-x-8 space-y-4 md:space-y-6 xl:space-y-0">
        <div className="flex flex-col justify-start items-start w-full space-y-4 md:space-y-6 xl:space-y-8">
          <div className="flex flex-col justify-start items-start dark:bg-gray-800 bg-gray-50 px-4 py-4 md:py-6 md:p-6 xl:p-8 w-full">
            <p className="text-lg md:text-xl font-semibold leading-6 xl:leading-5 text-gray-800 dark:text-gray-100">
              Customer’s Cart
            </p>
            {orderDetails.orderItems.map((product, index) => (
              <ProductItem key={index} product={product} />
            ))}
          </div>
          <div className="flex justify-center md:flex-row flex-col items-stretch w-full space-y-4 md:space-y-0 md:space-x-6 xl:space-x-8">
          <OrderSummary order={orderDetails} />
            {/* <ShippingDetails shippingInfo={orderDetails.shippingInfo} /> */}
          </div>
        </div>
        <CustomerDetails customer={orderDetails.shippingInfo} />
      </div>
    </div>
  );
}
