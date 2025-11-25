// validators/productValidators.ts

import { Product } from "@/interfaces/product";
import Swal from "sweetalert2";

export const validateDescription = (description: string): boolean => {
 if (!description.trim()) {
   Swal.fire({
     title: 'Validation Error',
     text: 'Description is required',
     icon: 'error'
   });
   return false;
 }
 return true;
};

export const validateFeatures = (features: string[]): boolean => {
 if (features.length > 5) {
   Swal.fire({
     title: 'Validation Error',
     text: 'Maximum 5 features allowed',
     icon: 'error'
   });
   return false;
 }
 return true;
};

export const validateMaterials = (materials: string[]): boolean => {
 if (materials.length > 5) {
   Swal.fire({
     title: 'Validation Error',
     text: 'Maximum 5 materials allowed',
     icon: 'error'
   });
   return false;
 }
 return true;
};

export const validateProductDetails = (product: Product): { isValid: boolean; errors: string[] } => {
 const errors: string[] = [];

 if (!product.details.description.trim()) errors.push('Description is required');
 if (product.details.features && product.details.features.length > 6) errors.push('Maximum 5 features allowed');
 if (product.details.materialUsed && product.details.materialUsed.length > 5) errors.push('Maximum 5 materials allowed');

 return {
   isValid: errors.length === 0,
   errors
 };
};