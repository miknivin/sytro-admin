import { Product } from "@/interfaces/product";

export const validateForm = (product: Product): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
   
    if (!product.name.trim()) errors.push('Name is required');
    if (product.stock <= 0) errors.push('Stock must be greater than 0');
    if (product.actualPrice <= 0) errors.push('Actual price must be greater than 0'); 
    if (!product.category) errors.push('Category is required');
   
    return {
      isValid: errors.length === 0,
      errors
    };
   };