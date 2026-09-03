import React, { useContext, useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from './../Navbar/Navbar';
import LeftSideBar from "../LeftSideBar/LeftSideBar";
import { TokenContext } from "../../Context/TokenContext";
import { useQuery } from "@tanstack/react-query";
import { getmyprofile } from "../../Api/GetMyProfile.api";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { userToken } = useContext(TokenContext)
  const { data: userData } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: getmyprofile,
    select: (data) => data?.data?.data?.user,
    enabled: !!userToken
  })

  return (
    <>
      <Navbar isSidebarOpen={isSidebarOpen} onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)} />
      {userToken && <div className="lg:hidden">
        <LeftSideBar data={userData} isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      </div>}
      <div className="min-h-screen pt-16">
        <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
      </div>
    </>
  );
}
