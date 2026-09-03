import React, { useRef, useState } from 'react'
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
import { Slide, toast } from 'react-toastify'
import { BiLoaderCircle } from 'react-icons/bi'




export default function Profile() {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploaded, setIsUploaded] = useState(false)
  const imgRef = useRef(null)
  const queryClient = useQueryClient()


  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: () => getmyprofile(),
    select: (data) => data?.data?.data?.user
  })
  // console.log(data);

  const { data: postData, isLoading: postLoading, isError: postIsError, error: postError, isFetching: postFetching } = useQuery({
    queryKey: ['getmyposts', data?.id],
    queryFn: () => getmyposts({ id: data?.id }),
    select: (postData) => postData?.data?.data?.posts,
    enabled: !!data?.id,
  })
  // console.log(postData);

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
    <div className="w-full bg-gray-100 min-h-screen pb-10">
      <div className="bg-white shadow-sm">
        <div className="w-full md:w-[90%] lg:w-[75%] mx-auto">
          <div className="relative">
            {/* Cover photo */}
            <div className="w-full h-47.5 sm:h-70 md:h-87.5 overflow-hidden md:rounded-b-xl bg-gray-300">
              <img
                src={data?.photo}
                alt="cover"
                className="w-full h-full object-cover"
              />
            </div>
            <button onClick={() => setIsOpen(true)} className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/90 hover:bg-white text-xs sm:text-sm font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg shadow transition cursor-pointer">
              <FiCamera className="size-4" />
              <span className="hidden sm:inline">Edit cover photo</span>
            </button>
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
                      <LuSquareUserRound className='text-lg' />
                      <Label>See Profile Picture</Label>
                    </Dropdown.Item>
                    <Dropdown.Item onAction={() => setIsOpen(true)} id="new-Picture" textValue="new Picture">
                      <ImFilePicture className='text-lg' />
                      <Label>Choose Profile Picture</Label>
                    </Dropdown.Item>
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
                        <div className={!isUploaded ? "w-full font-semibold" : "w-[50%] font-semibold"}>
                          <label htmlFor="Uploadimage" className='flex gap-1 cursor-pointer items-center justify-center transition bg-slate-200 hover:bg-slate-300 rounded-full py-1.5'>
                            <FaFileImage />Upload Photo
                          </label>
                          <input ref={imgRef} onChange={handelImage} id='Uploadimage' type="file" hidden />
                        </div>

                        {isUploaded && (
                          <Button onClick={() => mutate()} className="w-[50%]">
                            {isPending ? <BiLoaderCircle className='animate-spin' /> : "Save"}
                          </Button>
                        )}
                      </Modal.Footer>
                    </Modal.Dialog>
                  </Modal.Container>
                </Modal.Backdrop>
              </Modal>
            </div>
          </div>

          {/* Name + action buttons */}
          <div className="pt-16 sm:pt-20 md:pt-4 md:pl-52 pb-4 px-3 flex flex-col md:flex-row md:items-end md:justify-between gap-4 text-center md:text-left">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
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
            <div className="flex items-center justify-center gap-2">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-lg transition cursor-pointer text-sm sm:text-base">
                <MdInsertChart className="size-4" />
                <span>Dashboard</span>
              </button>
              <button className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 font-semibold px-3 sm:px-4 py-2 rounded-lg transition cursor-pointer text-sm sm:text-base">
                <MdModeEdit className="size-4" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button className="bg-gray-200 hover:bg-gray-300 p-2.5 rounded-lg transition cursor-pointer">
                <IoIosArrowDown className="size-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="">
            <Tabs className="w-full max-w-md " variant="secondary">
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
          <div className="card bg-base-100 shadow-sm p-4">
            <h2 className="font-bold text-lg mb-3">Personal details</h2>
            <ul className="flex flex-col gap-3 text-gray-700 text-sm sm:text-base">
              <li className="flex items-center gap-3">
                <FiBriefcase className="size-5 text-gray-500 shrink-0" />
                Works at <span className="font-semibold">.................</span>
              </li>
              <li className="flex items-center gap-3">
                <FiHome className="size-5 text-gray-500 shrink-0" />
                Lives in <span className="font-semibold">.................</span>
              </li>
              <li className="flex items-center gap-3">
                <FiMapPin className="size-5 text-gray-500 shrink-0" />
                From <span className="font-semibold">.................</span>
              </li>
              <li className="flex items-center gap-3">
                <FiCalendar className="size-5 text-gray-500 shrink-0" />
                Joined <span className="font-semibold">.................</span>
              </li>
            </ul>
            <button className="mt-4 bg-gray-200 hover:bg-gray-300 font-semibold py-2 rounded-lg transition cursor-pointer">
              Edit details
            </button>
          </div>

          {/* Photos */}
          <div className="card bg-base-100 shadow-sm p-4">
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

          {/* Friends */}
          <div className="card bg-base-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-lg">Friends</h2>
              <button className="text-blue-600 hover:underline text-sm font-medium cursor-pointer">
                See all friends
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
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="card bg-base-100 shadow-sm p-3">
            <CreatePost photo={data?.photo} />
          </div>

          {postData.length > 0 ? (
            postData.map((post) => <CardPost post={post} key={post.id} />)
          ) : (
            <div className="card bg-base-100 shadow-sm p-6 text-center text-gray-400">
              No posts yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
