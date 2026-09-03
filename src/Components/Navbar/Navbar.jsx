import React, { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import { useQuery } from '@tanstack/react-query';
import { getmyprofile } from '../../Api/GetMyProfile.api';
import Loader from '../Loader/Loader';
import { TbLogout, TbPassword } from 'react-icons/tb';
import { FaUser } from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';
import { IoReorderThreeSharp } from 'react-icons/io5';

export default function Navbar({ isSidebarOpen, onSidebarToggle }) {

  let { userToken, setUserToken } = useContext(TokenContext)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  let navigate = useNavigate()
  let signOut = () => {
    setIsProfileMenuOpen(false)
    localStorage.removeItem('userToken')
    setUserToken(null)
    navigate('/login')
  }

  const { data: userData } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: getmyprofile,
    select: (data) => data?.data?.data?.user,
    enabled: !!userToken
  })


  return (
    <>
      <div className="navbar  bg-linear-to-r from-gray-300 via-black/30 to-gray-50  dark:from-gray-300 dark:via-black dark:to-gray-200 dark:backdrop-blur-none backdrop-blur-sm shadow-xl px-5 lg:px-16 fixed z-1100">
        <div className="flex flex-1 items-center">
          {userToken && <button type="button" onClick={onSidebarToggle} className="btn btn-ghost btn-circle me-1 lg:hidden" aria-expanded={isSidebarOpen} aria-controls="hs-sidebar-content-push" aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}>
            {isSidebarOpen ? <RiCloseLine className='text-2xl' /> : <IoReorderThreeSharp className='text-3xl' />}
          </button>}

          <Link to={'/home'} className="ml-2 font-bold md:text-xl">EM</Link>
        </div>
        <div className="flex gap-6">
          {userToken == null ? <ul className='flex gap-5 items-center'>
            <li>
              <button className="relative cursor-pointer py-2 px-2 md:px-5 text-center font-barlow inline-flex justify-center text-base uppercase text-black rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                <span className="relative z-20 text-sm md:tex-lg font-bold"><Link to="/">Register</Link></span>
                <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
              </button>
            </li>
            <li>
              <button className="relative cursor-pointer py-2 px-2 md:px-5 text-center font-barlow inline-flex justify-center text-base uppercase text-black rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                <span className="relative z-20  text-sm md:tex-lg font-bold"><Link to="/login">Login</Link></span>
                <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
              </button>
            </li>
          </ul> : <div className="dropdown dropdown-end">
            <button type="button" onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)} className="btn btn-ghost btn-circle avatar" aria-expanded={isProfileMenuOpen} aria-label="Account menu">
              <div className="w-10 rounded-full">
                <img
                  alt={userData?.name}
                  src={userData?.photo} />
              </div>
            </button>
            <ul
              className={`menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow ${isProfileMenuOpen ? 'visible! opacity-100' : 'hidden'}`}>
              <li>
                <div className='flex gap-1.5 text-[17px]'>
                </div>
                <Link to={'/profile'} onClick={() => setIsProfileMenuOpen(false)} className="justify-between">
                  <div className='flex items-center gap-3 text-[17px] cursor-pointer'>
                    <FaUser />
                    <p className='font-semibold'>Profile</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link to={'/changepass'} onClick={() => setIsProfileMenuOpen(false)}>
                  <div className='flex items-center gap-3 text-[17px] cursor-pointer'>
                    <TbPassword />
                    <p className='font-semibold'> Change Password</p>
                  </div>
                </Link>
              </li>
              <li onClick={() => signOut()}>
                <div className='flex items-center gap-3  text-[17px] cursor-pointer'>
                  <TbLogout />
                  <button className='font-semibold cursor-pointer'>Logout</button>
                </div>
              </li>
            </ul>
          </div>}
        </div>
      </div>
    </>
  )
}
