"use client";

import React, { useEffect, useState } from "react";
import SelectGroupOne from "../SelectGroup/SelectGroupOne";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateForm } from "@/utlis/validation/productValidators/basicDetails";

interface BasicDetailsProps {
  productProp: Product;
  updateProduct: (data: Product) => void; 
  handleNextStep:()=>void
}

const BasicDetails: React.FC<BasicDetailsProps> = ({ productProp, updateProduct, handleNextStep }) => {
  const [productState, setProductState] = useState<Product>(productProp); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const updatedProduct = {
      ...productState,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    };
    
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  // Update both local state and parent component's state for category
  const handleSendValue = (value: any) => {
    const updatedProduct = {
      ...productState,
      category: value,
    };
    
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateForm(productState);
    
    if (!isValid) {
      Swal.fire({
        title: 'Validation Error',
        html: errors.join('<br>'),
        icon: 'error'
      });
      return;
    }
   
    updateProduct(productState);
    handleNextStep();
   };

  return (
    <div className="p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Step 1: Basic Details</h2>
      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* Product Name */}
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Name of the Product
              </label>
              <input
                type="text"
                name="name"
                value={productState.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Stock */}
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Stocks
              </label>
              <input
                type="number"
                name="stock"
                value={productState.stock}
                onChange={handleChange}
                placeholder="Enter stock quantity"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* Actual Price */}
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Actual Price
              </label>
              <input
                type="number"
                name="actualPrice"
                value={productState.actualPrice}
                onChange={handleChange}
                placeholder="Enter actual price"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>

            {/* Offer Price */}
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Offer Price
              </label>
              <input
                type="number"
                name="offer"
                value={productState.offer || ""}
                onChange={handleChange}
                placeholder="Enter offer price"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>

          {/* Category Selection */}
          <SelectGroupOne category={productState.category} sendValue={handleSendValue}  />
          {/* <SimpleFileInput/> */}
          <button
            type="submit"
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicDetails;
