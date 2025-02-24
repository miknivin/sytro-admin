"use client";
import React, { useEffect, useState } from "react";
import BasicDetails from "./BasicDetails";
import Descriptions from "./Descriptions";
import ImageUpload from "./ImageUpload";
import { Product } from "@/interfaces/product";
import { isProductValid } from "@/utlis/validation/productValidators/entireProduct";
import { useCreateProductMutation } from "@/redux/api/productsApi";
import Swal from "sweetalert2";
import Loader from "../common/Loader";

const StepperApp = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [createProduct, { isLoading, error,isSuccess }] = useCreateProductMutation();
  const [product, setProduct] = useState<Product>({
    name: "", 
    actualPrice: 0,
    offer: 0,
    details: { description: "",features:[],materialUsed:[] },
    category: "Kids Bags",
    stock: 0,
    user: "",
    images:[]
  });

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleSubmit = async () => {
    if (!isProductValid(product)) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fill all required fields before submitting.",
      });
      return;
    }
  
    // Convert images from object format to an array of strings
    const formattedProduct = {
      ...product,
      images: product.images.map((img) => (typeof img === "object" ? img.url : img)), // Ensure only URLs are sent
    };
  
    try {
      const response = await createProduct(formattedProduct).unwrap();
      console.log("Product created successfully:", response);
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Product created successfully!",
      });

      setProduct({
        name: "",
        actualPrice: 0,
        offer: 0,
        details: { description: "", features: [], materialUsed: [] },
        category: "Kids Bags",
        stock: 0,
        user: "",
        images: [],
      });
      setCurrentStep(1);
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };
  

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (step: number) => {
    if (step>currentStep) {
      return
    }
    setCurrentStep(step);
  };

  const handleIncomingData = (data:Product) => {
    setProduct((prev) => ({
      ...prev,
      ...data,
    }));
    //console.log(product,'product from parent');
    
  };

  if (isLoading) {
    return <Loader />;
  }


  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Stepper UI */}
      <ol className="flex justify-center space-x-8">
        {["Basic Details", "Descriptions", "Image Upload"].map((title, index) => {
          const step = index + 1;
          return (
            <li
              key={step}
              onClick={() => handleStepClick(step)}
              className={`flex items-center cursor-pointer space-x-2.5 ${
                currentStep >= step ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <span
                className={`flex items-center justify-center w-8 h-8 border rounded-full ${
                  currentStep >= step ? "border-blue-600" : "border-gray-500"
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

      {/* Step Content */}
      <div className="mt-8">
        {currentStep === 1 && (
          <BasicDetails 
            productProp={product} 
            handleNextStep={nextStep}
            updateProduct={handleIncomingData} />
        )}
        {currentStep === 2 && (
          <Descriptions 
            productProp={product} 
            handleNextStep={nextStep}
            updateProduct={handleIncomingData}
          />
        )}
        {currentStep === 3 && (
          <ImageUpload 
            productProp={product} 
            handleNextStep={handleSubmit}
            updateProduct={handleIncomingData}
          />
        )}
      </div>


    </div>
  );
};

export default StepperApp;
