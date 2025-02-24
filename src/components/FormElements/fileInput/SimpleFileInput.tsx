/* eslint-disable @next/next/no-img-element */
import { useUploadKidsBagImagesMutation } from "@/redux/api/productsApi"; 
import { useState } from "react";

export default function SimpleFileInput() {
  const [uploadKidsBagImages, { isLoading, error }] = useUploadKidsBagImagesMutation();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files); 
      setSelectedFiles(fileArray);

      const urls = fileArray.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
    }
  };

  const handleDeleteFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select files to upload");
      return;
    }

    const formData = new FormData();
    formData.append("productId", "67a70ca93f464380b64b05a6");
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("files", selectedFiles[i]); // Append multiple files
    }

    try {
      const response = await uploadKidsBagImages({ formData }).unwrap();
      console.log("Upload Successful:", response);
      setPreviewUrls([]); // Clear preview URLs after upload
      alert("Files uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload files.");
    }
  };

  return (
    <>
      <label className="form-control w-full text-black dark:text-white">
        <div className="label">
          <span className="label-text">Pick a file</span>
        </div>
        <input
          type="file"
          multiple
          className="file-input file-input-bordered w-full"
          onChange={handleFileChange}
        />
        <div className="label">
          <span className="label-text-alt">Max size is 2MB</span>
          <span className="label-text-alt">.png, .jpg, .webp</span>
        </div>
      </label>

      {/* Preview selected images before upload */}
      <div className="mt-4 flex flex-wrap gap-4 pb-4">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative">
            <button onClick={() => handleDeleteFile(index)} className="badge badge-error badge-sm indicator-item absolute right-0 top-0 z-10 rounded-full !p-1 h-auto ">
            ✖
            </button> 
            <img
              className="mask mask-squircle w-24 h-24 object-cover"
              src={url}
              alt={`Preview ${index + 1}`}
          />
          </div>  
        ))}
      </div>

      <button
        className="btn bg-primary hover:bg-primary/80 mt-2 text-black dark:text-white border-none"
        onClick={handleUpload}
        disabled={isLoading}
      >
        {isLoading ? "Uploading..." : "Upload"}
      </button>

      {/* Display uploaded images */}


      {/* Error handling */}
      {/* {error && <p className="text-red-500 mt-2">Error: {error.message || "Upload failed"}</p>} */}
    </>
  );
}