import { useContext, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  FiCamera,
  FiCalendar,
} from 'react-icons/fi'
import { BsGenderAmbiguous } from 'react-icons/bs'
import { FaBirthdayCake, FaFileImage, FaTrashAlt } from 'react-icons/fa'
import CreatePost from '../CreatePost/CreatePost'
import CardPost from '../CardPost/CardPost'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { getmyprofile } from '../../Api/GetMyProfile.api'
import { getUserProfile } from '../../Api/GetUserProfile.api'
import { TokenContext } from '../../Context/TokenContext'
import Loader from '../Loader/Loader'
import Error from '../Error/Error'
import { Dropdown, Label, Modal, Tabs } from '@heroui/react'
import { getmyposts } from '../../Api/GetMyPosts.api'
import { LuSquareUserRound } from "react-icons/lu";
import { ImFilePicture } from "react-icons/im";
import { IoCloseSharp } from 'react-icons/io5'
import { UploadPhoto } from '../../Api/UploadProfile.api'
import { PutFollow } from '../../Api/PutFollow.api'
import { Slide, toast } from 'react-toastify'
import { BiLoaderCircle } from 'react-icons/bi'
import { getUserPosts } from '../../Api/GetUserPosts.api'

function getInitials(name) {
  if (!name) return ''
  const words = name.trim().split(' ').filter(Boolean)
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase()
}

