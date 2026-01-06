"use client";

import React, { useState } from "react"; // Removed unused useEffect
import SelectGroupOne from "../SelectGroup/SelectGroupOne";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateForm } from "@/utlis/validation/productValidators/basicDetails";

interface BasicDetailsProps {
  productProp: Product;
  updateProduct: (data: Product) => void;
  handleNextStep: () => void;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  productProp,
  updateProduct,
  handleNextStep,
}) => {
  const [productState, setProductState] = useState<Product>({
    ...productProp,
    youtubeUrl: Array.isArray(productProp.youtubeUrl) ? productProp.youtubeUrl : productProp.youtubeUrl ? [productProp.youtubeUrl as any] : []
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const updatedProduct = {
      ...productState,
      [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    };

    setProductState(updatedProduct);
    updateProduct(updatedProduct);
  };

  const handleSendValue = (value: any) => {
    const updatedProduct = {
      ...productState,
      category: value,
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
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Size
              </label>
              <select
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                name="size"
                value={productState.size}
                onChange={handleChange} // Fixed to use handleChange
              >
                <option value="">Select Size</option>
                <option value="Small">Small</option>
                <option value="Medium">Medium</option>
                <option value="Large">Large</option>
              </select>
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Capacity {/* Fixed typo */}
              </label>
              <input
                type="number"
                name="capacity"
                value={productState.capacity}
                onChange={handleChange}
                placeholder="Enter capacity"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
            </div>
          </div>
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
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
          <SelectGroupOne
            category={productState.category}
            sendValue={handleSendValue}
          />
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
