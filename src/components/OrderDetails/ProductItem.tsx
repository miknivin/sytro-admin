/* eslint-disable @next/next/no-img-element */
"use client";

import { OrderItem } from "@/types/order";
import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Download from "../SvgIcons/Download";

interface ProductItemProps {
  product: OrderItem;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const { name, quantity, image, price, uploadedImage, customNameToPrint } =
    product;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     const target = event.target as HTMLElement;
  //     if (dropdownRef.current && !dropdownRef.current.contains(target)) {
  //       setIsOpen(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  const toggleDropdown = (): void => {
    setIsOpen((prev) => !prev);
  };

  const handleDownload = async (url: string, filename: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Append a query param to bypass the browser cache, which might lack CORS headers
      const fetchUrl = url.includes("?") ? `${url}&download=true` : `${url}?download=true`;
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      window.open(url, '_blank');
    }
  };

  return (
    <div className="mt-4 flex w-full flex-col items-start justify-start md:mt-6 md:flex-row md:items-center md:space-x-6 xl:space-x-8">
      <div className="w-full pb-4 md:w-40 md:pb-8">
        <img className="hidden w-full md:block" src={image} alt={name} />
      </div>
      <div className="flex w-full flex-col items-start justify-between space-y-4 border-b border-gray-200 pb-8 dark:border-gray-700 md:flex-row md:space-y-0">
        <div className="flex w-full flex-col items-start justify-start space-y-4">
          <h3 className="line-clamp-3 text-ellipsis whitespace-break-spaces text-xl font-semibold leading-6  text-gray-800 dark:text-gray-100 xl:text-2xl">
            {name}
          </h3>
          {customNameToPrint && (
            <p className=" text-xl font-medium">{customNameToPrint}</p>
          )}

          <div className="dropdown relative mt-1" ref={dropdownRef}>
            <div
              role="button"
              tabIndex={0}
              className="btn"
              onClick={toggleDropdown}
              onKeyDown={(e: React.KeyboardEvent) =>
                e.key === "Enter" && toggleDropdown()
              }
            >
              Uploaded image
            </div>

            {isOpen && (
              <div
                className="dropdown-content absolute z-[10] mt-2 w-56 rounded-box bg-base-100 p-2 shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {uploadedImage && uploadedImage.length > 0 ? (
                  <div>
                    <Swiper
                      modules={[Navigation, Pagination]}
                      spaceBetween={10}
                      slidesPerView={1}
                      navigation
                      pagination={{ clickable: true }}
                      className="my-4"
                    >
                      {uploadedImage.map((image: string, index: number) => {
                        const isPdf =
                          typeof image === "string" &&
                          (image.toLowerCase().endsWith(".pdf") ||
                            image.toLowerCase().includes(".pdf?"));
                        return (
                          <SwiperSlide key={index}>
                            <div className="relative flex items-center justify-center">
                              {isPdf ? (
                                 <div className="flex h-36 w-36 flex-col items-center justify-center gap-2 rounded border border-red-200 bg-red-50">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="40"
                                    height="40"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#e53e3e"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                  </svg>
                                  <span className="text-xs font-semibold text-red-500">PDF File</span>
                                  <div className="flex gap-1">
                                    <a
                                      href={image}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      Open
                                    </a>
                                    <button
                                      className="rounded bg-gray-600 px-2 py-1 text-xs text-white hover:bg-gray-700"
                                      onClick={(e) => handleDownload(image, `pdf-${index + 1}.pdf`, e)}
                                    >
                                      Download
                                    </button>
                                  </div>
                                </div>

                              ) : (
                                <>
                                  <img
                                    src={image}
                                    alt={`Slide ${index}`}
                                    className="h-36 w-36 object-contain"
                                  />
                                  <a
                                    href={image}
                                    target="_blank"
                                    download={`image-${index}`}
                                    className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-gray-100"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Download />
                                  </a>
                                </>
                              )}
                            </div>
                          </SwiperSlide>
                        );
                      })}

                    </Swiper>
                  </div>
                ) : (
                  <p className="p-2 text-gray-500">No uploaded images</p>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full items-start justify-between space-x-8">
          <p className="text-base leading-6 xl:text-lg">₹{price}</p>
          <p className="text-base leading-6 text-gray-800 dark:text-gray-100 xl:text-lg">
            {quantity}
          </p>
          <p className="text-base font-semibold leading-6 text-gray-800 dark:text-gray-100 xl:text-lg">
            ₹{Number(price) * quantity}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductItem;
