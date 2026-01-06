"use client";

import React, { useEffect, useState } from "react";
import SelectGroupOne from "../SelectGroup/SelectGroupOne";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateForm } from "@/utlis/validation/productValidators/basicDetails";
import { useUpdateOfferEndTimeBulkMutation } from "@/redux/api/productsApi";

interface BasicDetailsProps {
  productProp: Product;
  updateProduct: (data: Product) => void;
  handleNextStep: () => void;
  updateBulkUpdateFlag: (isBulkUpdate: boolean) => void;
  isUpdate: boolean;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  productProp,
  updateProduct,
  updateBulkUpdateFlag,
  handleNextStep,
  isUpdate = false,
}) => {
  const [productState, setProductState] = useState<Product>({
    ...productProp,
    youtubeUrl: Array.isArray(productProp.youtubeUrl) ? productProp.youtubeUrl : productProp.youtubeUrl ? [productProp.youtubeUrl as any] : []
  });
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [updateOfferEndTimeBulk] = useUpdateOfferEndTimeBulkMutation();
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

  const handleAddYoutubeUrl = () => {
    const updatedProduct = {
      ...productState,
      youtubeUrl: [...(productState.youtubeUrl || []), ""],
    };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleYoutubeUrlChange = (index: number, value: string) => {
    const updatedUrls = [...(productState.youtubeUrl || [])];
    updatedUrls[index] = value;
    const updatedProduct = {
      ...productState,
      youtubeUrl: updatedUrls,
    };
    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleRemoveYoutubeUrl = (index: number) => {
    const updatedUrls = (productState.youtubeUrl || []).filter((_, i) => i !== index);
    const updatedProduct = {
      ...productState,
      youtubeUrl: updatedUrls,
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
  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      if (isBulkUpdate) {
        console.log("isBulkUpdate");

        const response = await updateOfferEndTimeBulk(
          productState.offerEndTime || null,
        ).unwrap();
        Swal.fire({
          title: "Success",
          text: response.message,
          icon: "success",
        });
      }

      updateProduct(productState);
      handleNextStep();
    } catch (error: any) {
      Swal.fire({
        title: "Error",
        text: error?.data?.message || "Failed to update offer end time",
        icon: "error",
      });
    }
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsBulkUpdate(e.target.checked);
    updateBulkUpdateFlag(e.target.checked);
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
          <div className="justify-strech mb-4.5  flex items-center gap-4 align-middle">
            <div className="flex flex-col">
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
            <label className="mt-2 inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                checked={isBulkUpdate}
                onChange={handleToggle}
                className="peer sr-only"
              />
              <div className="peer relative h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600 dark:peer-focus:ring-blue-800 rtl:peer-checked:after:-translate-x-full" />
              <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                Apply to all products
              </span>
            </label>
          </div>
          <div className="mb-4.5">
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
              YouTube Video Links
            </label>
            <div className="space-y-3">
              {(productState.youtubeUrl || []).map((url, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => handleYoutubeUrlChange(index, e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveYoutubeUrl(index)}
                    className="btn btn-error btn-outline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddYoutubeUrl}
                className="btn btn-primary btn-outline btn-sm"
              >
                + Add Another Link
              </button>
            </div>
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