export default function Profile() {
  const { id } = useParams()
  const { myId } = useContext(TokenContext)
  const [isOpen, setIsOpen] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const [isPhotoDeleted, setIsPhotoDeleted] = useState(false)
  const imgRef = useRef(null)
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('All')
  const [aboutOpen, setAboutOpen] = useState(false)
  const [followModalOpen, setFollowModalOpen] = useState(false)
  const [photoViewer, setPhotoViewer] = useState({ open: false, url: '' })
  const [followListType, setFollowListType] = useState(null)

  // get profile
  const { data, isLoading, isError, error } = useQuery({
    queryKey: id ? ['getUserProfile', id] : ['getmyprofile'],
    queryFn: () => (id ? getUserProfile({ id }) : getmyprofile()),
    select: (data) => data?.data?.data?.user
  })
  console.log(data)

  const currentPhoto = isPhotoDeleted ? '' : data?.photo
  const isMyProfile = !id || (!!myId && (id === myId || data?._id === myId || data?.id === myId))
  const isFollowing = Boolean(
    data?.followers?.some((f) => (f?._id || f?.id || f) === myId)
  )

  // get posts
  const { data: postData, isLoading: postLoading, isError: postIsError, error: postError } = useQuery({
    queryKey: id ? ['GetUserPosts', id] : ['getmyposts', data?._id || data?.id],
    queryFn: () => (id ? getUserPosts({ id }) : getmyposts({ id: data?._id || data?.id })),
    select: (postData) => postData?.data?.data?.posts,
    enabled: !!(data?._id || data?.id)
  })

  function openPhoto(url) {
    if (!url) return
    setPhotoViewer({ open: true, url })
  }

  // ===== Followers / Following =====
  function openFollowModal(type) {
    setFollowListType(type)
    setFollowModalOpen(true)
  }

  const rawModalList = followListType === 'followers'
    ? (data?.followers || [])
    : followListType === 'following'
      ? (data?.following || [])
      : []
  const modalUsersDirect = rawModalList.filter((item) => typeof item === 'object' && item !== null)
  const stringUserIds = rawModalList.filter((item) => typeof item === 'string' || typeof item === 'number')

  function fetchListedUser(uid) {
    return uid === myId ? getmyprofile() : getUserProfile({ id: uid })
  }

  const modalUsersQueries = useQueries({
    queries: stringUserIds.map((uid) => ({
      queryKey: uid === myId ? ['getmyprofile'] : ['getUserProfile', uid],
      queryFn: () => fetchListedUser(uid),
      select: (res) => res?.data?.data?.user,
      enabled: followModalOpen && !!uid,
    }))
  })

  const modalUsersLoading = modalUsersQueries.some((q) => q.isLoading)
  const fetchedUsers = modalUsersQueries.map((q) => q.data).filter(Boolean)
  const modalUsers = [...modalUsersDirect, ...fetchedUsers]
  const previewFollowingRaw = (data?.following || []).slice(0, 6)
  const previewFollowingDirect = previewFollowingRaw.filter((item) => typeof item === 'object' && item !== null)
  const previewFollowingIds = previewFollowingRaw.filter((item) => typeof item === 'string' || typeof item === 'number')

  const previewFollowingQueries = useQueries({
    queries: previewFollowingIds.map((uid) => ({
      queryKey: uid === myId ? ['getmyprofile'] : ['getUserProfile', uid],
      queryFn: () => fetchListedUser(uid),
      select: (res) => res?.data?.data?.user,
      enabled: !!uid,
    }))
  })
  const fetchedPreviewUsers = previewFollowingQueries.map((q) => q.data).filter(Boolean)
  const previewFollowingUsers = [...previewFollowingDirect, ...fetchedPreviewUsers]

  const postImages = (postData || [])
    .filter((p) => p?.image)
    .map((p) => ({ id: p.id || p._id, url: p.image }))

  const allPhotos = [
    ...(currentPhoto ? [{ id: 'profile-photo', url: currentPhoto }] : []),
    ...postImages
  ]
  const previewPhotos = allPhotos.slice(0, 9)

  // ===== Tabs handling =====
  function handleTabChange(key) {
    if (key === 'About') {
      setAboutOpen(true)
      return
    }
    if (key === 'Following') {
      openFollowModal('following')
      return
    }
    setActiveTab(key)
  }

  function handelImage(e) {
    if (e.target.files && e.target.files[0]) {
      const path = URL.createObjectURL(e.target.files[0])
      setIsUploaded(path)
    }
  }

  function handelFormdata() {
    const formData = new FormData()
    if (imgRef?.current?.files[0]) {
      formData.append('photo', imgRef?.current?.files[0])
    }
    return formData
  }

  // upload photo
  const { isPending, mutate } = useMutation({
    mutationFn: () => UploadPhoto(handelFormdata()),
    onSuccess: () => {
      setIsPhotoDeleted(false)
      queryClient.invalidateQueries({ queryKey: ['GetPosts'] })
      queryClient.invalidateQueries({ queryKey: ['getmyprofile'] })
      queryClient.invalidateQueries({ queryKey: ['getmyposts'] })
      toast.success('Photo Uploaded successfully', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        style: {
          backgroundColor: "#B1B0B0",
          color: "#000000",
          borderRadius: "12px",
        },
        icon: <span className="text-black text-xl font-bold">✓</span>,
        transition: Slide,
      });
      setIsOpen(false)
      setIsUploaded(false)
      if (imgRef.current) imgRef.current.value = ""
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to upload photo', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
        transition: Slide,
      });
    }
  })

  // ===== دالة الحذف =====
  function handleDeletePhoto() {
    setIsPhotoDeleted(true)

    const cacheKey = id ? ['getUserProfile', id] : ['getmyprofile']
    queryClient.setQueryData(cacheKey, (oldData) => {
      if (!oldData) return oldData
      return {
        ...oldData,
        data: {
          ...oldData.data,
          user: {
            ...oldData.data.user,
            photo: ''
          }
        }
      }
    })

    toast.success('Profile photo deleted', {
      position: "top-right",
      autoClose: 1500,
      theme: "light",
      transition: Slide,
    });
  }

  // follow and unfollow
  const { isPending: followPending, mutate: followMutate } = useMutation({
    mutationFn: () => PutFollow({ id: data?._id || data?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getUserProfile', id] })
      queryClient.invalidateQueries({ queryKey: ['getmyprofile'] })
      queryClient.invalidateQueries({ queryKey: ['getFollowSuggest'] })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update follow status', {
        position: "top-right",
        autoClose: 1500,
        theme: "colored",
        transition: Slide,
      });
    }
  })

  if (isLoading || postLoading) {
    return <Loader />
  }
  if (isError) {
    return <Error apiError={error.message} />
  }
  if (postIsError) {
    return <Error apiError={postError.message} />
  }

  const genderLabel = data?.gender
    ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1)
    : '.................'

  const dobLabel = data?.dateOfBirth
    ? new Date(data.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '.................'

  const joinedLabel = data?.createdAt ? new Date(data.createdAt).getFullYear() : '...'

  return (
    <>
      <title>My Profile</title>
      <div className="w-full bg-[#f7faff] dark:bg-[#060607] min-h-screen pb-10">
        <div className="shadow-sm bg-[#f7faff] dark:bg-[#060607]">
          <div className="w-full md:w-[90%] lg:w-[75%] mx-auto">
            <div className="relative ">
              {/* Cover photo */}
              <div className=" w-full h-47.5 sm:h-70 md:h-87.5 overflow-hidden md:rounded-b-xl">
                {currentPhoto ? (
                  <img
                    src={currentPhoto}
                    alt="cover"
                    className="w-full h-full object-cover bg-gray-300 dark:bg-gray-800"
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                    {data?.name}
                  </div>
                )}
              </div>
              {isMyProfile && (
                <button onClick={() => setIsOpen(true)} className=" absolute bottom-3 right-3 bg-[#FAF9F9] flex justify-center dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] cursor-pointer p-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden">
                  <span className=" flex z-20 items-center gap-1.5 text-sm md:tex-lg font-bold">
                    <FiCamera className="size-4" />
                    <span className="hidden sm:inline">Edit cover photo</span>
                  </span>
                  <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                  <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                </button>
              )}
              <div className="absolute -bottom-14 sm:-bottom-16 md:-bottom-18 left-1/2 -translate-x-1/2 md:left-6 md:translate-x-0">
                <Dropdown>
                  <Dropdown.Trigger>
                    <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-4 border-white shadow cursor-pointer overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-3xl sm:text-4xl md:text-5xl uppercase select-none">
                      {currentPhoto ? (
                        <img
                          src={currentPhoto}
                          alt={data?.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{getInitials(data?.name)}</span>
                      )}
                    </div>
                  </Dropdown.Trigger>
                  <Dropdown.Popover>
                    <Dropdown.Menu>
                      {currentPhoto && (
                        <Dropdown.Item onAction={() => openPhoto(currentPhoto)} id="Show-Picture" textValue="Show Picture">
                          <LuSquareUserRound className='text-lg dark:text-white' />
                          <Label>See Profile Picture</Label>
                        </Dropdown.Item>
                      )}
                      {isMyProfile && (
                        <Dropdown.Item onAction={() => setIsOpen(true)} id="new-Picture" textValue="new Picture">
                          <ImFilePicture className='text-lg dark:text-white' />
                          <Label>Choose Profile Picture</Label>
                        </Dropdown.Item>
                      )}
                      {isMyProfile && currentPhoto && (
                        <Dropdown.Item
                          onAction={handleDeletePhoto}
                          id="delete-Picture"
                          textValue="delete Picture"
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <FaTrashAlt className='text-lg text-red-500' />
                          <Label className="text-red-500 font-medium">Delete Profile Picture</Label>
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>

                <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                  <Modal.Backdrop>
                    <Modal.Container>
                      <Modal.Dialog className="sm:max-w-90">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                          <Modal.Heading>Choose Profile Photo</Modal.Heading>
                        </Modal.Header>
                        <Modal.Body>
                          {isUploaded && <div className="relative">
                            <img className='mt-2' src={isUploaded} alt="" />
                            <div onClick={() => {
                              setIsUploaded(false)
                              if (imgRef.current) imgRef.current.value = ""
                            }} className="p-0.5 bg-gray-400 rounded-full absolute top-1.5 right-1.5 cursor-pointer text-2xl text-white">
                              <IoCloseSharp />
                            </div>
                          </div>}
                        </Modal.Body>
                        <Modal.Footer>
                          <button className={!isUploaded ? "w-full bg-[#FAF9F9] flex justify-center dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden" : "w-[50%] bg-[#FAF9F9] flex justify-center dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden"}>
                            <span className="relative z-20 text-sm md:tex-lg font-bold">
                              <div>
                                <label htmlFor="Uploadimage" className='flex gap-1 cursor-pointer items-center justify-center '>
                                  <FaFileImage />Upload Photo
                                </label>
                                <input ref={imgRef} onChange={handelImage} id='Uploadimage' type="file" hidden />
                              </div>
                            </span>
                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                          </button>

                          {isUploaded && (<button onClick={() => mutate()} className="w-[50%] bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden">
                            <span className="relative flex justify-center z-20 text-sm md:tex-lg font-bold">
                              {isPending ? <BiLoaderCircle className='animate-spin' /> : "Save"}
                            </span>
                            <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                            <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                          </button>)}
                        </Modal.Footer>
                      </Modal.Dialog>
                    </Modal.Container>
                  </Modal.Backdrop>
                </Modal>
              </div>
            </div>

            {/* Name + action buttons */}
            <div className="text-[#060607] dark:text-[#f7faff] mt-12.5 sm:mt-0 sm:pt-20 md:pt-4 md:pl-52 pb-4 px-3 flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4 text-center md:text-left">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                  {data?.name}
                </h1>
                <div className="flex mt-1 gap-3 items-center">
                  <p
                    onClick={() => openFollowModal('followers')}
                    className="font-bold text-sm cursor-pointer hover:underline"
                  >
                    {data?.followersCount || data?.followers?.length || 0} followers
                  </p>
                  <span>•</span>
                  <p
                    onClick={() => openFollowModal('following')}
                    className="font-bold text-sm cursor-pointer hover:underline"
                  >
                    {data?.followingCount || data?.following?.length || 0} following
                  </p>
                </div>
              </div>
              {!isMyProfile && (
                <div className="cursor-pointer">
                  <button
                    type="button"
                    onClick={() => followMutate()}
                    disabled={followPending}
                    className="bg-[#FAF9F9] flex justify-center dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer p-3 font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden"
                  >
                    <span className="relative z-20 flex items-center justify-center text-sm font-bold ">
                      {followPending ? <BiLoaderCircle className='animate-spin text-xl' /> : (isFollowing ? 'Unfollow' : 'Follow')}
                    </span>
                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                  </button>
                </div>
              )}

            </div>

            {/* Tabs */}
            <div className="">
              <Tabs selectedKey={activeTab} onSelectionChange={handleTabChange} className=" w-full max-w-md " variant="secondary">
                <Tabs.ListContainer className='border-0'>
                  <Tabs.List aria-label="Options">
                    <Tabs.Tab className='py-6' id="All">
                      All
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab className='py-6' id="About">
                      About
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab className='py-6' id="Photos">
                      Photos
                      <Tabs.Indicator />
                    </Tabs.Tab>
                    <Tabs.Tab className='py-6' id="Following">
                      Following
                      <Tabs.Indicator />
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs.ListContainer>
              </Tabs>
            </div>
          </div>
        </div>

        {/* ===== Body ===== */}
        {activeTab === 'Photos' ? (
          <div className="w-[95%] md:w-[90%] lg:w-[75%] mx-auto mt-4">
            {allPhotos.length > 0 ? (
              <div className="card bg-[#f7faff] dark:bg-[#060607] shadow-lg dark:shadow-white/50 p-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {allPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => openPhoto(photo.url)}
                      className="aspect-square rounded-lg overflow-hidden bg-[#060607]/10 dark:bg-[#FAF9F9]/10 cursor-pointer hover:opacity-90 transition"
                    >
                      <img src={photo.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff] shadow-lg dark:shadow-white/50 p-6 text-center">
                No photos yet
              </div>
            )}
          </div>
        ) : (
          <div className="w-[95%] md:w-[90%] lg:w-[75%] mx-auto mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
            {/* Left sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Personal details */}
              <div className="text-[#060607] dark:text-[#f7faff] card shadow-lg dark:shadow-white/50 p-4">
                <h2 className="font-bold text-lg mb-3">Personal details</h2>
                <ul className="flex flex-col gap-3 text-sm sm:text-base">
                  <li className="flex items-center gap-3">
                    <BsGenderAmbiguous className="size-5 shrink-0" />
                    Gender <span className="font-semibold">{genderLabel}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaBirthdayCake className="size-5 shrink-0" />
                    Born <span className="font-semibold">{dobLabel}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCalendar className="size-5 shrink-0" />
                    Joined <span className="font-semibold">{joinedLabel}</span>
                  </li>
                </ul>
              </div>

              {/* Photos preview */}
              <div className="bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff] card shadow-lg dark:shadow-white/50 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-bold text-lg">Photos</h2>
                  {allPhotos.length > 0 && (
                    <button
                      onClick={() => setActiveTab('Photos')}
                      className="text-blue-600 hover:underline text-sm font-medium cursor-pointer"
                    >
                      See all photos
                    </button>
                  )}
                </div>
                {previewPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-1.5">
                    {previewPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        onClick={() => openPhoto(photo.url)}
                        className="aspect-square rounded-md overflow-hidden bg-[#060607]/10 dark:bg-[#FAF9F9]/10 cursor-pointer hover:opacity-90 transition"
                      >
                        <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#060607]/50 dark:text-[#FAF9F9]/50">No photos yet</p>
                )}
              </div>

              {/* Following preview */}
              <div className="card bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff] shadow-lg dark:shadow-white/50 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-bold text-lg">Following</h2>
                  {(data?.followingCount || data?.following?.length || 0) > 0 && (
                    <button
                      onClick={() => openFollowModal('following')}
                      className="text-blue-600 hover:underline text-sm font-medium cursor-pointer"
                    >
                      See all Following
                    </button>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3">
                  {data?.followingCount || data?.following?.length || 0} following
                </p>
                {previewFollowingUsers.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {previewFollowingUsers.map((user) => {
                      const uId = user?._id || user?.id;
                      return (
                        <Link key={uId} to={`/profile/${uId}`} className="flex flex-col items-center">
                          <div className="w-full aspect-square rounded-md overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-lg uppercase select-none">
                            {user?.photo ? (
                              <img src={user?.photo} alt={user?.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{getInitials(user?.name)}</span>
                            )}
                          </div>
                          <span className="text-xs font-medium mt-1 truncate w-full text-center">{user?.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-[#060607]/50 dark:text-[#FAF9F9]/50">Not following anyone yet</p>
                )}
              </div>
            </div>

            {/* Right: posts feed */}
            <div className=" lg:col-span-3 flex flex-col gap-3">
              {isMyProfile && (
                <div className="card bg-[#f7faff] dark:bg-[#060607] shadow-lg dark:shadow-white/50 p-3">
                  <CreatePost photo={currentPhoto} />
                </div>
              )}

              {postData && postData.length > 0 ? (
                postData.map((post) => <CardPost post={post} key={post.id || post._id} />)
              ) : (
                <div className="card bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff] shadow-lg dark:shadow-white/50 p-6 text-center">
                  No posts yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ===== About Modal ===== */}
      <Modal isOpen={aboutOpen} onOpenChange={setAboutOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-90 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading className="text-[#060607] dark:text-[#FAF9F9]">About</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <ul className="flex flex-col gap-4 text-sm sm:text-base">
                  <li className="flex items-center gap-3">
                    <BsGenderAmbiguous className="size-5 shrink-0" />
                    Gender <span className="font-semibold">{genderLabel}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FaBirthdayCake className="size-5 shrink-0" />
                    Born <span className="font-semibold">{dobLabel}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <FiCalendar className="size-5 shrink-0" />
                    Joined <span className="font-semibold">{joinedLabel}</span>
                  </li>
                </ul>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* ===== Followers / Following Modal ===== */}
      <Modal isOpen={followModalOpen} onOpenChange={setFollowModalOpen}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-90 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9]">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading className="text-[#060607] dark:text-[#FAF9F9]">
                  {followListType === 'followers' ? 'Followers' : 'Following'}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                {modalUsersLoading ? (
                  <div className="flex justify-center py-6">
                    <BiLoaderCircle className="animate-spin text-2xl" />
                  </div>
                ) : modalUsers.length > 0 ? (
                  <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                    {modalUsers.map((user) => {
                      const uId = user?._id || user?.id;
                      return (
                        <Link
                          key={uId}
                          to={`/profile/${uId}`}
                          onClick={() => setFollowModalOpen(false)}
                          className="flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full shrink-0 bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase select-none overflow-hidden">
                            {user?.photo ? (
                              <img className='w-full h-full object-cover' src={user?.photo} alt={user?.name} />
                            ) : (
                              <span>{getInitials(user?.name)}</span>
                            )}
                          </div>
                          <h3 className='font-medium text-sm text-[#060607] dark:text-[#FAF9F9]'>{user?.name}</h3>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-[#060607]/50 dark:text-[#FAF9F9]/50 py-6">
                    No users to show
                  </p>
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      {/* ===== Photo Viewer Modal ===== */}
      <Modal isOpen={photoViewer.open} onOpenChange={(open) => setPhotoViewer((p) => ({ ...p, open }))}>
        <Modal.Backdrop>
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-150 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] p-0 overflow-hidden">
              <Modal.CloseTrigger />
              <Modal.Body className="p-0">
                {photoViewer.url && (
                  <img
                    src={photoViewer.url}
                    alt=""
                    className="w-full max-h-[80vh] object-contain"
                  />
                )}
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  )
}