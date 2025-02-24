/* eslint-disable @next/next/no-img-element */
import { Order, OrderItem } from '@/types/order';
import React from 'react';



interface ProductItemProps {
  product: OrderItem;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { name, quantity, image, price } = product;

  return (
    <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-start items-start md:items-center md:space-x-6 xl:space-x-8 w-full">
      <div className="pb-4 md:pb-8 w-full md:w-40">
        <img
          className="w-full hidden md:block"
          src={image}
          alt={name}
        />
        {/* <img
          className="w-full md:hidden"
          src={images.mobile}
          alt={name}
        /> */}
      </div>
      <div className="border-b border-gray-200 dark:border-gray-700 md:flex-row flex-col flex justify-between items-start w-full pb-8 space-y-4 md:space-y-0">
        <div className="w-full flex flex-col justify-start items-start space-y-8">
          <h3 className="text-xl xl:text-2xl font-semibold leading-6 text-gray-800 dark:text-gray-100">
            {name}
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
        <div className="flex justify-between space-x-8 items-start w-full">
          <p className="text-base xl:text-lg leading-6">
            ${price} 
          </p>
          <p className="text-base xl:text-lg leading-6 text-gray-800 dark:text-gray-100">
            {quantity}
          </p>
          <p className="text-base xl:text-lg font-semibold leading-6 text-gray-800 dark:text-gray-100">
            ${Number(price) * quantity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;