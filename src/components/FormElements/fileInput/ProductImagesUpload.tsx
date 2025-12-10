/* eslint-disable @next/next/no-img-element */
"use client";

import GraySpinner from "@/components/common/GraySpinner";
import { useDeleteProductImageMutation } from "@/redux/api/productsApi";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface ProductImagesUploadProps {
  product: Product;
  onClose: () => void;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

export default function ProductImagesUpload({
  product,
  onClose,
}: ProductImagesUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [productImages, setProductImages] = useState(product.images);
  const [isUploading, setIsUploading] = useState(false);

  const [deleteProductImage, { isLoading: isDeleting }] =
    useDeleteProductImageMutation();

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    files.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(
          `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)`,
        );
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(
        <div>
          <strong>Files exceed 8 MB limit:</strong>
          <ul className="mt-1 list-inside list-disc text-xs">
            {invalidFiles.map((name, i) => (
              <li key={i}>{name}</li>
            ))}
          </ul>
        </div>,
        { duration: 6000 },
      );
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const isVideoFile = (file: File) => file.type.startsWith("video/");
  const isVideoUrl = (url: string) =>
    /\.(mp4|webm|mov|avi|mpeg|ogg)$/i.test(url);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file.");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Preparing upload...");

    try {
      // Get presigned URLs
      const fileInfo = selectedFiles.map((file) => ({
        name: file.name,
        type: file.type || "application/octet-stream",
      }));

      const res = await fetch("/api/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ files: fileInfo }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get upload URLs");

      const { uploads } = data;

      toast.loading(`Uploading ${selectedFiles.length} file(s)...`, {
        id: toastId,
      });

      const uploadedMedia = [];

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const { presignedUrl, publicUrl } = uploads[i];

        await fetch(presignedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        uploadedMedia.push({ url: publicUrl, name: file.name });

        toast.loading(`Uploaded ${i + 1}/${selectedFiles.length}`, {
          id: toastId,
        });
      }

      // Save to database
      toast.loading("Saving to database...", { id: toastId });

      const saveRes = await fetch(`/api/products/${product._id}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: uploadedMedia }),
        credentials: "include",
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Failed to save");

      toast.success("All media uploaded successfully!", { id: toastId });

      setProductImages((prev) => [...prev, ...saveData.images]);
      setSelectedFiles([]);
      setPreviews([]);
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Upload failed.", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (productImages.length <= 2) {
      toast.error("Product must have at least 2 images.");
      return;
    }

    try {
      await deleteProductImage({
        id: product._id,
        body: { imageId },
      }).unwrap();

      toast.success("Image/video deleted successfully!");
      setProductImages((prev) => prev.filter((image) => image._id !== imageId));
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image/video.");
    }
  };

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <label className="form-control w-full text-black dark:text-white">
        <div className="label">
          <span className="label-text">
            Upload product images & videos for{" "}
            <span className="text-gray-700 dark:text-gray-100">
              {product.name}
            </span>
          </span>
          <span className="label-text-alt text-xs opacity-70">
            Max 8 MB per file
          </span>
        </div>
        <input
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.webp,.mp4,.webm,.mov,.avi"
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>

      {/* Previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, index) => {
            const file = selectedFiles[index];
            const isVideo = file && isVideoFile(file);

            return (
              <div className="relative mt-2 w-fit" key={index}>
                <button
                  type="button"
                  onClick={() => removePreview(index)}
                  className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
                  disabled={isUploading}
                >
                  ✖
                </button>

                {isVideo ? (
                  <video
                    className="mask mask-squircle h-24 w-24 object-cover"
                    src={preview}
                    controls
                    preload="metadata"
                  />
                ) : (
                  <img
                    className="mask mask-squircle h-24 w-24 object-cover"
                    src={preview}
                    alt={`Preview ${index + 1}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      <h3 className="text-xl text-gray-800 dark:text-gray-200">
        Uploaded Media
      </h3>
      <hr className="h-0.5 bg-slate-500" />

      <div className="flex flex-wrap gap-3">
        {productImages.map((item) => {
          const isVideo = isVideoUrl(item.url);

          return (
            <div className="relative mt-2 w-fit" key={item._id}>
              <button
                type="button"
                onClick={() => handleDelete(item._id)}
                disabled={
                  isUploading || isDeleting || productImages.length <= 2
                }
                className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
              >
                {isDeleting ? <GraySpinner /> : "✖"}
              </button>

              {isVideo ? (
                <div className="relative">
                  <video
                    className="mask mask-squircle h-24 w-24 object-cover"
                    src={item.url}
                    controls
                    muted
                  />
                </div>
              ) : (
                <img
                  className="mask mask-squircle h-24 w-24 object-cover"
                  src={item.url}
                  alt="Product media"
                />
              )}
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleUpload}
        disabled={isUploading || selectedFiles.length === 0}
        className="btn border-none bg-primary text-white hover:bg-primary/80"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
