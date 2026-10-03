import { useContext, useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from './../Navbar/Navbar';
import LeftSideBar from "../LeftSideBar/LeftSideBar";
import { TokenContext } from "../../Context/TokenContext";
import { useQuery } from "@tanstack/react-query";
import { getmyprofile } from "../../Api/GetMyProfile.api";
import ScrollToTop from "../ScrollToTop/ScrollToTop";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { userToken } = useContext(TokenContext)
  const location = useLocation()
  const { data: userData } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: getmyprofile,
    select: (data) => data?.data?.data?.user,
    enabled: !!userToken
  })

  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  return (
    <>
    <ScrollToTop />
      <Navbar isSidebarOpen={isSidebarOpen} onSidebarToggle={() => setIsSidebarOpen((isOpen) => !isOpen)} />
      {userToken && (
        <LeftSideBar
          data={userData}
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
          isDrawer={true}
        />
      )}
      <div className="min-h-screen pt-16">
        <Outlet context={{ isSidebarOpen, setIsSidebarOpen }} />
      </div>
    </>
  );
}
