/* eslint-disable @next/next/no-img-element */
import { ShippingInfo } from "@/types/order";
import React, { useState, useEffect } from "react";
import { useUpdateOrderMutation } from "@/redux/api/orderApi";
import toast from "react-hot-toast";

interface CustomerDetailsProps {
  customer: ShippingInfo;
  orderId: string;
  isSessionOrder?: boolean;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer, orderId, isSessionOrder = false }) => {
  const { fullName, address, phoneNo, city, state, country, zipCode } = customer;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: fullName || "",
    phoneNo: phoneNo || "",
    address: address || "",
    zipCode: zipCode || "",
    city: city || "",
    state: state || "",
    country: country || "",
  });

  const [updateOrder, { isLoading }] = useUpdateOrderMutation();

  useEffect(() => {
    if (customer) {
      setFormData({
        fullName: customer.fullName || "",
        phoneNo: customer.phoneNo || "",
        address: customer.address || "",
        zipCode: customer.zipCode || "",
        city: customer.city || "",
        state: customer.state || "",
        country: customer.country || "",
      });
    }
  }, [customer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      await updateOrder({ id: orderId, body: { shippingInfo: formData } }).unwrap();
      toast.success("Address updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update address");
      console.error(error);
    }
  };

  return (
    <div className="flex w-full flex-col items-center justify-between bg-gray-50 px-4 py-6 dark:bg-gray-800 md:items-start md:p-6 xl:w-96 xl:p-8">
      <div className="flex w-full justify-between items-center mb-4">
        <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
          Customer
        </h3>
        {!isEditing ? (
          !isSessionOrder && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Edit Address
            </button>
          )
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="text-sm font-medium text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        )}
      </div>

      <div className="flex h-full w-full flex-col items-stretch justify-start md:flex-row md:space-x-6 lg:space-x-8 xl:flex-col xl:space-x-0">
        <div className="flex flex-shrink-0 flex-col items-start justify-start">
          <div className="flex w-full items-center justify-center space-x-4 border-b border-gray-200 py-6 dark:border-gray-700 md:justify-start">
            <div className="flex w-full flex-col items-start justify-start space-y-2">
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Full Name"
                  className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                />
              ) : (
                <p className="text-left text-base font-semibold leading-4 text-gray-800 dark:text-gray-100">
                  {fullName}
                </p>
              )}
            </div>
          </div>
          <div className="flex w-full items-center justify-center space-x-4 border-b border-gray-200 py-4 text-gray-800 dark:border-gray-700 dark:text-gray-300 md:justify-start">
            <svg
              className="h-6 w-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z"
              />
            </svg>
            {isEditing ? (
              <input
                type="text"
                name="phoneNo"
                value={formData.phoneNo}
                onChange={handleInputChange}
                placeholder="Phone No"
                className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
              />
            ) : (
              <p className="cursor-pointer text-sm leading-5 ">{phoneNo}</p>
            )}
          </div>
        </div>
        <div className="mt-6 flex w-full flex-col items-stretch justify-between md:mt-0 xl:h-full">
          <div className="flex flex-col items-center justify-center space-y-4 md:flex-row md:items-start md:justify-start md:space-x-6 md:space-y-0 lg:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-4">
            <div className="flex w-full flex-col items-center justify-center space-y-4 md:items-start md:justify-start xl:mt-8">
              
              <div className="w-full">
                <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left mb-2">
                  Address
                </p>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white min-h-[60px]"
                  />
                ) : (
                  <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                    {address}
                  </p>
                )}
              </div>

              <div className="w-full">
                <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left mb-2">
                  Pin Code
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="Pin Code"
                    className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                    {zipCode}
                  </p>
                )}
              </div>

              <div className="w-full">
                <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left mb-2">
                  City
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                    {city}
                  </p>
                )}
              </div>

              <div className="w-full">
                <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left mb-2">
                  State
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="State"
                    className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                    {state}
                  </p>
                )}
              </div>

              <div className="w-full">
                <p className="text-center text-base font-semibold leading-4 text-gray-800 dark:text-gray-100 md:text-left mb-2">
                  Country
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    placeholder="Country"
                    className="w-full rounded border px-2 py-1 text-sm dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="w-48 text-center text-sm leading-5 text-gray-600 dark:text-gray-300 md:text-left lg:w-full xl:w-48">
                    {country}
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
