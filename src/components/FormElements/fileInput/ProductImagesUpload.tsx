/* eslint-disable @next/next/no-img-element */
"use client";
import {
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
} from "@/redux/api/productsApi";
import { Product } from "@/types/product";
import { useState } from "react";
import toast from "react-hot-toast";

interface ProductImagesUploadProps {
  product: Product;
  onClose: () => void;
}

export default function ProductImagesUpload({
  product,
  onClose,
}: ProductImagesUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productImages, setProductImages] = useState(product.images);
  const [uploadProductImages, { isLoading }] = useUploadProductImagesMutation();
  const [deleteProductImage, { isLoading: isDeleting }] =
    useDeleteProductImageMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(files);
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviews(newPreviews);
    } else {
      setSelectedFiles([]);
      setPreviews([]);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file first.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const result = await uploadProductImages({
        id: product._id,
        formData,
      }).unwrap();
      toast.success("Images uploaded successfully!");
      setSelectedFiles([]);
      setPreviews([]);
      // Update productImages with newly uploaded images if your API returns them
      if (result?.images) {
        setProductImages([...productImages, ...result.images]);
      }
      onClose();
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteProductImage({
        id: product._id,
        body: { imageId },
      }).unwrap();
      toast.success("Image deleted successfully!");
      setProductImages((prevImages) =>
        prevImages.filter((image) => image._id !== imageId),
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    }
  };

  const removePreview = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form className="space-y-4">
      <label className="form-control w-full text-black dark:text-white">
        <div className="label">
          <span className="label-text">
            Upload product images for{" "}
            <span className="text-gray-700 dark:text-gray-100">
              {product.name}
            </span>
          </span>
        </div>
        <input
          type="file"
          name="largeBag"
          multiple
          accept=".png, .jpg, .webp, .jpeg"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
      </label>

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, index) => (
            <div className="relative mt-2 w-fit" key={index}>
              <button
                type="button"
                onClick={() => removePreview(index)}
                className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
              >
                ✖
              </button>
              <img
                className="mask mask-squircle h-24 w-24 object-cover"
                src={preview}
                alt={`Preview ${index + 1}`}
              />
            </div>
          ))}
        </div>
      )}

      <h3 className="text-xl text-gray-800 dark:text-gray-200">
        Uploaded Images
      </h3>
      <hr className="h-0.5 bg-slate-500" />
      <div className="flex flex-wrap gap-3">
        {productImages.map((item) => (
          <div className="relative mt-2 w-fit" key={item._id}>
            <button
              type="button"
              id="deleteUploadedImage"
              onClick={() => handleDelete(item._id)}
              disabled={isDeleting}
              className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
            >
              ✖
            </button>
            <img
              className="mask mask-squircle h-24 w-24 object-cover"
              src={item.url}
              alt="Product Preview"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleUpload}
        className="btn border-none bg-primary text-white hover:bg-primary/80"
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
