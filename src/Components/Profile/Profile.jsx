import React, { useContext, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  FiCamera,
  FiMapPin,
  FiBriefcase,
  FiHome,
  FiCalendar,
} from 'react-icons/fi'
import CreatePost from '../CreatePost/CreatePost'
import CardPost from '../CardPost/CardPost'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getmyprofile } from '../../Api/GetMyProfile.api'
import { getUserProfile } from '../../Api/GetUserProfile.api'
import { TokenContext } from '../../Context/TokenContext'
import Loader from '../Loader/Loader'
import Error from '../Error/Error'
import { MdInsertChart, MdModeEdit } from 'react-icons/md'
import { IoIosArrowDown } from "react-icons/io";
import { Button, Dropdown, DropdownTrigger, Label, Modal, Tabs } from '@heroui/react'
import { getmyposts } from '../../Api/GetMyPosts.api'
import { LuSquareUserRound } from "react-icons/lu";
import { ImFilePicture } from "react-icons/im";
import { FaFileImage } from 'react-icons/fa'
import { IoCloseSharp } from 'react-icons/io5'
import { UploadPhoto } from '../../Api/UploadProfile.api'
import { PutFollow } from '../../Api/PutFollow.api'
import { Slide, toast } from 'react-toastify'
import { BiLoaderCircle } from 'react-icons/bi'
import { getUserPosts } from '../../Api/GetUserPosts.api'

