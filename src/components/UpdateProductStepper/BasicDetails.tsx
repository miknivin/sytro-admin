"use client";

import React, { useEffect, useState } from "react";
import SelectGroupOne from "../SelectGroup/SelectGroupOne";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateForm } from "@/utlis/validation/productValidators/basicDetails";

interface BasicDetailsProps {
  productProp: Product;
  updateProduct: (data: Product) => void;
  handleNextStep: () => void;
  isUpdate: boolean;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  productProp,
  updateProduct,
  handleNextStep,
  isUpdate = false,
}) => {
  const [productState, setProductState] = useState<Product>(productProp);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    let updatedValue: any = value;

    if (name === "offerEndTime") {
      updatedValue = value ? new Date(value).toISOString() : "";
    } else if (type === "number") {
      updatedValue = value === "" ? "" : Number(value);
    }

    const updatedProduct = {
      ...productState,
      [name]: updatedValue,
    };

    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const formatDateForInput = (date: Date | string | undefined): string => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    // Convert to local time and format to YYYY-MM-DDTHH:mm
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
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

  const getCurrentDateTime = (): string => {
    const now = new Date();
    return now.toISOString().slice(0, 16); // Format to YYYY-MM-DDTHH:mm
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors } = validateForm(productState);

    if (!isValid) {
      Swal.fire({
        title: "Validation Error",
        html: errors.join("<br>"),
        icon: "error",
      });
      return;
    }

    updateProduct(productState);
    handleNextStep();
  };

  return (
    <div className="rounded-lg border p-4 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">Step 1: Basic Details</h2>
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
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              Offer End Time
            </label>
            <input
              type="datetime-local"
              name="offerEndTime"
              min={getCurrentDateTime()}
              value={formatDateForInput(productState.offerEndTime)}
              onChange={handleChange}
              placeholder="Select offer end date and time"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
          </div>
          {/* Category Selection */}
          <SelectGroupOne
            category={productState.category}
            sendValue={handleSendValue}
          />
          {!isUpdate && (
            <button
              type="submit"
              className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Submit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BasicDetails;
