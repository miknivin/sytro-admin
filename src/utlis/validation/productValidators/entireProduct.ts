import { Product } from "@/interfaces/product";

export const isProductValid = (product: Product): boolean => {
  return (
    product.name.trim() !== "" &&
    product.actualPrice > 0 &&
    (product.offer !== undefined ? product.offer >= 0 : true) &&
    product.details.description.trim() !== "" &&
    (product.details.features?.length ?? 0) > 0 && // Ensure features is an array and not empty
    (product.details.materialUsed?.length ?? 0) > 0 && // Ensure materialUsed is an array and not empty
    product.category.trim() !== "" &&
    product.stock >= 0
  );
};
