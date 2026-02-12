"use client";

import {
  useGetAdminOrdersQuery,
  useDeleteOrderMutation,
  useSyncDelhiveryOrdersMutation,
  useLazyGetInvoiceUrlQuery,
} from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Parser } from "json2csv";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import PreviewIcon from "../SvgIcons/PreviewIcon";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import ReusableAlert from "@/utlis/alerts/ReusableAlert";
import toast from "react-hot-toast";
import SearchInput from "@/utlis/search/SearchInput";
// import Download from "../SvgIcons/Download";
import CsvIcon from "../SvgIcons/CsvIcon"; // replaces your old Download icon
import { Tooltip } from "@mui/material";
import Spinner from "../common/Spinner"; // for better loading states
import SyncIcon from "../SvgIcons/SyncIcons";
import InvoiceIcon from "../SvgIcons/InvoiceIcon";
// Define all hooks at the top
const OrderTable = () => {
  const { data, isLoading, isError } = useGetAdminOrdersQuery(null);
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [syncDelhiveryOrders, { isLoading: isSyncing }] =
    useSyncDelhiveryOrdersMutation();

  const [getInvoiceUrl, { isFetching: isGeneratingInvoice }] =
    useLazyGetInvoiceUrlQuery();
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredOrders = useMemo(() => {
    if (!data?.orders || !searchQuery) return data?.orders || [];
    const queryLower = searchQuery.toLowerCase();
    return data.orders.filter((order: Order) => {
      const orderId = order._id.toLowerCase();
      const fullName = order.shippingInfo.fullName?.toLowerCase() || "";
      const phoneNo = order.shippingInfo.phoneNo.toLowerCase() || "";
      return (
        orderId.includes(queryLower) ||
        fullName.includes(queryLower) ||
        phoneNo.includes(queryLower)
      );
    });
  }, [data?.orders, searchQuery]);

  // Calculate paginated data from filtered orders
  const totalItems = filteredOrders.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Handle page change

  const handleSyncOrders = async () => {
    try {
      const response = await syncDelhiveryOrders({}).unwrap();
      toast.success(
        response.message || "Orders synced successfully with Delhivery",
      );
    } catch (error) {
      // Error already handled in RTK Query
    }
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      alert("No orders available to export!");
      return;
    }

    setIsDownloading(true);

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
      {
        label: "Order Status",
        value: (order: any) =>
          order.delhiveryCurrentOrderStatus || order.orderStatus,
      },
      { label: "Date", value: "createdAt" },
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(filteredOrders);

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

  // Open delete modal
  const openDeleteModal = (order: Order) => {
    setCurrentOrder(order);
    setIsDeleteModalOpen(true);
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setCurrentOrder(null);
    setIsDeleteModalOpen(false);
  };

  // Handle order deletion
  const handleDelete = async () => {
    if (!currentOrder) return;
    try {
      await deleteOrder(currentOrder._id).unwrap();
      toast.success("Order deleted successfully");
      closeDeleteModal();
    } catch (error) {
      toast.error("Error deleting");
      console.error("Failed to delete order:", error);
    }
  };

  // Early returns after hooks
  if (isLoading) {
    return <p>Loading orders...</p>;
  }

  if (isError) {
    return <p>Error loading orders.</p>;
  }

  const handleGetInvoice = async (orderId: string) => {
    try {
      const url = await getInvoiceUrl(orderId).unwrap();

      // Force download
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = `invoice-${orderId.slice(-6)}.pdf`; // nice filename e.g. invoice-abc123.pdf
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Optional: show success feedback
      toast.success("Invoice downloaded successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to generate/download invoice");
      console.error("Invoice error:", err);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
        <div className="gap-4">
          <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
            Orders
          </h4>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchInput
          placeholder="Search by name, order ID, phone..."
          onSearch={handleSearch}
        />
        <div className="flex items-center justify-end gap-4">
          <select
            defaultValue="8"
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option disabled>Select items per page</option>
            <option value="5">5</option>
            <option value="8">8</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>

          {/* Export CSV Button */}
          <Tooltip title="Export as CSV" arrow>
            <button
              onClick={exportToCSV}
              disabled={isDownloading}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              {isDownloading ? <Spinner /> : <CsvIcon />}
            </button>
          </Tooltip>

          {/* Sync with Delhivery Button */}
          <Tooltip title="Sync Orders with Delhivery" arrow>
            <button
              onClick={handleSyncOrders}
              disabled={isSyncing}
              className="rounded bg-primary px-4 py-2 text-sm text-white hover:bg-primary/70 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
            >
              {isSyncing ? <Spinner /> : <SyncIcon />}
            </button>
          </Tooltip>
        </div>
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
            {paginatedOrders?.map((order: Order) => (
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
                  {order.shippingInfo.fullName || "N/A"}
                </td>
                <td className="px-6 py-4 text-center">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center">
                  {order.delhiveryCurrentStatus || order.orderStatus}
                </td>
                <td className="px-6 py-4 text-center">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link
                      href={`/orderDetails/${order._id}`}
                      className="btn border-none bg-primary p-3 text-gray-200 hover:bg-primary/80"
                    >
                      <PreviewIcon />
                    </Link>
                    <button
                      onClick={() => handleGetInvoice(order._id)}
                      className="btn border-none bg-gray-300 p-3 text-gray-200 hover:bg-primary/80 dark:bg-gray-700"
                    >
                      {isGeneratingInvoice ? <Spinner /> : <InvoiceIcon />}
                    </button>
                    <button
                      onClick={() => openDeleteModal(order)}
                      className="btn border-none bg-red-600 p-3 text-gray-200 hover:bg-red-600/80"
                      disabled={isDeleting}
                    >
                      <DeleteIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!filteredOrders || filteredOrders.length === 0) && (
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No orders match your search."
                : "No orders found."}
            </p>
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={Math.ceil(totalItems / itemsPerPage)}
        onPageChange={handlePageChange}
      />

      {isDeleteModalOpen && currentOrder && (
        <ReusableAlert
          title="Confirm Deletion"
          content={`Are you sure you want to delete order "${currentOrder._id.slice(-6)}"?`}
          func={handleDelete}
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          functionTitle="Delete"
          buttonStyle="bg-red-600"
        />
      )}
    </div>
  );
};

export default OrderTable;
