/* eslint-disable @next/next/no-img-element */
import { Order, OrderItem } from "@/types/order";
import React from "react";

interface ProductItemProps {
  product: OrderItem;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { name, quantity, image, price, uploadedImage } = product;

  return (
    <div className="mt-4 flex w-full flex-col items-start justify-start md:mt-6 md:flex-row md:items-center md:space-x-6 xl:space-x-8">
      <div className="w-full pb-4 md:w-40 md:pb-8">
        <img className="hidden w-full md:block" src={image} alt={name} />
        {/* <img
          className="w-full md:hidden"
          src={images.mobile}
          alt={name}
        /> */}
      </div>
      <div className="flex w-full flex-col items-start justify-between space-y-4 border-b border-gray-200 pb-8 dark:border-gray-700 md:flex-row md:space-y-0">
        <div className="flex w-full flex-col items-start justify-start space-y-8">
          <h3 className="text-xl font-semibold leading-6 text-gray-800 dark:text-gray-100 xl:text-2xl">
            {name} <br />
            <a
              className="text-sm text-blue-400 underline"
              target="_blank"
              href={uploadedImage}
            >
              Uploaded image
            </a>
          </h3>
          {/* <div className="flex justify-start items-start flex-col space-y-2">
            <p className="text-sm dark:text-gray-300 leading-none text-gray-800">
              <span className="dark:text-gray-400 text-gray-300">Style: </span> {style}
            </p>
            <p className="text-sm dark:text-gray-300 leading-none text-gray-800">
              <span className="dark:text-gray-400 text-gray-300">Size: </span> {size}
            </p>
            <p className="text-sm dark:text-gray-300 leading-none text-gray-800">
              <span className="dark:text-gray-400 text-gray-300">Color: </span> {color}
            </p>
          </div> */}
        </div>
        <div className="flex w-full items-start justify-between space-x-8">
          <p className="text-base leading-6 xl:text-lg">₹{price}</p>
          <p className="text-base leading-6 text-gray-800 dark:text-gray-100 xl:text-lg">
            {quantity}
          </p>
          <p className="text-base font-semibold leading-6 text-gray-800 dark:text-gray-100 xl:text-lg">
            ₹{Number(price) * quantity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
