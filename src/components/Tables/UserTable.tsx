"use client";
import Spinner from "@/components/common/Spinner/index";
import { useGetAdminUsersQuery } from "@/redux/api/userApi";
import { User } from "@/types/user";
import EditIcon from "../SvgIcons/EditIcon";
import DeleteIcon from "../SvgIcons/DeleteIcon";
import { useState } from "react";
import UserEditModal from "../Modals/UserEditModal";


const UserTable = () => {
  const { data, isLoading, isError } = useGetAdminUsersQuery({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId]= useState("")

  const openModal = (Id:string) => {
    setUserId(Id)
    setIsModalOpen(true);
  };


  const closeModal = () => {
    setIsModalOpen(false);
  };
  if (isLoading) {
    return <Spinner/>;
  }

  if (isError) {
    return <p className="text-center text-danger">Failed to load users.</p>;
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          {isModalOpen && <UserEditModal onClose={closeModal} userId={userId}/>}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Name
              </th>
              <th style={{paddingLeft:"11px"}} className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Created At
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Email
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Role
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.users?.map((user:User, key:number) => (
              <tr key={key}>
                <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {user.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{new Date(user.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{user.email}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                  <p className="text-black dark:text-white">{user.role}</p>
                </td>
                <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark flex gap-5">
                <button onClick={() => openModal(user._id||"")} className="hover:text-primary">
                  <EditIcon />
                </button>
                <button className="text-danger stroke-danger">
                  <DeleteIcon/>
                </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
    </div>
  );
};

export default UserTable;
