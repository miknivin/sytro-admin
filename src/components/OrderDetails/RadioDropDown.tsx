"use client";
import { useState, useEffect } from "react";
import { useUpdateOrderMutation } from "@/redux/api/orderApi"; // Adjust path as needed
import { toast } from "react-hot-toast"; // Import toast

interface RadioDropDownProps {
  orderId: string;
  orderStatus: string;
}

export default function RadioDropDown({ orderId, orderStatus }: RadioDropDownProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>(orderStatus);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [updateOrder, { isLoading }] = useUpdateOrderMutation();

  useEffect(() => {
    setSelectedStatus(orderStatus);
  }, [orderStatus]);

  const handleStatusChange = async (status: string) => {
    setSelectedStatus(status);
    setIsOpen(false); // Close dropdown after selection

    const updatePromise = updateOrder({ id: orderId, body: { orderStatus: status } }).unwrap();

    toast.promise(updatePromise, {
      loading: "Updating order...",
      success: "Order status updated successfully!",
      error: "Failed to update order status.",
    });

    try {
      await updatePromise;
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="relative">
      <button
        id="dropdownRadioButton"
        onClick={() => setIsOpen((prev) => !prev)}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {selectedStatus}{" "}
        <svg
          className="w-2.5 h-2.5 ms-3"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m1 1 4 4 4-4" />
        </svg>
      </button>

      {/* Dropdown menu */}
      <div
        id="dropdownDefaultRadio"
        className={`absolute left-0 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-gray-700 dark:divide-gray-600 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <ul className="p-3 space-y-3 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="dropdownRadioButton">
          {["Processing", "Shipped", "Delivered"].map((status) => (
            <li key={status}>
              <div className="flex items-center">
                <input
                  id={`radio-${status}`}
                  type="radio"
                  name="order-status"
                  value={status}
                  checked={selectedStatus === status}
                  onChange={() => handleStatusChange(status)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                />
                <label htmlFor={`radio-${status}`} className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                  {status}
                </label>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
