"use client";

import { useGetAdminOrdersQuery } from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import Link from "next/link";
import { useState } from "react";
import { Parser } from "json2csv";

type OrderTableProps = {
  limit: number | null;
};

const OrderTable = ({ limit }: OrderTableProps) => {
  const { data, isLoading, isError } = useGetAdminOrdersQuery(null);
  const [isDownloading, setIsDownloading] = useState(false);

  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (isError) {
    return <p>Error loading orders.</p>;
  }

  const displayLimit = limit !== null ? limit : data.orders?.length;

  // Function to convert JSON to CSV and trigger download
  const exportToCSV = () => {
    if (!data.orders || data.orders.length === 0) {
      alert("No orders available to export!");
      return;
    }

    setIsDownloading(true);

    // Fields to export
    const fields = [
      { label: "Order ID", value: "_id" },
      { label: "Customer Name", value: "shippingInfo.fullName" },
      { label: "Email", value: "shippingInfo.email" },
      { label: "Phone Number", value: "shippingInfo.phoneNo" },
      { label: "Address", value: "shippingInfo.address" },
      { label: "City", value: "shippingInfo.city" },
      { label: "State", value: "shippingInfo.state" },
      { label: "Country", value: "shippingInfo.country" },
      { label: "Zip Code", value: "shippingInfo.zipCode" },
      { label: "Total Amount", value: "totalAmount" },
      { label: "Payment Method", value: "paymentMethod" },
      { label: "Order Status", value: "orderStatus" },
      { label: "Date", value: "createdAt" },
    ];

    // Convert data to CSV format
    const parser = new Parser({ fields });
    const csv = parser.parse(data.orders);

    // Create and download CSV file
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setIsDownloading(false);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Latest Orders
      </h4>
      <button
        onClick={exportToCSV}
        className="mb-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        disabled={isDownloading}
      >
        {isDownloading ? "Downloading..." : "Export to CSV"}
      </button>

      </div>
  
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Order ID</th>
              <th scope="col" className="px-6 py-3 text-center">Customer</th>
              <th scope="col" className="px-6 py-3 text-center">Total</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3 text-center">Date</th>
              <th scope="col" className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.orders?.slice(0, displayLimit).map((order: Order) => (
              <tr
                key={order._id}
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                >
                  {order._id.slice(-6)}
                </th>
                <td className="px-6 py-4 text-center">
                  {order.shippingInfo.fullName}
                </td>
                <td className="px-6 py-4 text-center">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center">{order.orderStatus}</td>
                <td className="px-6 py-4 text-center">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/orderDetails/${order._id}`} className="btn">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
