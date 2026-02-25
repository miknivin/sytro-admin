"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ReusableModal from "./ReusableModal";
import { useCreateVendorMutation } from "@/redux/api/userApi";

interface AddVendorModalProps {
  onClose: () => void;
}

type UploadedAvatar = {
  url: string;
  public_id: string;
};

const AddVendorModal = ({ onClose }: AddVendorModalProps) => {
  const [createVendor, { isLoading: isCreating }] = useCreateVendorMutation();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxAvatarSize = 3 * 1024 * 1024;
    if (file.size > maxAvatarSize) {
      toast.error("Avatar size must be 3 MB or less.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatarIfAny = async (): Promise<UploadedAvatar | null> => {
    if (!avatarFile) return null;

    setIsUploadingAvatar(true);
    try {
      const presignedRes = await fetch("/api/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: [{ name: avatarFile.name, type: avatarFile.type }],
        }),
      });

      const presignedData = await presignedRes.json();
      if (!presignedRes.ok || !presignedData?.uploads?.length) {
        throw new Error(presignedData?.error || "Failed to prepare avatar upload");
      }

      const { presignedUrl, publicUrl, key } = presignedData.uploads[0];
      const uploadRes = await fetch(presignedUrl, {
        method: "PUT",
        body: avatarFile,
        headers: {
          "Content-Type": avatarFile.type || "application/octet-stream",
        },
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload avatar");
      }

      return { url: publicUrl, public_id: key };
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const avatar = await uploadAvatarIfAny();
      const normalizedPhone = formData.phone.replace(/\D/g, "").slice(-10);
      await createVendor({
        ...formData,
        phone: `+91${normalizedPhone}`,
        ...(avatar ? { avatar } : {}),
      }).unwrap();
      toast.success("Vendor added successfully");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to add vendor");
    }
  };

  const isSubmitting = isCreating || isUploadingAvatar;

  return (
    <ReusableModal
      title="Add Vendor"
      onClose={onClose}
      formContent={
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Phone
            </label>
            <div className="flex">
              <span className="inline-flex items-center rounded-s-lg border border-r-0 border-gray-300 bg-gray-100 px-3 text-sm text-gray-700 dark:border-gray-500 dark:bg-gray-600 dark:text-gray-200">
                +91
              </span>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                  }))
                }
                className="w-full rounded-e-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
                placeholder="9876543210"
                minLength={10}
                maxLength={10}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pr-11 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white"
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.92-2.18 2.36-4.07 4.13-5.5" />
                    <path d="M10.59 10.59A2 2 0 0 0 12 14a2 2 0 0 0 1.41-.59" />
                    <path d="M1 1l22 22" />
                    <path d="M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.8 11.8 0 0 1-2.16 3.19" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
              Avatar (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="file-input file-input-bordered w-full"
            />
            {avatarPreview && (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="mt-3 h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full  rounded-lg bg-blue-700 px-5 py-2.5 text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Saving..." : "Add Vendor"}
          </button>
        </form>
      }
    />
  );
};

export default AddVendorModal;
