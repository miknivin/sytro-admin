"use client";

import { useSessionStartedOrdersQuery } from "@/redux/api/orderApi";
import { SessionStartedOrder } from "@/types/sessionStartedOrder";
import Link from "next/link";
import Spinner from "../common/Spinner";

const SessionStartedOrders = () => {
  const { data, isLoading, isError } = useSessionStartedOrdersQuery(null);

  // Function to check if two shippingInfo objects are equal
  // const isShippingInfoEqual = (shipping1?: any, shipping2?: any): boolean => {
  //   if (!shipping1 || !shipping2) return false;
  //   return (
  //     shipping1.fullName === shipping2.fullName &&
  //     shipping1.address === shipping2.address &&
  //     shipping1.email === shipping2.email &&
  //     shipping1.state === shipping2.state &&
  //     shipping1.city === shipping2.city &&
  //     shipping1.phoneNo === shipping2.phoneNo &&
  //     shipping1.zipCode === shipping2.zipCode &&
  //     shipping1.country === shipping2.country
  //   );
  // };

  // Function to remove duplicates based on shippingInfo and user
  const removeDuplicates = (
    orders: SessionStartedOrder[],
  ): SessionStartedOrder[] => {
    const seen = new Set<string>();
    return orders.filter((order) => {
      const key = `${order.user.toString()}-${JSON.stringify(order.shippingInfo)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  if (isLoading) {
    return (
      <p>
        <Spinner />
      </p>
    );
  }

  if (isError) {
    return <p>Error loading session started orders.</p>;
  }

  // Apply deduplication if data exists
  const uniqueOrders = data?.data ? removeDuplicates(data.data) : [];

  if (!uniqueOrders || uniqueOrders.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Session Started Orders
        </h4>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No session started orders found.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Session Started Orders
        </h4>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {uniqueOrders.map((order: SessionStartedOrder) => (
              <tr
                key={order._id.toString()} // Convert to string for key
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                >
                  {order.razorpayOrderId.slice(-6)}
                </th>
                <td className="px-6 py-4 text-center">
                  {order.shippingInfo.fullName || "N/A"}
                </td>
                <td className="px-6 py-4 text-center">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center">
                  {order.razorpayPaymentStatus}
                </td>
                <td className="px-6 py-4 text-center">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link
                    href={`/orders/session-started/${order._id}`}
                    className="btn"
                  >
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

export default SessionStartedOrders;
