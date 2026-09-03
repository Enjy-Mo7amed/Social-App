import React, { useContext, useEffect, useState } from 'react'
import { FaBookmark } from 'react-icons/fa';
import { MdOutlineFeed } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom'
import { TbLogout } from "react-icons/tb";
import { TokenContext } from '../../Context/TokenContext';
import { BsHouseDoor } from 'react-icons/bs';
import { SlUserFollow } from "react-icons/sl";

export default function LeftSideBar({ isOpen, onOpenChange, data }) {
    // console.log(data);
    let { userToken, setUserToken } = useContext(TokenContext)
    const [isDarkMode, setIsDarkMode] = useState(() => document.body.classList.contains('dark'))
    let navigate = useNavigate()

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode)
    }, [isDarkMode])

    let signOut = () => {
        localStorage.removeItem('userToken')
        setUserToken(null)
        navigate('/login')
    }

    return (
        <>
            <div>
                {/* Sidebar */}
                <button type="button" onClick={() => onOpenChange(false)} className={`fixed top-16 inset-x-0 bottom-0 z-990 bg-black/40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} aria-label="Close navigation" />
                <div id="hs-sidebar-content-push" className={`dark:shadow-white/25 fixed py-5 top-16 bottom-0 inset-s-0 z-1000 w-64 overflow-hidden bg-[#FAF9F9] dark:bg-[#060607] shadow-lg transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:z-auto lg:block lg:w-full lg:h-[calc(100vh-5rem)] lg:translate-x-0`} role="dialog" tabIndex={-1} aria-label="Sidebar">
                    <div className="bg-[#FAF9F9] dark:bg-[#060607] relative flex flex-col h-full max-h-full">
                        {/* Body */}
                        <nav className="flex-1 min-h-0 overflow-y-auto pb-20 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-[#060607]/20 dark:[&::-webkit-scrollbar-track]:bg-[#FAF9F9]/20 [&::-webkit-scrollbar-thumb]:bg-[#060607] dark:[&::-webkit-scrollbar-thumb]:bg-[#FAF9F9]">
                            <div className="hs-accordion-group pb-0 px-2 w-full flex flex-col flex-wrap" data-hs-accordion-always-open>
                                <ul className="space-y-3">
                                    <li>
                                        <button className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3  w-full text-center font-barlow pl-5 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                                            <span className="relative z-20  text-sm md:tex-lg font-bold">
                                                <Link onClick={() => onOpenChange(false)} to={'/profile'} className="flex items-center gap-x-2 text-sm  rounded-lg  focus:outline-hidden">
                                                    <div role="button" className="btn-circle avatar">
                                                        <div className="w-8 rounded-full">
                                                            <img alt={data?.name} src={data?.photo} />
                                                        </div>
                                                    </div>
                                                    <p className='text-[14px] font-semibold'>{data?.name}</p>
                                                </Link>
                                            </span>
                                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3  w-full  font-barlow px-5 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                                            <span className="relative z-20  text-sm md:tex-lg font-bold">
                                                <Link onClick={() => onOpenChange(false)} to={'/home'} className="flex items-center gap-x-3.5 text-sm  rounded-lg  focus:outline-hidden">
                                                    <BsHouseDoor className='text-2xl' />
                                                    <p className='text-[16px] font-semibold'>Home</p>
                                                </Link>
                                            </span>
                                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                        </button>
                                    </li>
                                    <li>
                                        <button className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3  w-full text-center font-barlow px-5 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                                            <span className="relative z-20  text-sm md:tex-lg font-bold">
                                                <Link onClick={() => onOpenChange(false)} to={'/feeds'} className="flex items-center gap-x-3.5 text-sm  rounded-lg  focus:outline-hidden" >
                                                    <MdOutlineFeed className='text-2xl' />
                                                    <p className='text-[16px] font-semibold'>feeds</p>
                                                </Link>
                                            </span>
                                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                        </button>

                                    </li>
                                    <li>
                                        <button className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3  w-full text-center font-barlow pl-5 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                                            <span className="relative z-20  text-sm md:tex-lg font-bold">
                                                <Link onClick={() => onOpenChange(false)} to={'/bookmarks'} className="flex items-center gap-x-2 text-sm  rounded-lg  focus:outline-hidden">
                                                    <FaBookmark className='text-2xl' />
                                                    <p className='text-[14px] font-medium'>saved Bookmarks</p>
                                                </Link>
                                            </span>
                                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                        </button>
                                    </li>
                                    <li className='block lg:hidden'>
                                        <button className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3  w-full  font-barlow px-5 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                                            <span className="relative z-20  text-sm md:tex-lg font-bold">
                                                <Link onClick={() => onOpenChange(false)} to={'/suggestedfollowers'} className="flex items-center text-sm gap-1  rounded-lg  focus:outline-hidden">
                                                    <SlUserFollow className='text-2xl' />
                                                    <p className='text-[15px] font-semibold'>Suggested Followers</p>
                                                </Link>
                                            </span>
                                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                        </button>
                                    </li>
                                    <li onClick={() => signOut()}>
                                        <button className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3  w-full text-center font-barlow px-5 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                                            <span className="relative z-20  text-sm md:tex-lg font-bold">
                                                <div onClick={() => onOpenChange(false)} className="cursor-pointer flex items-center gap-x-3.5 text-sm  rounded-lg  focus:outline-hidden">
                                                    <TbLogout className='text-2xl' />
                                                    <p className='text-[16px] font-semibold'>logout</p>
                                                </div>
                                            </span>
                                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </nav>
                        {/* End Body */}
                        <div className="absolute flex w-full items-center justify-center bottom-4">
                            <p className='font-bold mr-2 text-[#060607] dark:text-[#FAF9F9]'>Theme</p>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input className="sr-only peer" type="checkbox" checked={isDarkMode} onChange={(event) => setIsDarkMode(event.target.checked)} />
                                <div className="w-20 h-10 rounded-full ring-0 peer duration-500 outline-none bg-[#060607]/30 dark:bg-[#FAF9F9]/30 overflow-hidden before:flex before:items-center before:justify-center after:flex after:items-center after:justify-center before:content-['☀️'] before:absolute before:h-8 before:w-8 before:top-1/2 before:bg-[#FAF9F9] dark:before:bg-[#060607] before:rounded-full before:left-1 before:-translate-y-1/2 before:transition-all before:duration-700 peer-checked:before:opacity-0 peer-checked:before:rotate-90 peer-checked:before:-translate-y-full shadow-lg shadow-[#060607]/40 dark:shadow-[#FAF9F9]/40 peer-checked:shadow-lg peer-checked:shadow-[#FAF9F9]/40 dark:peer-checked:shadow-[#060607]/40 peer-checked:bg-[#060607] dark:peer-checked:bg-[#FAF9F9] after:content-['🌑'] after:absolute after:bg-[#060607] dark:after:bg-[#FAF9F9] after:rounded-full after:top-1 after:right-1 after:translate-y-full after:w-8 after:h-8 after:opacity-0 after:transition-all after:duration-700 peer-checked:after:opacity-100 peer-checked:after:rotate-180 peer-checked:after:translate-y-0"></div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
