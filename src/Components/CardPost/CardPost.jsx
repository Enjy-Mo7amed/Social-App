import dayjs from 'dayjs'
import { useContext, useState } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import { FaBookmark, FaFileImage, FaRegBookmark, FaRegComment } from 'react-icons/fa'
import { RiShareForwardLine } from 'react-icons/ri'
import Comment from '../Comment/Comment'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { getPOstLikes } from '../../Api/GetPostLikes.api'
import { PostShare } from '../../Api/PostShare.api'
import SharedPostEmbed from '../SharedPostEmbed/SharedPostEmbed'


export default function CardPost({ post }) {
  const [isOpen, setIsOpen] = useState(false)
  const [Likes, setLikes] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareText, setShareText] = useState("")
  const queryClient = useQueryClient()
  dayjs.extend(relativeTime)
  const { myId } = useContext(TokenContext)
  const userId = post?.user?._id
  const sharedPost = post?.sharedPost
  const [body, setBody] = useState("")
  const [image, setImage] = useState(null)

  //get likes
  const { data: likesData } = useQuery({
    queryKey: ['GEtPostLikes', post?.id],
    queryFn: () => getPOstLikes({ id: post?.id }),
    select: (likesData) => likesData?.data?.data?.likes,
    enabled: !!post?.id
  })
  const isLiked = likesData?.some((like) => (like?._id || like?.id) === myId) || post?.isLiked;

  // like and unlike mutation
  const { mutate } = useMutation({
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
      queryClient.invalidateQueries({
        queryKey: ['GEtPostLikes', post?.id]
      })
    }
  })

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
      queryClient.invalidateQueries({
        queryKey: ["GetSavedBookMarks"]
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
      setIsOpen(false)
      toast.success('Post have Been Updated successfully ', {
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
        theme: "colored",
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


  //post share
  function openShareModal() {
    setShareOpen(true)
    setShareText("")
  }

  const { mutate: shareMutate, isPending: sharePending } = useMutation({
    mutationFn: () => PostShare({ id: post?.id, body: shareText }),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: ['getmyposts']
      })
      queryClient.invalidateQueries({
        queryKey: ["getDetails"]
      })
      queryClient.invalidateQueries({
        queryKey: ['GetPosts']
      })
      setShareOpen(false)
      setShareText("")
      toast.success('Post have Been shared successfully ', {
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
        theme: "colored",
        transition: Slide,
      });
    }
  })

  return (
    <>
      <div className="card bg-[#FAF9F9] dark:bg-[#060607] dark:shadow-white/25 w-full mt-3 p-0 shadow-lg">
        <div className="card-body">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post?.user?._id}`}>
                <div className="w-10 h-10">
                  <img className='rounded-full w-full h-full' src={post.user.photo} alt={post.user.name} />
                </div>
              </Link>
              <div>
                <Link to={`/profile/${post?.user?._id}`}>
                  <h3 className='font-medium text-black dark:text-[#FAF9F9]'>{post.user.name}</h3>
                </Link>
                <span className='text-black/50 dark:text-[#FAF9F9]/70'>{dayjs(post.createdAt).fromNow()}</span>
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
                      <Label className='text-[#060607] dark:text-[#FAF9F9]'>{post.bookmarked ? "Un Save Post" : "Save Post"}</Label>
                    </Dropdown.Item>
                    {myId === userId && <>
                      <Dropdown.Item onAction={() => editPost()} className='flex items-center justify-between gap-3 text-black dark:text-[#FAF9F9]' id="edit-file" textValue="Edit file">
                        <span className="text-lg text-black dark:text-[#FAF9F9]"><MdModeEditOutline /></span>
                        <Label className='text-black dark:text-[#FAF9F9]'>Edit Post</Label>
                      </Dropdown.Item>
                      <Dropdown.Item onAction={() => DeleteMutate()} className='flex items-center justify-between gap-3 text-black dark:text-[#FAF9F9]' id="delete-file" textValue="Delete file" variant="danger">
                        <span className="text-lg text-black dark:text-[#FAF9F9]"><MdDelete /></span>
                        <Label className='text-black dark:text-[#FAF9F9]'>Delete Post</Label>
                      </Dropdown.Item>
                    </>}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            </div>
          </div>
        </div>
        <Link to={`/PostDetails/${post?.id}`}>
          {post.body && <h4 className="card-title px-3 mb-2 text-black dark:text-[#FAF9F9]">{post.body}</h4>}
        </Link>
        {sharedPost ? (
          <SharedPostEmbed original={sharedPost} />
        ) : (
          <Link to={`/PostDetails/${post?.id}`}>
            {post.image && <figure>
              <img className='w-full' src={post.image} alt={post.body} />
            </figure>}
          </Link>
        )}
        <div className="flex justify-between items-center px-3 text-[#060607] dark:text-[#FAF9F9]">
          <div className="flex gap-2 items-center">
            <div onClick={() => mutate()} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">
              {isLiked ? <AiFillLike /> : <AiOutlineLike />}
              {post.likesCount == 0 ? "" : <span>{post.likesCount}</span>}
            </div>
            <Link to={`/postDetails/${post?.id}`} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">
              <FaRegComment />
              {post.commentsCount == 0 ? "" : <span>{post.commentsCount}</span>}
            </Link>
            <div onClick={() => openShareModal()} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">
              <RiShareForwardLine />
              {post.sharesCount == 0 ? "" : <span>{post.sharesCount}</span>}
            </div>
          </div>
          {post.likesCount == 0 ? "" :
            <div onClick={() => setLikes(true)} className='cursor-pointer text-sm p-1 rounded-full bg-blue-700 text-white'>
              <AiFillLike color='white' />
            </div>}
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
                  <button className="bg-[#FAF9F9] flex justify-center w-[50%] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow  text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                    <span className="relative z-20  text-sm md:tex-lg font-bold">
                      <label htmlFor="imagePost" className='flex gap-1 cursor-pointer items-center'><FaFileImage />Choose img</label>
                      <input onChange={(e) => setImage(e.target.files[0])} id='imagePost' type="file" hidden />
                    </span>
                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                  </button>

                  <button onClick={() => handelUpdate()} className="w-[50%]  bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow  text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline  focus:outline-black focus:outline-offset-4 overflow-hidden">
                    <span className="relative  flex justify-center z-20 text-sm md:tex-lg font-bold">
                      {EditPending ? <BiLoaderCircle className='animate-spin' /> : "Edit Post"}
                    </span>
                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                  </button>
                </Modal.Footer>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        <Modal isOpen={Likes} onOpenChange={setLikes}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-90 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9]">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <Modal.Heading className="text-[#060607] dark:text-[#FAF9F9]">Likes</Modal.Heading>
                </Modal.Header>
                <Modal.Body>
                  {likesData?.map((like) => <div key={like?.id} className="flex mt-2 items-center gap-3">
                    <Link to={`/profile/${like?._id}`}>
                      <div className="w-10 h-10">
                        <img className='rounded-full w-full h-full' src={like?.photo} alt={like?.name} />
                      </div>
                    </Link>
                    <div>
                      <Link to={`/profile/${like?._id}`}>
                        <h3 className='font-medium text-[#060607] dark:text-[#FAF9F9]'>{like?.name}</h3>
                      </Link>
                    </div>
                  </div>)}
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal>

        {/* ===== Share Post Modal ===== */}
        <Modal isOpen={shareOpen} onOpenChange={setShareOpen}>
          <Modal.Backdrop>
            <Modal.Container>
              <Modal.Dialog className="sm:max-w-110 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9]">
                <Modal.CloseTrigger />
                <Modal.Header>
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-lg flex items-center justify-center bg-[#060607]/10 dark:bg-[#FAF9F9]/10 text-[#060607] dark:text-[#FAF9F9] text-lg">
                      <RiShareForwardLine />
                    </div>
                    <div>
                      <Modal.Heading className="text-[#060607] dark:text-[#FAF9F9]">Share Post</Modal.Heading>
                      <p className="text-sm text-[#060607]/60 dark:text-[#FAF9F9]/60 mt-0.5">
                        Share this post
                      </p>
                    </div>
                  </div>
                </Modal.Header>

                <Modal.Body>
                  <textarea
                    value={shareText}
                    onChange={(e) => setShareText(e.target.value)}
                    className="w-full shadow-md dark:shadow-white/20 bg-[#060607]/5 dark:bg-[#FAF9F9]/5 text-[#060607] dark:text-[#FAF9F9] resize-none p-3 rounded-xl mb-4"
                    placeholder="Add a comment (optional)..."
                    rows={3}
                  />

                  {/* Original post preview */}
                  <div className="border border-[#060607]/10 dark:border-[#FAF9F9]/15 rounded-xl p-3 bg-[#060607]/3 dark:bg-[#FAF9F9]/3">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 shrink-0">
                        <img className='rounded-full w-full h-full object-cover' src={post?.user?.photo} alt={post?.user?.name} />
                      </div>
                      <div>
                        <h3 className='font-medium text-sm text-[#060607] dark:text-[#FAF9F9]'>{post?.user?.name}</h3>
                        <span className='text-xs text-[#060607]/60 dark:text-[#FAF9F9]/60'>{dayjs(post?.createdAt).fromNow()}</span>
                      </div>
                    </div>

                    {post?.body && (
                      <p className="text-sm text-[#060607] dark:text-[#FAF9F9] mb-2">{post.body}</p>
                    )}

                    {post?.image && (
                      <div className="w-full rounded-lg overflow-hidden mb-2">
                        <img className='w-full max-h-52 object-cover' src={post.image} alt={post.body} />
                      </div>
                    )}
                  </div>
                </Modal.Body>

                <Modal.Footer>
                  <button
                    onClick={() => setShareOpen(false)}
                    className="bg-[#FAF9F9] flex justify-center w-[50%] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden"
                  >
                    <span className="relative z-20 text-sm md:tex-lg font-bold">Cancel</span>
                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                  </button>

                  <button
                    onClick={() => shareMutate()}
                    disabled={sharePending}
                    className="w-[50%] bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden"
                  >
                    <span className="relative flex justify-center z-20 text-sm md:tex-lg font-bold">
                      {sharePending ? <BiLoaderCircle className='animate-spin' /> : "Share"}
                    </span>
                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                    <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                  </button>
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