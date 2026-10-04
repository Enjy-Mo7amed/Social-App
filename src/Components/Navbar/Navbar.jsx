import { useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import { useQuery } from '@tanstack/react-query';
import { getmyprofile } from '../../Api/GetMyProfile.api';
import { TbLogout, TbPassword } from 'react-icons/tb';
import { FaUser } from 'react-icons/fa';
import { RiCloseLine } from 'react-icons/ri';
import { IoReorderThreeSharp } from 'react-icons/io5';
import { FiSearch } from 'react-icons/fi';
import imgOne from '../../assets/icon.png'
import imgTwo from '../../assets/icon-2.png'
import { getAllPosts } from '../../Api/GetPosts';
import NotificationBell from '../Notification/Notification';

export default function Navbar({ isSidebarOpen, onSidebarToggle }) {
  const { userToken, setUserToken } = useContext(TokenContext)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const menuRef = useRef(null)
  const searchRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const routesWithStickySidebar = ['/home', '/bookmarks', '/feeds']
  const hasStickySidebar = routesWithStickySidebar.includes(location.pathname.toLowerCase())

  const { data: userData } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: getmyprofile,
    select: (data) => data?.data?.data?.user,
    enabled: !!userToken
  })

  const { data: postsResponse, isLoading: isPostsLoading } = useQuery({
    queryKey: ['GetPosts'],
    queryFn: getAllPosts,
    enabled: !!userToken && isSearchOpen
  })

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const postsList = postsResponse?.data?.posts || postsResponse?.data?.data?.posts || postsResponse?.posts || []

    const uniqueUsersMap = new Map()

    postsList.forEach((post) => {
      const user = post?.user
      if (user && user.name) {
        const matchesName = user.name.toLowerCase().includes(query)
        const matchesUsername = user.username && user.username.toLowerCase().includes(query)

        if (matchesName || matchesUsername) {
          const uId = user._id || user.id
          if (uId) {
            uniqueUsersMap.set(uId, user)
          }
        }
      }
    })

    setSearchResults(Array.from(uniqueUsersMap.values()))
  }, [searchQuery, postsResponse])

  const signOut = () => {
    setIsProfileMenuOpen(false)
    localStorage.removeItem('userToken')
    setUserToken(null)
    navigate('/login')
  }

  const getInitials = (name) => {
    if (!name) return ''
    const words = name.trim().split(' ').filter(Boolean)
    if (words.length === 1) return words[0].charAt(0).toUpperCase()
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
  }

  return (
    <>
      <div className="navbar bg-linear-to-r from-gray-300 via-black/30 to-gray-50 dark:from-gray-300 dark:via-black dark:to-gray-200 dark:backdrop-blur-none backdrop-blur-sm shadow-xl px-4 lg:px-16 fixed top-0 inset-x-0 w-full z-1100">
        <div className="flex flex-1 items-center">
          {userToken && (
            <button
              type="button"
              onClick={onSidebarToggle}
              className={`btn btn-ghost btn-circle me-1 flex items-center justify-center cursor-pointer ${hasStickySidebar ? 'lg:hidden' : 'block'}`}
              aria-expanded={isSidebarOpen}
              aria-controls="hs-sidebar-content-push"
              aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isSidebarOpen ? <RiCloseLine className='text-2xl' /> : <IoReorderThreeSharp className='text-3xl' />}
            </button>
          )}

          <Link to={'/home'} className="ml-2 hover:bg-gray-300 transition-all rounded-full p-1">
            <div className="flex">
              <img className='w-8 h-8' src={imgOne} alt="icon" />
              <img className='w-8 h-8' src={imgTwo} alt="icon" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {userToken == null ? (
            <ul className='flex gap-5 items-center'>
              <li>
                <button className="relative cursor-pointer py-2 px-2 md:px-5 text-center font-barlow inline-flex justify-center text-base uppercase text-black rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden">
                  <span className="relative z-20 text-sm md:tex-lg font-bold"><Link to="/">Register</Link></span>
                  <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                </button>
              </li>
              <li>
                <button className="relative cursor-pointer py-2 px-2 md:px-5 text-center font-barlow inline-flex justify-center text-base uppercase text-black rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden">
                  <span className="relative z-20 text-sm md:tex-lg font-bold"><Link to="/login">Login</Link></span>
                  <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#0f1112] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                </button>
              </li>
            </ul>
          ) : (
            <div className="flex items-center gap-3">
              {/* ===== search==== */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2.5 text-black hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition cursor-pointer flex items-center justify-center"
                  aria-label="Search"
                >
                  <FiSearch className="text-xl" />
                </button>

                {isSearchOpen && (
                  <div className="fixed sm:absolute top-16 sm:top-auto right-4 sm:right-0 left-4 sm:left-auto mt-2 w-auto sm:w-80 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-gray-800 z-50">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        autoFocus
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search users by name..."
                        className="w-full bg-gray-100 dark:bg-gray-900 text-sm px-3 py-2 pr-8 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 text-xs text-gray-500 hover:text-black dark:hover:text-white"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* نتائج البحث  */}
                    <div className="mt-3 max-h-60 overflow-y-auto flex flex-col gap-1">
                      {isPostsLoading ? (
                        <p className="text-xs text-center py-4 text-gray-500">Loading users...</p>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((user) => {
                          const userId = user._id || user.id
                          return (
                            <Link
                              key={userId}
                              to={`/profile/${userId}`}
                              onClick={() => {
                                setIsSearchOpen(false)
                                setSearchQuery('')
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800/60 rounded-xl transition cursor-pointer"
                            >
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                                {user.photo ? (
                                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  <span>{getInitials(user.name)}</span>
                                )}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate text-[#060607] dark:text-[#FAF9F9]">
                                  {user.name}
                                </span>
                                {user.username && (
                                  <span className="text-xs text-gray-400 truncate">@{user.username}</span>
                                )}
                              </div>
                            </Link>
                          )
                        })
                      ) : searchQuery.trim() ? (
                        <p className="text-xs text-center py-4 text-gray-500">No users found</p>
                      ) : (
                        <p className="text-xs text-center py-3 text-gray-400">Type a name to search users</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ===== notifications ===== */}
              <NotificationBell />

              {/* ===== profile menue ===== */}
              <div ref={menuRef} className="dropdown dropdown-end relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen((isOpen) => !isOpen)}
                  className="btn btn-ghost btn-circle avatar cursor-pointer touch-manipulation select-none"
                  aria-expanded={isProfileMenuOpen}
                  aria-label="Account menu"
                >
                  <div className="w-10 rounded-full pointer-events-none">
                    <img alt={userData?.name} src={userData?.photo} />
                  </div>
                </button>
                {isProfileMenuOpen && (
                  <ul className="menu menu-sm dropdown-content bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] rounded-box z-50 mt-3 w-52 p-2 shadow-lg border border-gray-200 dark:border-gray-800 absolute right-0">
                    <li>
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
                          <p className='font-semibold'>Change Password</p>
                        </div>
                      </Link>
                    </li>
                    <li onClick={() => signOut()}>
                      <div className='flex items-center gap-3 text-[17px] cursor-pointer'>
                        <TbLogout />
                        <button className='font-semibold cursor-pointer'>Logout</button>
                      </div>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}