/* eslint-disable @next/next/no-img-element */
import { ShippingInfo } from '@/types/order';
import React from 'react';



interface CustomerDetailsProps {
  customer: ShippingInfo;
}

const CustomerDetails: React.FC<CustomerDetailsProps> = ({ customer }) => {
  const { fullName, address,phoneNo, city, country  } = customer;

  return (
    <div className="bg-gray-50 dark:bg-gray-800 w-full xl:w-96 flex justify-between items-center md:items-start px-4 py-6 md:p-6 xl:p-8 flex-col">
      <h3 className="text-xl font-semibold leading-5 text-gray-800 dark:text-gray-100">
        Customer
      </h3>
      <div className="flex flex-col md:flex-row xl:flex-col justify-start items-stretch h-full w-full md:space-x-6 lg:space-x-8 xl:space-x-0">
        <div className="flex flex-col justify-start items-start flex-shrink-0">
          <div className="flex justify-center w-full md:justify-start items-center space-x-4 py-8 border-b border-gray-200 dark:border-gray-700">
            <img src="https://i.ibb.co/5TSg7f6/Rectangle-18.png" alt="avatar" />
            <div className="flex justify-start items-start flex-col space-y-2">
              <p className="text-base font-semibold leading-4 text-left text-gray-800 dark:text-gray-100">
                {fullName}
              </p>
              {/* <p className="text-sm dark:text-gray-300 leading-5 text-gray-600">
                {previousOrders} Previous Orders
              </p> */}
            </div>
          </div>
          <div className="flex justify-center text-gray-800 dark:text-gray-300 md:justify-start items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700 w-full">
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
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

            <p className="cursor-pointer text-sm leading-5 ">{phoneNo}</p>
          </div>
        </div>
        <div className="flex justify-between xl:h-full items-stretch w-full flex-col mt-6 md:mt-0">
          <div className="flex justify-center md:justify-start xl:flex-col flex-col md:space-x-6 lg:space-x-8 xl:space-x-0 space-y-4 xl:space-y-12 md:space-y-0 md:flex-row items-center md:items-start">
            <div className="flex justify-center md:justify-start items-center md:items-start flex-col space-y-4 xl:mt-8">
              <p className="text-base font-semibold leading-4 text-center md:text-left text-gray-800 dark:text-gray-100">
                 Address
              </p>
              <p className="w-48 lg:w-full dark:text-gray-300 xl:w-48 text-center md:text-left text-sm leading-5 text-gray-600">
                {address}
              </p>
              <p className="text-base font-semibold leading-4 text-center md:text-left text-gray-800 dark:text-gray-100">
                 City
              </p>
              <p className="w-48 lg:w-full dark:text-gray-300 xl:w-48 text-center md:text-left text-sm leading-5 text-gray-600">
                {city}
              </p>
              <p className="text-base font-semibold leading-4 text-center md:text-left text-gray-800 dark:text-gray-100">
                 Country
              </p>
              <p className="w-48 lg:w-full dark:text-gray-300 xl:w-48 text-center md:text-left text-sm leading-5 text-gray-600">
                {country}
              </p>
            </div>
            {/* <div className="flex justify-center md:justify-start items-center md:items-start flex-col space-y-4">
              <p className="text-base font-semibold leading-4 text-center md:text-left text-gray-800 dark:text-gray-100">
                Billing Address
              </p>
              <p className="w-48 lg:w-full dark:text-gray-300 xl:w-48 text-center md:text-left text-sm leading-5 text-gray-600">
                {billingAddress}
              </p>
            </div> */}
          </div>
          {/* <div className="flex w-full justify-center items-center md:justify-start md:items-start">
            <button className="mt-6 md:mt-0 dark:border-white dark:hover:bg-gray-700 dark:bg-transparent py-5 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 border border-gray-800  w-96 2xl:w-full text-base font-medium leading-4 text-gray-800 dark:text-gray-100">
              Edit Details
            </button>
          </div> */}
        </div>
      </div>
    </div>
  );
};

// Default props
// CustomerDetails.defaultProps = {
//   customer: {
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     previousOrders: 0,
//     shippingAddress: '123 Main St, Springfield, IL',
//     billingAddress: '123 Main St, Springfield, IL',
//   },
// };

export default CustomerDetails;