export default function Profile() {
  const { id } = useParams()
  const { myId } = useContext(TokenContext)
  const [isOpen, setIsOpen] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const imgRef = useRef(null)
  const queryClient = useQueryClient()

  // get profile 
  const { data, isLoading, isError, error } = useQuery({
    queryKey: id ? ['getUserProfile', id] : ['getmyprofile'],
    queryFn: () => (id ? getUserProfile({ id }) : getmyprofile()),
    select: (data) => data?.data?.data?.user
  })
  // console.log(data);
  

  const isMyProfile = !id || (!!myId && (id === myId || data?._id === myId))
  const isFollowing = Boolean(
    data?.followers?.some((f) => (f?._id || f?.id || f) === myId)
  )

  // get posts
  const { data: postData, isLoading: postLoading, isError: postIsError, error: postError } = useQuery({
    queryKey: id ? ['GetUserPosts' , id]: ['getmyposts', data?._id],
    queryFn: () => (id? getUserPosts({id}) : getmyposts({ id: data?._id || data?.id })),
    select: (postData) => postData?.data?.data?.posts,
    enabled: !!(data?._id)
  })

  function handelImage(e) {
    const path = URL.createObjectURL(e.target.files[0])
    setIsUploaded(path)
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
      queryClient.invalidateQueries({
        queryKey: ['GetPosts']
      })
      queryClient.invalidateQueries({
        queryKey: ['getmyprofile']
      })
      queryClient.invalidateQueries({
        queryKey: ['getmyposts']
      })
      toast.success('Photo Uploaded successfully', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
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
      imgRef.current.value = ""
    },
    onError: (error) => {
      console.log(error);

      toast.error(error?.response?.data?.message, {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      });
    }
  })

  // follow and unfollow
  const { isPending: followPending, mutate: followMutate } = useMutation({
    mutationFn: () => PutFollow({ id: data?._id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getUserProfile', id]
      })
      queryClient.invalidateQueries({
        queryKey: ['getmyprofile']
      })
      queryClient.invalidateQueries({
        queryKey: ['getFollowSuggest']
      })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update follow status', {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Slide,
      });
    }
  })
  // console.log(followData?.data?.data?.following);
  

  if (isLoading || postLoading) {
    return <Loader />
  }
  if (isError) {
    return <Error apiError={error.message} />
  }
  if (postIsError) {
    return <Error apiError={postError.message} />
  }


  return (
    <div className="w-full bg-[#f7faff] dark:bg-[#060607] min-h-screen pb-10">
      <div className="shadow-sm bg-[#f7faff] dark:bg-[#060607]">
        <div className="w-full md:w-[90%] lg:w-[75%] mx-auto">
          <div className="relative ">
            {/* Cover photo */}
            <div className=" w-full h-47.5 sm:h-70 md:h-87.5 overflow-hidden md:rounded-b-xl">
              <img
                src={data?.photo}
                alt="cover"
                className="w-full h-full object-cover"
              />
            </div>
            {isMyProfile && (
              <button onClick={() => setIsOpen(true)} className=" absolute bottom-3 right-3  bg-[#FAF9F9] flex justify-center  dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] cursor-pointer p-3 text-center font-barlow  text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                <span className=" flex z-20 items-center  gap-1.5 text-sm md:tex-lg font-bold">
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
                <DropdownTrigger>
                  {/* Avatar */}
                  <div>
                    <img
                      src={data?.photo}
                      alt={data?.name}
                      className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full border-4 border-white object-cover shadow"
                    />
                  </div>
                </DropdownTrigger>
                <Dropdown.Popover>
                  <Dropdown.Menu>
                    <Dropdown.Item id="Show-Picture" textValue="Show Picture">
                      <LuSquareUserRound className='text-lg dark:text-white' />
                      <Label>See Profile Picture</Label>
                    </Dropdown.Item>
                    {isMyProfile && (
                      <Dropdown.Item onAction={() => setIsOpen(true)} id="new-Picture" textValue="new Picture">
                        <ImFilePicture className='text-lg dark:text-white' />
                        <Label>Choose Profile Picture</Label>
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
                        <button className={!isUploaded ? "w-full bg-[#FAF9F9] flex justify-center dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow  text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden" : "w-[50%] bg-[#FAF9F9] flex justify-center dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow  text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden"}>
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

                        {isUploaded && (<button onClick={() => mutate()} className="w-[50%]  bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow  text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                          <span className="relative  flex justify-center z-20 text-sm md:tex-lg font-bold">
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
          <div className="text-[#060607] dark:text-[#f7faff]  sm:pt-20 md:pt-4 md:pl-52 pb-4 px-3 flex flex-col md:flex-row items-center md:items-end md:justify-between gap-4 text-center md:text-left">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {data?.name}
              </h1>
              <div className="flex mt-1 gap-3 items-center">
                <p className="font-bold  text-sm ">
                  {data?.followersCount} followers
                </p>
                <span>•</span>
                <p className="font-bold  text-sm ">
                  {data?.followingCount} following
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
            <Tabs className=" w-full max-w-md " variant="secondary">
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
                  <Tabs.Tab className='py-6' id="Reals">
                    Reals
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab className='py-6' id="Photos">
                    Photos
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab className='py-6' id="Friends">
                    Friends
                    <Tabs.Indicator />
                  </Tabs.Tab>
                  <Tabs.Tab className='py-6' id="More">
                    More
                    <Tabs.Indicator />
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>
          </div>
        </div>
      </div>

      {/* ===== Body: sidebar + feed ===== */}
      <div className="w-[95%] md:w-[90%] lg:w-[75%] mx-auto mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {/* Left sidebar */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Personal details */}
          <div className="text-[#060607] dark:text-[#f7faff] card shadow-lg dark:shadow-white/50 p-4">
            <h2 className="font-bold text-lg mb-3">Personal details</h2>
            <ul className="flex flex-col gap-3  text-sm sm:text-base">
              <li className="flex items-center gap-3">
                <FiBriefcase className="size-5  shrink-0" />
                Works at <span className="font-semibold">.................</span>
              </li>
              <li className="flex items-center gap-3">
                <FiHome className="size-5  shrink-0" />
                Lives in <span className="font-semibold">.................</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="size-5  shrink-0" />
                From <span className="font-semibold">.................</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCalendar className="size-5  shrink-0" />
                Joined <span className="font-semibold">{data?.createdAt ? new Date(data.createdAt).getFullYear() : '...'}</span>
              </li>
            </ul>
          </div>

          {/* Photos */}
          <div className="bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff] card shadow-lg dark:shadow-white/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Photos</h2>
              <button className="text-blue-600 hover:underline text-sm font-medium cursor-pointer">
                See all photos
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {/* phoootooos */}
            </div>
          </div>

          {/* Following */}
          <div className="card bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff]  shadow-lg dark:shadow-white/50 p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-lg">Following</h2>
              <button className="text-blue-600 hover:underline text-sm font-medium cursor-pointer">
                See all Following
              </button>
            </div>
            <p className="text-gray-500 text-sm mb-3">
              {/* {profile.friendsCount} friends */}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {/* friendssss */}
            </div>
          </div>
        </div>

        {/* Right: create post + feed */}
        <div className=" lg:col-span-3 flex flex-col gap-3">
          {isMyProfile && (
            <div className="card bg-[#f7faff] dark:bg-[#060607]  shadow-lg dark:shadow-white/50 p-3">
              <CreatePost photo={data?.photo} />
            </div>
          )}

          {postData && postData.length > 0 ? (
            postData.map((post) => <CardPost post={post} key={post.id} />)
          ) : (
            <div className="card bg-[#f7faff] dark:bg-[#060607] text-[#060607] dark:text-[#f7faff]  shadow-lg dark:shadow-white/50 p-6 text-center">
              No posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
