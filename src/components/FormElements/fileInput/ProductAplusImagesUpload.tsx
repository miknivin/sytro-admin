/* eslint-disable @next/next/no-img-element */
"use client";
import { Product } from "@/types/product";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios, { AxiosProgressEvent } from "axios";
import {
  useDeleteAPlusContentImageMutation,
  useUploadAPlusContentImagesMutation,
  useImageUploadMutation,
} from "@/redux/api/productsApi";
import UploadIcon from "@/components/SvgIcons/UploadIcon";
import GraySpinner from "@/components/common/GraySpinner";

interface UploadStatus {
  file: File;
  progress: number;
  error: string | null;
  finalUrl: string | null;
  public_id?: string;
  _id?: string;
}

interface ProductAPlusImagesUploadProps {
  product: Product;
  aPlusContentIndex: number;
  onClose: () => void;
}

export default function ProductAPlusImagesUpload({
  product,
  aPlusContentIndex,
  onClose,
}: ProductAPlusImagesUploadProps) {
  const [files, setFiles] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUpload] = useImageUploadMutation();
  const [uploadAPlusImages] = useUploadAPlusContentImagesMutation();
  const [deleteAPlusImage, { isLoading: isDeleting }] =
    useDeleteAPlusContentImageMutation();

  const aPlusImages =
    product?.details?.aPlusContent?.[aPlusContentIndex]?.images || [];
  const aPlusTitle =
    product?.details?.aPlusContent?.[aPlusContentIndex]?.title || "A+ Content";

  // Cleanup preview URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      files.forEach((status) => {
        if (status.finalUrl) {
          URL.revokeObjectURL(status.finalUrl);
        }
      });
    };
  }, [files]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const selectedFiles = Array.from(fileList).filter((file) =>
      file.name.match(/\.(png|jpg|jpeg|webp)$/i),
    );
    const invalidFiles = Array.from(fileList).filter(
      (file) => !file.name.match(/\.(png|jpg|jpeg|webp)$/i),
    );

    setFiles((prev) => [
      ...prev,
      ...invalidFiles.map((file) => ({
        file,
        progress: 0,
        error: "Please select an image file (.png, .jpg, .jpeg, .webp)",
        finalUrl: null,
      })),
      ...selectedFiles.map((file) => ({
        file,
        progress: 0,
        error: null,
        finalUrl: URL.createObjectURL(file),
      })),
    ]);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.match(/\.(png|jpg|jpeg|webp)$/i),
      );
      const invalidFiles = Array.from(e.dataTransfer.files).filter(
        (file) => !file.type.match(/\.(png|jpg|jpeg|webp)$/i),
      );

      setFiles((prev) => [
        ...prev,
        ...invalidFiles.map((file) => ({
          file,
          progress: 0,
          error: "Please drop an image file (.png, .jpg, .jpeg, .webp)",
          finalUrl: null,
        })),
        ...droppedFiles.map((file) => ({
          file,
          progress: 0,
          error: null,
          finalUrl: URL.createObjectURL(file),
        })),
      ]);
    }
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!files.length || files.every((status) => status.file.size === 0)) {
      setFiles((prev) =>
        prev.map((status) => ({
          ...status,
          error: status.file.size === 0 ? "File is empty" : status.error,
        })),
      );
      return;
    }

    setIsUploading(true);
    const uploadedImages = await Promise.all(
      files.map(async (status, index) => {
        if (status.error || status.finalUrl?.startsWith("https://"))
          return status;
        const file = status.file;
        const fileName = `${Date.now()}-${file.name}`;

        try {
          const uploadResponse = await imageUpload({
            fileName,
            fileType: file.type,
            productId: product._id,
            bucket: "kids-bags",
          }).unwrap();
          const { presignedUrl, fileKey, finalUrl } = uploadResponse;

          await axios.put(presignedUrl, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (progressEvent: AxiosProgressEvent) => {
              if (progressEvent.total) {
                const progress = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100,
                );
                setFiles((prev) =>
                  prev.map((s, i) => (i === index ? { ...s, progress } : s)),
                );
              }
            },
          });

          return {
            ...status,
            progress: 100,
            finalUrl,
            error: null,
            _id: new Date().toISOString(), // Temporary ID
            public_id: fileKey,
          };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Unknown error";
          return {
            ...status,
            error: `Upload failed: ${errorMessage}`,
            progress: 0,
          };
        }
      }),
    );

    const validImages = uploadedImages
      .filter((status) => status.finalUrl && !status.error)
      .map((status) => ({
        _id: status._id,
        public_id: status.public_id,
        url: status.finalUrl,
      }));

    if (validImages.length > 0) {
      try {
        await uploadAPlusImages({
          id: product._id,
          aPlusContentIndex,
          body: { images: validImages },
        }).unwrap();

        toast.success("A+ content images uploaded successfully!");
        setFiles([]);
        onClose();
      } catch (error) {
        console.error("Failed to update product with images:", error);
        toast.error("Failed to save images to product. Please try again.");
        setFiles(uploadedImages);
      }
    } else {
      setFiles(uploadedImages);
      if (uploadedImages.every((status) => status.error)) {
        toast.error("All uploads failed. Please try again.");
      }
    }
    setIsUploading(false);
  };

  const handleDelete = async (imageId: string) => {
    try {
      await deleteAPlusImage({
        id: product._id,
        aPlusContentIndex,
        body: { imageId },
      }).unwrap();
      toast.success("A+ content image deleted successfully!");
    } catch (error) {
      console.error("Error deleting A+ content image:", error);
      toast.error("Failed to delete A+ content image.");
    }
  };

  const handleCancel = () => {
    setFiles([]);
    setIsUploading(false);
  };

  const overallProgress =
    files.length > 0
      ? files.reduce((sum, status) => sum + status.progress, 0) / files.length
      : 0;

  return (
    <form onSubmit={handleUpload} className="space-y-4">
      <div className="mb-5.5 flex flex-col gap-5.5">
        <label className="form-control w-full text-black dark:text-white">
          <div className="label">
            <span className="label-text">
              Upload A+ content images for{" "}
              <span className="text-gray-700 dark:text-gray-100">
                {product.name} - {aPlusTitle}
              </span>
            </span>
          </div>
          <div
            id="FileUpload"
            className="relative block w-full cursor-pointer appearance-none rounded border border-dashed border-primary bg-gray px-4 py-4 dark:bg-meta-4 sm:py-7.5"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              name="aPlusImages"
              multiple
              accept=".png,.jpg,.webp,.jpeg"
              className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
              onChange={handleFileChange}
            />
            <div className="flex flex-col items-center justify-center space-y-3">
              <span className="W-10 flex h-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                <UploadIcon />
              </span>
              <p>
                <span className="text-primary">Click to upload</span> or drag
                and drop
              </p>
              <p className="mt-1.5">
                Only image formats (.png, .jpg, .jpeg, .webp)
              </p>
            </div>
          </div>
        </label>

        {files.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {files.map((status, index) => (
              <div className="relative mt-2 w-fit" key={index}>
                <button
                  type="button"
                  onClick={() => {
                    setFiles((prev) => prev.filter((_, i) => i !== index));
                    if (status.finalUrl) {
                      URL.revokeObjectURL(status.finalUrl);
                    }
                  }}
                  className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
                >
                  ✖
                </button>
                <img
                  className="mask mask-squircle h-24 w-24 object-cover"
                  src={status.finalUrl || ""}
                  alt={`Preview ${index + 1}`}
                />
                {status.error && (
                  <p className="text-sm text-red-500">{status.error}</p>
                )}
                {status.progress > 0 && (
                  <div className="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-2.5 rounded-full bg-primary"
                      style={{ width: `${status.progress}%` }}
                    ></div>
                  </div>
                )}
                {status.finalUrl?.startsWith("https://") && (
                  <p className="text-sm text-green-500">
                    Uploaded:{" "}
                    <a
                      href={status.finalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {status.finalUrl}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {files.length > 0 && isUploading && (
          <div className="mt-4">
            <p className="text-sm text-black dark:text-white">
              Overall Progress
            </p>
            <div className="h-2.5 w-full rounded-full bg-gray-200">
              <div
                className="h-2.5 rounded-full bg-primary"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        <h3 className="text-xl text-gray-800 dark:text-gray-200">
          Uploaded A+ Content Images
        </h3>
        <hr className="h-0.5 bg-slate-500" />
        <div className="flex flex-wrap gap-3">
          {aPlusImages.map((item) => (
            <div className="relative mt-2 w-fit" key={item.public_id}>
              <button
                type="button"
                id="deleteAPlusImage"
                onClick={() => handleDelete(item.public_id)}
                disabled={isDeleting}
                className="badge badge-error badge-sm absolute right-0 top-0 z-30 h-auto rounded-full !p-1"
              >
                {isDeleting ? <GraySpinner /> : "✖"}
              </button>
              <img
                className="mask mask-squircle h-24 w-24 object-cover"
                src={item.url}
                alt="A+ Content Image"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4.5">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isUploading}
          className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={
            isUploading ||
            !files.length ||
            files.every((s) => s.error || s.finalUrl?.startsWith("https://"))
          }
          className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-90"
        >
          {isUploading ? "Uploading..." : "Save"}
        </button>
      </div>
    </form>
  );
}
