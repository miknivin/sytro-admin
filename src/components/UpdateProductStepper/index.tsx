"use client";
import React, { useEffect, useState } from "react";
import BasicDetails from "./BasicDetails";
import Descriptions from "./Descriptions";
import { Product } from "@/interfaces/product";
import { isProductValid } from "@/utlis/validation/productValidators/entireProduct";
import {
  useGetProductDetailsQuery,
  useUpdateOfferEndTimeBulkMutation,
  useUpdateProductMutation,
} from "@/redux/api/productsApi";
import Swal from "sweetalert2";
import Loader from "../common/Loader";
import { useRouter } from "next/navigation";

interface UpdateProductStepperProps {
  productId: string;
}

const UpdateProductStepper: React.FC<UpdateProductStepperProps> = ({
  productId,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [isBulkUpdate, setIsBulkUpdate] = useState(false);
  const [updateOfferEndTimeBulk] = useUpdateOfferEndTimeBulkMutation();
  const {
    data: fetchedProduct,
    isLoading: loadingProduct,
    error: productFetchError,
  } = useGetProductDetailsQuery(productId);
  const [updateProduct, { isLoading, error, isSuccess }] =
    useUpdateProductMutation();

  useEffect(() => {
    if (fetchedProduct?.productById) {
      setProduct(fetchedProduct.productById);
      console.log("Fetched Product:", fetchedProduct.productById);
    }
  }, [fetchedProduct]);

  useEffect(() => {
    if (isSuccess) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product updated successfully!",
      }).then(() => {
        router.push("/products");
      });

      setProduct(null);
      setCurrentStep(1);
    }
  }, [isSuccess]);

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleBulkUpdateFlag = (isBulkUpdate: boolean) => {
    setIsBulkUpdate(isBulkUpdate);
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const handleIncomingData = (data: Product) => {
    setProduct((prev) => ({ ...prev, ...data }) as Product);
    console.log("Updated Product:", { ...product, ...data });
  };

  const handleSubmit = async () => {
    if (!product || !isProductValid(product)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields before submitting.",
      });
      return;
    }

    const formattedProduct = {
      ...product,
      images: product.images
        .map((img) =>
          typeof img === "object" && img?.url ? img.url : String(img || ""),
        )
        .filter(Boolean),
    };

    try {
      if (isBulkUpdate) {
        const response = await updateOfferEndTimeBulk(
          product.offerEndTime || null,
        ).unwrap();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: response.message,
        });
      }

      await updateProduct({ id: productId, body: formattedProduct }).unwrap();
    } catch (err: any) {
      console.error("Error updating product:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update product.",
      });
    }
  };

  if (loadingProduct || isLoading) {
    return <Loader />;
  }

  if (productFetchError) {
    return <div>Error loading product data</div>;
  }

  if (!product) {
    return <div>Loading product details...</div>; // Wait for product to be set
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <ol className="flex justify-center space-x-8">
        {["Basic Details", "Descriptions"].map((title, index) => {
          const step = index + 1;
          return (
            <li
              key={step}
              onClick={() => handleStepClick(step)}
              className={`flex cursor-pointer items-center space-x-2.5 ${
                currentStep === step ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full border ${
                  currentStep === step ? "border-blue-600" : "border-gray-500"
                }`}
              >
                {step}
              </span>
              <span>
                <h3 className="font-medium">{title}</h3>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8">
        {currentStep === 1 && (
          <BasicDetails
            productProp={product}
            handleNextStep={nextStep}
            updateBulkUpdateFlag={handleBulkUpdateFlag}
            updateProduct={handleIncomingData}
            isUpdate={true}
          />
        )}
        {currentStep === 2 && (
          <Descriptions
            isUpdate={true}
            productProp={product}
            handleNextStep={handleSubmit}
            updateProduct={handleIncomingData}
          />
        )}
        <button
          onClick={handleSubmit}
          type="button"
          className="mt-2 flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default UpdateProductStepper;
