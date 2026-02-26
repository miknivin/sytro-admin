"use client";
import Spinner from "@/components/common/Spinner/index";
import {
  useGetAdminUsersQuery,
  useDeleteUserMutation,
} from "@/redux/api/userApi";
import Link from "next/link";
import { User } from "@/types/user";
import PreviewIcon from "../SvgIcons/PreviewIcon";
import EditIcon from "../SvgIcons/EditIcon";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import { useState, useEffect } from "react";
import UserEditModal from "../Modals/UserEditModal";
import AddVendorModal from "../Modals/AddVendorModal";
import PaginationComponent from "@/utlis/pagination/PaginationComponent";
import ReusableAlert from "@/utlis/alerts/ReusableAlert";
import GraySpinner from "../common/GraySpinner";
import SearchInput from "@/utlis/search/SearchInput";

const VendorTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, isFetching, isError } = useGetAdminUsersQuery({
    role: "vendor",
    page: currentPage,
    limit: itemsPerPage,
    search: searchQuery,
  });
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [toBeDeletedUser, setToBeDeletedUser] = useState<User | null>(null);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const filteredUsers = data?.users || [];

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openEditModal = (id: string) => {
    setCurrentUserId(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentUserId(null);
  };

  const openDeleteModal = (user: User) => {
    setToBeDeletedUser(user);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setToBeDeletedUser(null);
  };

  const handleDelete = async () => {
    if (!toBeDeletedUser) return;
    try {
      await deleteUser(toBeDeletedUser._id).unwrap();
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete vendor:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  if (isLoading || isFetching) {
    return <Spinner />;
  }

  if (isError) {
    return <p className="text-center text-danger">Failed to load vendors.</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {isEditModalOpen && currentUserId && (
        <UserEditModal onClose={closeEditModal} userId={currentUserId} />
      )}
      {isAddModalOpen && <AddVendorModal onClose={() => setIsAddModalOpen(false)} />}

      {isDeleteModalOpen && toBeDeletedUser && (
        <ReusableAlert
          title="Confirm Deletion"
          content={`Are you sure you want to delete this vendor - ${toBeDeletedUser.name}?`}
          func={handleDelete}
          isOpen={isDeleteModalOpen}
          functionTitle="Delete"
          buttonStyle={"bg-red-600"}
          onClose={closeDeleteModal}
        />
      )}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark xl:pb-1">
        <div className="flex justify-between gap-4 py-4">
          <h4 className="mb-2 text-xl font-semibold text-black dark:text-white">
            Vendors
          </h4>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-white hover:bg-opacity-90 disabled:opacity-70"
          >
            Add Vendor
          </button>
        </div>
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchInput
          placeholder="Search by name, email, phone, ID, or role..."
          onSearch={handleSearch}
        />
        <div className="flex items-center justify-end gap-4">
          <select
            defaultValue="10"
            onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            className="select rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
          >
            <option disabled={true}>Select items per page</option>
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Name
              </th>
              <th
                style={{ paddingLeft: "11px" }}
                className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11"
              >
                Created At
              </th>
              <th className=" px-4 py-4 font-medium text-black dark:text-white">
                Email
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Phone
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Role
              </th>
              <th className=" px-4 py-4 font-medium text-black dark:text-white">
                Total Orders
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers?.map((user: User, key: number) => (
              <tr key={key}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {user.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "2-digit",
                    })}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{user.email}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {user?.phone || "N/A"}
                  </p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{user.role}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {user.totalOrders ?? 0}
                  </p>
                </td>

                <td className="flex gap-5 px-4 py-5">
                  <Link
                    href={`/vendors/${user._id}`}
                    className="btn border-none bg-gray-700 p-3 hover:bg-gray-700/80"
                  >
                    <PreviewIcon />
                  </Link>
                  <button
                    onClick={() => openEditModal(user._id?.toString() || "")}
                    className="btn border-none bg-primary p-3 hover:bg-primary/80"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => openDeleteModal(user)}
                    className="btn border-none bg-danger hover:bg-danger/80 dark:text-gray-200"
                    disabled={isDeleting}
                  >
                    {isDeleting ? <GraySpinner /> : <DeleteIcon />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!filteredUsers || filteredUsers.length === 0) && (
          <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <p className="text-center text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "No vendors match your search."
                : "No vendors found."}
            </p>
          </div>
        )}
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default VendorTable;
