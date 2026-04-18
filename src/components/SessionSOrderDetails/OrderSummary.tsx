import { SessionStartedOrder } from "@/types/sessionStartedOrder";
import React from "react";

const OrderSummary: React.FC<{ order: SessionStartedOrder }> = ({ order }) => {
  const paymentMethod = order.paymentMethod || "Online";
  const paymentAmount = order.paymentAmount ?? order.totalAmount;
  const advancePaidInThisSession =
    order.advancePaidInThisSession ??
    (paymentMethod === "Partial-COD" ? paymentAmount : 0);
  const codCharge = order.codCharge ?? 100;
  const remainingAmount = Math.max(
    order.totalAmount - advancePaidInThisSession,
    0,
  );

  return (
    <div className="flex w-full flex-col space-y-6 bg-gray-50 px-4 py-6 dark:bg-gray-800 md:p-6 xl:p-8">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Summary
      </h3>

      <div className="flex w-full flex-col items-center justify-center space-y-4 border-b border-gray-200 pb-4 dark:border-gray-700">
        <div className="flex w-full justify-between">
          <p className="text-base leading-4 text-gray-800 dark:text-gray-100">
            Subtotal
          </p>
          <p className="text-base leading-4 text-gray-600 dark:text-gray-300">
            Rs. {order.itemsPrice.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between">
        <p className="text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
          Total
        </p>
        <p className="text-base font-semibold leading-4 text-gray-600 dark:text-gray-300">
          Rs. {order.totalAmount.toFixed(2)}
        </p>
      </div>

      <div className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
        <h4 className="text-lg font-medium text-gray-800 dark:text-gray-100">
          Payment Details ({paymentMethod})
        </h4>

        {paymentMethod === "Partial-COD" ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Payment Amount
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                Rs. {paymentAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Advance Paid In This Session
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                Rs. {advancePaidInThisSession.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                COD Charge
              </span>
              <span className="text-gray-800 dark:text-gray-200">
                Rs. {codCharge.toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-600 dark:text-gray-300">
                Balance on Delivery
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                Rs. {remainingAmount.toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
            <span>Amount to Charge Online</span>
            <span>Rs. {paymentAmount.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSummary;
