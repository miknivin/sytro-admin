"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useGetAdminOrdersQuery } from "@/redux/api/orderApi";
import { useGetUserDetailsQuery } from "@/redux/api/userApi";
import Spinner from "@/components/common/Spinner";
import GraySpinner from "@/components/common/GraySpinner";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import { Order } from "@/types/order";

interface VendorDetailsProps {
  vendorId: string;
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ vendorId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const {
    data: userData,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useGetUserDetailsQuery(vendorId);

  const {
    data: ordersData,
    isLoading: isOrdersLoading,
    isFetching: isOrdersFetching,
    isError: isOrdersError,
  } = useGetAdminOrdersQuery({
    page: currentPage,
    limit: itemsPerPage,
    userId: vendorId,
  });

  const vendor = userData?.users;
  const orders: Order[] = ordersData?.orders || [];
  const totalPages = ordersData?.pagination?.totalPages || 1;

  const vendorCreatedAt = useMemo(() => {
    if (!vendor?.createdAt) return "N/A";
    return new Date(vendor.createdAt).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, [vendor?.createdAt]);

  if (isUserLoading || isOrdersLoading) {
    return <Spinner />;
  }

  if (isUserError || !vendor) {
    return <p className="text-center text-danger">Failed to load vendor.</p>;
  }

  if (isOrdersError) {
    return (
      <p className="text-center text-danger">Failed to load vendor orders.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-7.5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Vendor Information
          </h4>
          <Link
            href="/vendors"
            className=" me-2 rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            Back to Vendors
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
            <p className="font-medium text-black dark:text-white">
              {vendor.name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-black dark:text-white">
              {vendor.email || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium text-black dark:text-white">
              {vendor.phone || "N/A"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Joined On
            </p>
            <p className="font-medium text-black dark:text-white">
              {vendorCreatedAt}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Orders
            </p>
            <p className="font-medium text-black dark:text-white">
              {vendor.totalOrders ?? ordersData?.pagination?.totalOrders ?? 0}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white p-5 shadow-default dark:border-strokedark dark:bg-boxdark sm:p-7.5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Vendor Orders
          </h4>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option value="5">5</option>
            <option value="8">8</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>

        <div className="relative overflow-x-auto">
          {isOrdersFetching && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 dark:bg-black/40">
              <GraySpinner />
            </div>
          )}
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-center">
                  Payment
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
              {orders.map((order) => (
                <tr
                  key={String(order._id)}
                  className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {String(order._id).slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order?.shippingInfo?.fullName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order?.paymentMethod || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    ₹ {order?.totalAmount || 0}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order?.delhiveryCurrentStatus ||
                      order?.orderStatus ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/orderDetails/${order._id}`}
                      className="rounded bg-primary px-3 py-2 text-xs font-medium text-white hover:bg-primary/80"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <p className="py-6 text-center text-gray-500 dark:text-gray-400">
              No orders found for this vendor.
            </p>
          )}
        </div>

        <PaginationComponent
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default VendorDetails;
