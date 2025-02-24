"use client"

import { useGetAdminOrdersQuery } from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import Link from "next/link";


type OrderTableProps = {
  limit: number | null;
};

const OrderTable = ({ limit }: OrderTableProps) => {
  const { data, isLoading, isError } = useGetAdminOrdersQuery(null);

  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (isError) {
    return <p>Error loading orders.</p>;
  }

  const displayLimit = limit !== null ? limit : data.orders?.length;

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Latest Orders
      </h4>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
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
                className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                { order._id.slice(-6) }
                </th>
                <td className="px-6 py-4 text-center">{order.shippingInfo.fullName}</td>
                <td className="px-6 py-4 text-center">${order.totalAmount}</td>
                <td className="px-6 py-4 text-center">{order.orderStatus}</td>
                <td className="px-6 py-4 text-center">{new Date(order.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</td>
                <td className="px-6 py-4 text-center"><Link href={`/orderDetails/${order._id}`} className="btn">
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
