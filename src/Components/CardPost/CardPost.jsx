import dayjs from 'dayjs'
import React, { useContext, useState } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import { FaBookmark, FaFileImage, FaRegBookmark, FaRegComment } from 'react-icons/fa'
import { RiShareForwardLine } from 'react-icons/ri'
import Comment from '../Comment/Comment'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LikePost } from '../../Api/likePost.api'
import { CreateBookmark } from '../../Api/BookMark.api'
import { Slide, toast } from 'react-toastify'
import { BsThreeDots } from "react-icons/bs";
import { Button, Dropdown, Label, Modal } from "@heroui/react";
import { MdDelete, MdModeEditOutline } from 'react-icons/md'
import { DeletePost } from '../../Api/DeletePost.api'
import { TokenContext } from '../../Context/TokenContext'
import { EditPost } from '../../Api/EditPost.api'
import { BiLoaderCircle } from "react-icons/bi";


export default function CardPost({ post }) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  dayjs.extend(relativeTime)
  const { myId } = useContext(TokenContext)
  const userId = post?.user?._id
  const [body, setBody] = useState("")
  const [image, setImage] = useState(null)

  // like and unlike mutation
  const { data, mutate } = useMutation({
    mutationFn: () => LikePost({ post }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['getDetails']
      })
      queryClient.invalidateQueries({
        queryKey: ['GetPosts']
      })
      queryClient.invalidateQueries({
        queryKey: ['getmyposts']
      })
    }
  })
  // console.log(data);

  // bookmark mutation
  const { mutate: bookmarkMutate } = useMutation({
    mutationFn: () => CreateBookmark({ id: post?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["GetPosts"]
      })
      queryClient.invalidateQueries({
        queryKey: ["getDetails"]
      })
      queryClient.invalidateQueries({
        queryKey: ["getmyposts"]
      })
      {
        !post.bookmarked && toast.success('Post have been saved Successfully', {
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
      }
      {
        post.bookmarked && toast.success('Post have been unsaved Successfully', {
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
      }

    }
  })

  // delete mutation
  const { mutate: DeleteMutate } = useMutation({
    mutationFn: () => DeletePost({ id: post?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["GetPosts"]
      })
      queryClient.invalidateQueries({
        queryKey: ["getmyposts"]
      })
      toast.success('Post have Been Deleted Successfully', {
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
    }
  })


  // Update mutation
  function editPost() {
    setIsOpen(true)
    setBody(post.body || "")
    setImage(null)
  }

  const { mutate: EditMutate, isPending: EditPending } = useMutation({
    mutationFn: (formData) => EditPost({ id: post?.id }, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['GetPosts']
      })
      queryClient.invalidateQueries({
        queryKey: ["getmyposts"]
      })
      queryClient.invalidateQueries({
        queryKey: ['getDetails']
      })
      toast.success('Post have Been Updated successfully ', {
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
    },
    onError: (error) => {
      toast.error(error?.response?.data?.errors, {
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
    }
  })

  function handelUpdate() {
    const formData = new FormData()
    formData.append('body', body)
    if (image) {
      formData.append('image', image)
    }
    EditMutate(formData)
  }

  return (
    <>
      <div className="card bg-[#FAF9F9] dark:bg-[#060607] dark:shadow-white/25 w-full mt-3 p-0 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={'/profile'}>
                <div className="w-10 h-10">
                  <img className='rounded-full w-full h-full' src={post.user.photo} alt={post.user.name} />
                </div>
              </Link>
              <div>
                <Link to={'/profile'}>
                  <h3 className='font-medium text-[#060607] dark:text-[#FAF9F9]'>{post.user.name}</h3>
                </Link>
                <span className='text-[#060607]/70 dark:text-[#FAF9F9]/70'>{dayjs(post.createdAt).fromNow()}</span>
              </div>
            </div>
            <div className="cursor-pointer">
              <Dropdown>
                <Button className='bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] hover:bg-[#FAF9F9]/80 dark:hover:bg-[#060607]/80 cursor-pointer' aria-label="Menu" variant="secondary">
                  <BsThreeDots />
                </Button>
                <Dropdown.Popover className="bg-[#FAF9F9] dark:bg-[#060607]">
                  <Dropdown.Menu className="bg-[#FAF9F9] dark:bg-[#060607]">
                    <Dropdown.Item className='flex items-center justify-between gap-3 text-[#060607] dark:text-[#FAF9F9]' onAction={() => bookmarkMutate()} id="Save Post" textValue="Save Post">
                      <div className="text-lg">
                        {post.bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                      </div>
                      <Label className='text-[#060607] dark:text-[#FAF9F9]'>Save Post</Label>
                    </Dropdown.Item>
                    {myId === userId && <>
                      <Dropdown.Item onAction={() => editPost()} className='flex items-center justify-between gap-3 text-[#060607] dark:text-[#FAF9F9]' id="edit-file" textValue="Edit file">
                        <span className="text-lg"><MdModeEditOutline /></span>
                        <Label className='text-[#060607] dark:text-[#FAF9F9]'>Edit Post</Label>
                      </Dropdown.Item>
                      <Dropdown.Item onAction={() => DeleteMutate()} className='flex items-center justify-between gap-3 text-[#060607] dark:text-[#FAF9F9]' id="delete-file" textValue="Delete file" variant="danger">
                        <span className="text-lg"><MdDelete /></span>
                        <Label className='text-[#060607] dark:text-[#FAF9F9]'>Delete Post</Label>
                      </Dropdown.Item>
                    </>}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        </div>
        <Link to={`/PostDetails/${post?.id}`}>
          {post.body && <h4 className="card-title px-3 mb-2 text-[#060607] dark:text-[#FAF9F9]">{post.body}</h4>}
          {post.image && <figure>
            <img className='w-full' src={post.image} alt={post.body} />
          </figure>}
        </Link>
        <div className="flex justify-between items-center px-3 text-[#060607] dark:text-[#FAF9F9]">
          <div onClick={() => mutate()} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">
            {data?.data?.data?.liked ? <AiFillLike /> : <AiOutlineLike />}
            {post.likesCount == 0 ? "" : <span>{post.likesCount}</span>}
          </div>
          <Link to={`/postDetails/${post?.id}`} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">
            <FaRegComment />
            {post.commentsCount == 0 ? "" : <span>{post.commentsCount}</span>}
          </Link>
          <div className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">
            <RiShareForwardLine />
            {post.sharesCount == 0 ? "" : <span>{post.sharesCount}</span>}
          </div>
        </div>

        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-90 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9]">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading className="text-[#060607] dark:text-[#FAF9F9]">Edit your post</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} className='w-full shadow-md dark:shadow-white/50 bg-[#060607]/10 dark:bg-[#FAF9F9]/10 text-[#060607] dark:text-[#FAF9F9] resize-none cursor-pointer p-2 rounded-2xl' placeholder="What's on your mind , ?">
                  </textarea>
                </Modal.Body>
                <Modal.Footer>
                  <div className="w-[50%] font-semibold">
                    <label htmlFor="imageCard" className='flex gap-1 cursor-pointer items-center justify-center transition bg-[#060607]/20 dark:bg-[#FAF9F9]/20 hover:bg-[#060607]/30 dark:hover:bg-[#FAF9F9]/30 text-[#060607] dark:text-[#FAF9F9] rounded-full py-1.5'>
                      <FaFileImage />Choose img
                    </label>
                    <input onChange={(e) => setImage(e.target.files[0])} id='imageCard' type="file" hidden />
                  </div>
                  <Button onClick={() => handelUpdate()} className="w-[50%] bg-[#060607] dark:bg-[#FAF9F9] text-[#FAF9F9] dark:text-[#060607]" slot="close">
                    {EditPending ? <BiLoaderCircle className='animate-spin' /> : "Edit Post"}
                  </Button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>
        <div className="mx-3">
          {post.topComment && <Comment comment={post.topComment} postid={post?.id} />}
        </div>
      </div>
    </>
  )
}
