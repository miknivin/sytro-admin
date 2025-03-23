"use client";

import { useGetAdminOrdersQuery } from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import Link from "next/link";
import Spinner from "../common/Spinner";

type OrderTableProps = {
  limit: number | null;
};

const DashboardOrderTable = ({ limit }: OrderTableProps) => {
  const { data, isLoading, isError } = useGetAdminOrdersQuery(null);

  if (isLoading) {
    return (
      <p>
        <Spinner />
      </p>
    );
  }

  if (isError) {
    return <p>Error loading orders.</p>;
  }

  const displayLimit = limit !== null ? limit : data.orders?.length;

  if (!data?.orders || data.orders.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Latest Orders
        </h4>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No orders found.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-3 flex items-center justify-between">
        <h4 className=" text-xl font-semibold text-black dark:text-white">
          Latest Orders
        </h4>
        <Link href={"/orders"} className="btn-soft btn me-3">
          View orders
        </Link>
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

export default DashboardOrderTable;
