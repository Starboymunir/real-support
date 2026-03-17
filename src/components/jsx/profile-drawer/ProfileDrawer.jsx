import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import Image from "next/image";
import React from "react";

const ProfileDrawer = ({
  isOpen,
  toggleSidebar,
  data,
  openModal,
  loading,
  children,
}) => {
  const driverName = data.name;
  return (
    <div>
      {/* Overlay to cover the content when the sidebar is open */}
      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-40"
        ></div>
      )}
      <div
        className={`${
          isOpen ? "translate-x-0" : "translate-x-full"
        } fixed transform right-0 w-72 sm:w-96 h-[100vh] bg-custom p-4 shadow-lg transition-transform duration-300 ease-in-out z-50`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute top-2 left-2 text-white/70 hover:text-white"
        >
          {isOpen ? <Icon icon="ion:close" fontSize={36} /> : "Open"}
        </button>

        <div className="flex flex-col justify-between h-[95vh]">
          <div>
            <div className="text-center">
              {loading ? (
                <div className="w-full h-full grid place-content-center">
                  <div className="w-12 h-12 border-y-2 border-primary border-solid rounded-full animate-spin place-self-center"></div>
                </div>
              ) : (
                <Image
                  width={100}
                  height={100}
                  src={
                    data?.profileImage
                      ? data?.profileImage.split("?")[0]
                      : "/noavatar.png"
                  }
                  alt="User Profile"
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              )}

              <h2 className="text-xl font-semibold font-poppins mt-2">
                {driverName}
              </h2>
              <p className="font-poppins text-gray-500">{data?.mode}</p>
            </div>
          </div>
          <div className="mt-10 space-y-4 overflow-scroll overflow-x-hidden">
            {children}
          </div>
          {/* {user && ( */}
          <div className="space-y-5 w-full">
            <Button onClick={openModal} className="w-full">
              Update Profile
            </Button>
            <Button
              variant="destructive"
              // onClick={logout}
              className="w-full"
            >
              Log out
            </Button>
          </div>
          {/* )} */}
        </div>
      </div>
    </div>
  );
};

export default ProfileDrawer;
