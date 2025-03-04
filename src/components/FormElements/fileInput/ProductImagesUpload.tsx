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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [productImages, setProductImages] = useState(product.images); // Local state
  const [uploadProductImages, { isLoading }] = useUploadProductImagesMutation();
  const [deleteProductImage, { isLoading: isDeleting }] =
    useDeleteProductImageMutation();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("images", selectedFile);

    try {
      await uploadProductImages({ id: product._id, formData }).unwrap();
      toast.success("Image uploaded successfully!");
      setSelectedFile(null);
      setPreview(null);
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

      // Remove deleted image from state
      setProductImages((prevImages) =>
        prevImages.filter((image) => image._id !== imageId),
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image.");
    }
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
          accept=".png, .jpg, .webp, .jpeg"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
      </label>

      {preview && (
        <div className="flex flex-wrap gap-3">
          <div className="relative mt-2 w-fit">
            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreview(null);
              }}
              className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
            >
              ✖
            </button>
            <img
              className="mask mask-squircle h-24 w-24 object-cover"
              src={preview}
              alt="Selected Preview"
            />
          </div>
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
