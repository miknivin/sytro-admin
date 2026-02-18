import { Order } from "@/types/order";
import React from "react";

const OrderSummary: React.FC<{ order: Order }> = ({ order }) => {
  console.log("Order data in summary:", order);

  const {
    itemsPrice = 0,
    shippingAmount = 0,
    taxAmount = 0,
    discountAmount = 0,
    totalAmount = 0,
    advancePaid = 0,
    remainingAmount = 0,
    codAmount = 0,
    codChargeCollected = 0,
    couponApplied = "No",
    couponDiscountType = "",
    couponDiscountValue = 0,
    orderNotes = "",
    paymentMethod = "Unknown",
  } = order;

  // Calculate base subtotal before discount (for display)
  const baseSubtotal = itemsPrice + shippingAmount + taxAmount;

  return (
    <div className="flex w-full flex-col space-y-6 bg-gray-50 px-4 py-6 dark:bg-gray-800 md:p-6 xl:p-8">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Summary
      </h3>

      {/* Pricing Breakdown */}
      <div className="flex w-full flex-col items-center justify-center space-y-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex w-full justify-between">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Items Total
          </p>
          <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
            ₹{itemsPrice.toFixed(2)}
          </p>
        </div>

        {shippingAmount > 0 && (
          <div className="flex w-full justify-between">
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              Shipping
            </p>
            <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
              ₹{shippingAmount.toFixed(2)}
            </p>
          </div>
        )}

        {taxAmount > 0 && (
          <div className="flex w-full justify-between">
            <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
              Tax
            </p>
            <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
              ₹{taxAmount.toFixed(2)}
            </p>
          </div>
        )}

        {couponApplied !== "No" && (
          <>
            <div className="flex w-full justify-between">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Coupon Applied
              </p>
              <p className="text-base italic leading-4 text-gray-800 dark:text-gray-100">
                {couponApplied}
              </p>
            </div>

            <div className="flex w-full justify-between">
              <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
                Discount{" "}
                {couponDiscountValue
                  ? couponDiscountType === "percentage"
                    ? `(${couponDiscountValue}%)`
                    : `(₹${couponDiscountValue})`
                  : ""}
              </p>
              <p className="text-base font-medium leading-4 text-red-500">
                -₹{discountAmount.toFixed(2)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Final Total */}
      <div className="flex w-full items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
        <p className="text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
          Grand Total
        </p>
        <p className="text-base font-semibold leading-4 text-gray-900 dark:text-gray-100">
          ₹{totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Payment Breakdown – Admin sees full details */}
      <div className="space-y-3">
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
          Payment Details ({paymentMethod})
        </h4>

        {paymentMethod === "Partial-COD" && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Advance Paid
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                ₹{advancePaid.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                COD Charge (paid in advance)
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                ₹{codChargeCollected.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between border-t pt-2 text-sm font-medium dark:border-gray-700">
              <span>Remaining / COD Amount to Collect</span>
              <span className="text-blue-600 dark:text-blue-400">
                ₹{remainingAmount.toFixed(2)}
              </span>
            </div>
          </>
        )}

        {paymentMethod === "Online" && (
          <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
            <span>Full Amount Paid Online</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        )}

        {paymentMethod === "COD" && (
          <div className="flex justify-between text-sm font-medium text-orange-600 dark:text-orange-400">
            <span>Full Amount to Collect on Delivery</span>
            <span>₹{totalAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Order Notes */}
      <div className="mt-4">
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
          Order Notes
        </h4>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {orderNotes || "No notes provided."}
        </p>
      </div>
    </div>
  );
};

export default OrderSummary;
