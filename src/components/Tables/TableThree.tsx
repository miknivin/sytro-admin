"use client";

import { useGetProductsQuery } from "@/redux/api/productsApi"; // Adjust the import path based on your API slice
import { Package } from "@/types/package";
import { Product } from "@/types/product";
import Spinner from "@/components/common/Spinner/index";
import UploadIcon from "../SvgIcons/UploadIcon";
import { useState } from "react";
import ReusableModal from "../Modals/ReusableModal";
import SimpleFileInput from "@/components/FormElements/fileInput/SimpleFileInput";


const TableThree = () => {
  const { data, isLoading, isError } = useGetProductsQuery({
    page: 1, 
  });
const [isModalOpen, setIsModalOpen] = useState(false);
  if (isLoading) {
    return <Spinner/>;
  }

  const openModal = () => {
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };
  const kidsProductId = "67a70ca93f464380b64b05a6"
  if (isError) {
    return <p>Failed to load products.</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Product
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Price
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Stocks
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Rating
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.filteredProducts?.map((product:Product, key:number) => (
              <tr key={key}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {product.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">${product.offer}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{product.stock}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{product.ratings} ⭐</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark flex flex-wrap gap-3">
                 {product._id.toString()===kidsProductId&&(
                    <button onClick={openModal} className="btn p-3 bg-primary hover:bg-primary/80">
                    <UploadIcon/>
                   </button>
                 )}
                 
                  <button disabled className="hover:text-primary">View</button>
                 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen&&(
         <ReusableModal onClose={closeModal} formContent={<SimpleFileInput/>} title={"Add Choice Images"} />
      )}
     
    </div>
  );
};

export default TableThree;
