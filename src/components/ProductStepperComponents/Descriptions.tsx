"use client;"

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";
import { validateProductDetails } from "@/utlis/validation/details";

interface DescriptionsProps {
 productProp: Product;
 updateProduct: (data: Product) => void; 
 handleNextStep: () => void;
}

const Descriptions: React.FC<DescriptionsProps> = ({ productProp, updateProduct, handleNextStep }) => {
 const [description, setDescription] = useState(productProp.details.description);
 const [currentFeatures, setCurrentFeatures] = useState("");
 const [features, setFeatures] = useState(productProp.details.features || []);
 const [currentMaterial, setCurrentMaterial] = useState("");
 const [materials, setMaterials] = useState(productProp.details.materialUsed || []);



 const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  const { isValid, errors } = validateProductDetails(productProp);
  
  if (!isValid) {
    Swal.fire({
      title: 'Validation Error',
      html: errors.join('<br>'),
      icon: 'error'
    });
    return;
  }

  updateProduct({
    ...productProp,
    details: {
      description,
      features,
      materialUsed: materials
    }
  });
  handleNextStep();
};


 const handleDescription = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
   setDescription(e.target.value);
   updateProduct({
     ...productProp,
     details: {
       ...productProp.details,
       description: e.target.value
     }
   });
 };

 const handleFeatureSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   if (!currentFeatures.trim()) return;
   const newFeatures = [...features, currentFeatures];
   setFeatures(newFeatures);
   setCurrentFeatures("");
   updateProduct({
     ...productProp,
     details: {
       ...productProp.details,
       features: newFeatures
     }
   });
 };

 const handleMaterialSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   if (!currentMaterial.trim()) return;
   const newMaterials = [...materials, currentMaterial];
   setMaterials(newMaterials);
   setCurrentMaterial("");
   updateProduct({
     ...productProp,
     details: {
       ...productProp.details,
       materialUsed: newMaterials
     }
   });
 };

 const removeFeature = (index: number) => {
   const newFeatures = features.filter((_, i) => i !== index);
   setFeatures(newFeatures);
   updateProduct({
     ...productProp,
     details: {
       ...productProp.details,
       features: newFeatures
     }
   });
 };

 const removeMaterial = (index: number) => {
   const newMaterials = materials.filter((_, i) => i !== index);
   setMaterials(newMaterials);
   updateProduct({
     ...productProp,
     details: {
       ...productProp.details,
       materialUsed: newMaterials
     }
   });
 };

 return (
   <div className="p-4 border rounded-lg shadow-md">
     <h2 className="text-xl font-semibold mb-4">Step 2: Product Details</h2>
     <form onSubmit={handleSubmit}>
       <div className="px-6.5">
         <div className="mb-6">
           <label className="mb-3 block text-sm font-medium text-black dark:text-white">
             Description
           </label>
           <textarea
             value={description}
             onChange={handleDescription}
             rows={6}
             placeholder="Type your message"
             className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
           ></textarea>
         </div>
       </div>

       <div className="px-6.5">
         <label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
           Features
         </label>
         <div className="relative mb-6">
           <input
             type="text"
             id="features"
             value={currentFeatures}
             onChange={(e) => setCurrentFeatures(e.target.value)}
             className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
             placeholder="features"
           />
           <button
             type="button"
             onClick={handleFeatureSubmit}
             className="text-white absolute end-2.5 top-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
           >
             Add
           </button>
         </div>
       </div>

       <div className="px-6.5 mt-4 flex gap-3 flex-wrap">

         {features && features.map((feature, index) => (
           <button
             key={index}
             type="button"
             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
           >
             {feature}
             <span
               className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full"
               onClick={() => removeFeature(index)}
             >
               <FontAwesomeIcon icon={faXmark} />
             </span>
           </button>
         ))}
       </div>

       <div className="px-6.5 mt-5">
         <label className="mb-3 block text-sm font-medium text-gray-900 dark:text-white">
           Material Used
         </label>
         <div className="relative mb-6">
           <input
             type="text"
             id="materials"
             value={currentMaterial}
             onChange={(e) => setCurrentMaterial(e.target.value)}
             className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
             placeholder="Add material"
           />
           <button
             type="button"
             onClick={handleMaterialSubmit}
             className="text-white absolute end-2.5 top-1.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
           >
             Add
           </button>
         </div>
       </div>

       <div className="px-6.5 mt-4 flex gap-3 flex-wrap">
         {materials.map((material, index) => (
           <button
             key={index}
             type="button"
             className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
           >
             {material}
             <span
               className="inline-flex items-center justify-center w-4 h-4 ms-2 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full"
               onClick={() => removeMaterial(index)}
             >
               <FontAwesomeIcon icon={faXmark} />
             </span>
           </button>
         ))}
       </div>

       <div className="px-6.5 mt-6">
         <button
           type="submit"
           className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
         >
           Next
         </button>
       </div>
     </form>
   </div>
 );
};

export default Descriptions;