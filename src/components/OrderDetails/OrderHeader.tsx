import React, { useState } from "react";
import RadioDropDown from "./RadioDropDown";
import toast from "react-hot-toast";
import {
  useCreateDelhiveryOrderMutation,
  useLazyGetInvoiceUrlQuery,
} from "@/redux/api/orderApi";
import SchedulePickupModal from "../Modals/SchedulePickupModal";
import InvoiceIcon from "../SvgIcons/InvoiceIcon";
import Spinner from "../common/Spinner";

// Define the type for the props
interface OrderHeaderProps {
  orderNumber: string;
  orderDate: string;
  orderStatus: string;
  orderId: string;
  delhiveryStatus?: string;
  delhiveryError?: boolean;
  showCreateDelhiveryLink?: boolean;
  hasWaybill?: boolean;
  waybill?: string;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({
  orderNumber,
  orderDate,
  orderStatus,
  orderId,
  delhiveryStatus,
  delhiveryError,
  showCreateDelhiveryLink = false,
  hasWaybill = false,
  waybill = "",
}) => {
  const [createDelhiveryOrder, { isLoading }] =
    useCreateDelhiveryOrderMutation();
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [getInvoiceUrl, { isFetching: isGeneratingInvoice }] =
    useLazyGetInvoiceUrlQuery();
  const handleGetInvoice = async (orderId: string) => {
    try {
      const url = await getInvoiceUrl(orderId).unwrap();

      // Force download
      const link = document.createElement("a");
      link.href = url;
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
  const handleCreateDelhiveryOrder = async () => {
    try {
      const response = await createDelhiveryOrder(orderId).unwrap();
      toast.success(
        `Delhivery order created with waybill: ${response.waybill}`,
        {
          duration: 4000,
          position: "top-right",
        },
      );
    } catch (err: any) {
      const message = err.data?.message || "Failed to create Delhivery order";
      toast.error(message, {
        duration: 4000,
        position: "top-right",
      });
    }
  };

  return (
    <>
      <div className="flex justify-between">
        <div className="item-start flex flex-col justify-start space-y-2">
          <h1 className="text-3xl font-semibold leading-7 text-gray-800 dark:text-gray-100 lg:text-4xl lg:leading-9">
            Order #{orderNumber}
          </h1>
          <p className="text-base font-medium leading-6 text-gray-600 dark:text-gray-300">
            {orderDate}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {/* Show live Delhivery status if available, otherwise show status dropdown */}
          <div className="flex items-center gap-2">
            {delhiveryStatus && !delhiveryError ? (
              <div className="flex h-full items-center justify-center">
                <span className="inline-block min-w-[220px] rounded-lg bg-blue-700 px-6 py-3 text-center text-base font-semibold text-white shadow-md">
                  {delhiveryStatus}
                </span>
              </div>
            ) : (
              <RadioDropDown orderStatus={orderStatus} orderId={orderId} />
            )}
            <button
              onClick={() => handleGetInvoice(orderId)}
              className="btn border-none bg-gray-300 px-3 py-2.5 text-gray-200 hover:bg-primary/80 dark:bg-gray-700"
            >
              {isGeneratingInvoice ? <Spinner /> : <InvoiceIcon />}
            </button>
          </div>
          {/* Create Delhivery Order button (only when instructed) */}
          {showCreateDelhiveryLink && (
            <button
              onClick={handleCreateDelhiveryOrder}
              disabled={isLoading}
              className={`inline-block text-center text-base font-semibold underline focus:outline-none focus:ring-4 focus:ring-blue-300 ${
                isLoading
                  ? "cursor-not-allowed text-blue-300"
                  : "text-info hover:text-blue-600"
              }`}
            >
              {isLoading ? "Creating..." : "Create Delhivery Order"}
            </button>
          )}

          {/* Schedule Pickup & View Label button (only when waybill exists) */}
          {hasWaybill && !showCreateDelhiveryLink && (
            <button
              onClick={() => setShowPickupModal(true)}
              className="inline-block rounded-lg bg-green-600 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                Schedule Pickup & Label
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Schedule Pickup & Label Modal */}
      <SchedulePickupModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        orderId={orderId}
        waybill={waybill}
        onSuccess={() => {
          toast.success("Pickup scheduled successfully!");
        }}
      />
    </>
  );
};

export default OrderHeader;
