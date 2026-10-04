import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { useContext, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import relativeTime from 'dayjs/plugin/relativeTime';
import { AiFillLike, AiOutlineLike } from 'react-icons/ai';
import { FaBookmark, FaFileImage, FaRegBookmark, FaRegComment } from 'react-icons/fa';
import { RiShareForwardLine } from 'react-icons/ri';
import { getDetails } from '../../Api/GetPostDetails';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { getComments } from '../../Api/Getcomments.api';
import Comment from '../Comment/Comment';
import CreateComment from '../CreateComment/CreateComment';
import { LikePost } from '../../Api/likePost.api';
import { Button, Dropdown, Label, Modal } from "@heroui/react";
import { MdDelete, MdModeEditOutline } from 'react-icons/md';
import { CreateBookmark } from '../../Api/BookMark.api';
import { TokenContext } from '../../Context/TokenContext';
import { Slide, toast } from 'react-toastify';
import { EditPost } from '../../Api/EditPost.api';
import { BsThreeDots } from 'react-icons/bs';
import { BiLoaderCircle } from 'react-icons/bi';
import { DeletePost } from '../../Api/DeletePost.api';
import { getPOstLikes } from '../../Api/GetPostLikes.api';
import { PostShare } from '../../Api/PostShare.api';
import SharedPostEmbed from '../SharedPostEmbed/SharedPostEmbed';

export default function PostDetails() {
    const queryClient = useQueryClient()
    dayjs.extend(relativeTime)
    const { id } = useParams()
    const { myId } = useContext(TokenContext)
    const [isOpen, setIsOpen] = useState(false)
    const [body, setBody] = useState("")
    const [Likes, setLikes] = useState(false)
    const [shareOpen, setShareOpen] = useState(false)
    const [shareText, setShareText] = useState("")
    const [image, setImage] = useState(null)

    // details query
    const { data, isError, isLoading, error } = useQuery({
        queryKey: ["getDetails", id],
        queryFn: () => getDetails({ id }),
        select: (data) => data?.data?.data?.post,
        enabled: !!id
    })

    const userId = data?.user?._id
    const sharedPost = data?.sharedPost

    // comment query
    const { data: comments, isLoading: commentLoader } = useQuery({
        queryKey: ["getComments", id],
        queryFn: () => getComments({ id }),
        select: (comments) => comments?.data?.data?.comments,
        enabled: !!id
    })

    // get likes 
    const { data: likesData } = useQuery({
        queryKey: ['GEtPostLikes', id],
        queryFn: () => getPOstLikes({ id }),
        select: (likesData) => likesData?.data?.data?.likes,
        enabled: !!id
    })

    const isLiked = likesData?.some((like) => (like?._id || like?.id) === myId)

    // like and unlike mutate
    const { mutate } = useMutation({
        mutationFn: () => LikePost({ post: data }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getDetails", id]
            })
            queryClient.invalidateQueries({
                queryKey: ['GetPosts']
            })
            queryClient.invalidateQueries({
                queryKey: ['getmyposts']
            })
            queryClient.invalidateQueries({
                queryKey: ['GEtPostLikes', id]
            })
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

    // bookmark Mutate
    const { mutate: bookmarkMutate } = useMutation({
        mutationFn: () => CreateBookmark({ id: data?.id }),
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
                !data?.bookmarked && toast.success('Post have been saved 👍', {
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
            {
                data?.bookmarked && toast.success('Post have been unsaved 👍', {
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

        }
    })

    // delete mutation
    const { mutate: DeleteMutate } = useMutation({
        mutationFn: () => DeletePost({ id: data?.id }),
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
        setBody(data.body || "")
        setImage(null)
    }

    const { mutate: EditMutate, isPending: EditPending } = useMutation({
        mutationFn: (formData) => EditPost({ id: data?.id }, formData),
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
            toast.success('Post have Been Updated successfully', {
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

    // post share
    function openShareModal() {
        setShareOpen(true)
        setShareText("")
    }

    const { mutate: shareMutate, isPending: sharePending } = useMutation({
        mutationFn: () => PostShare({ id: data?.id, body: shareText }),
        onSuccess: () => {
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
            toast.success('Post have Been shared successfully', {
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

    if (isLoading) {
        return <Loader />
    }
    if (isError) {
        return <Error apiError={error.message} />
    }


    return (
        <>
            <div className="lg:flex min-h-screen p-5 bg-[#FAF9F9] dark:bg-black ">
                {/* caaaaaard */}
                <div className="card bg-[#FAF9F9] dark:bg-[#060607] dark:shadow-white/50 h-fit mr-5  w-full lg:w-[70%]  shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={`/profile/${data?.user?._id || data?.user?.id}`}>
                                <div className=" w-10 h-10"><img className='rounded-full w-full h-full' src={data?.user?.photo} alt={data?.user?.name} /></div>
                            </Link>
                            <div className="">
                                <Link to={`/profile/${data?.user?._id || data?.user?.id}`}>
                                    <h3 className='font-medium text-black dark:text-[#FAF9F9]'>{data?.user?.name}</h3>
                                </Link>
                                <span className='text-black/50 dark:text-[#FAF9F9]'>{dayjs(data?.createdAt).fromNow()}</span>
                            </div>
                        </div>
                        <div className="cursor-pointer">
                            <Dropdown>
                                <Button className='py-1 px-3.5 bg-transparent hover:bg-gray-100 dark:hover:bg-white/20 dark:hover:text-black text-black dark:text-white' aria-label="Menu" variant="secondary">
                                    <BsThreeDots />
                                </Button>
                                <Dropdown.Popover>
                                    <Dropdown.Menu>
                                        <Dropdown.Item className='flex items-center justify-between gap-3' onAction={() => bookmarkMutate()} id="Save Post" textValue="Save Post">
                                            <div className="text-lg text-black dark:text-[#FAF9F9]">
                                                {data?.bookmarked ? <FaBookmark /> : <FaRegBookmark />}
                                            </div>
                                            <Label>Save Post</Label>
                                        </Dropdown.Item>
                                        {myId === userId && <>
                                            <Dropdown.Item onAction={() => editPost()} className='flex dark:text-[#FAF9F9] items-center justify-between gap-3' id="edit-file" textValue="Edit file">
                                                <span className="text-lg"><MdModeEditOutline /></span>
                                                <Label>Edit Post</Label>
                                            </Dropdown.Item>
                                            <Dropdown.Item onAction={() => DeleteMutate()} className='flex dark:text-[#FAF9F9] items-center justify-between gap-3' id="delete-file" textValue="Delete file" variant="danger">
                                                <span className="text-lg"><MdDelete /></span>
                                                <Label className=' text-black dark:text-[#FAF9F9]'>Delete Post</Label>
                                            </Dropdown.Item>
                                        </>}
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown>
                        </div>
                    </div>
                    {data?.body && <h4 className="card-title text-black dark:text-[#FAF9F9]">{data?.body}</h4>}
                    {sharedPost ? (
                        <SharedPostEmbed original={sharedPost} />
                    ) : (
                        data?.image && <figure>
                            <img
                                className='w-full'
                                src={data?.image}
                                alt={data?.body} />
                        </figure>
                    )}
                    <div className="flex justify-between items-center text-[#060607] dark:text-[#FAF9F9]">
                        <div className="flex gap-2 items-center">
                            <div onClick={() => mutate()} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition">{isLiked ? <AiFillLike /> : <AiOutlineLike />}
                                {data?.likesCount == 0 ? "" : <span>{data?.likesCount}</span>}
                            </div>
                            <div className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition"><FaRegComment />
                                {data?.commentsCount == 0 ? "" : <span>{data?.commentsCount}</span>}
                            </div>
                            <div onClick={() => openShareModal()} className="flex items-center gap-1 hover:bg-[#060607]/10 dark:hover:bg-[#FAF9F9]/10 rounded-lg py-1 px-2 cursor-pointer transition"><RiShareForwardLine />
                                {data?.sharesCount == 0 ? "" : <span>{data?.sharesCount}</span>}
                            </div>
                        </div>
                        {data.likesCount == 0 ? "" :
                            <div onClick={() => setLikes(true)} className='cursor-pointer text-sm p-1 rounded-full bg-blue-700 text-white'>
                                <AiFillLike color='white' />
                            </div>}
                    </div>
                    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                        <Modal.Backdrop>
                            <Modal.Container>
                                <Modal.Dialog className="sm:max-w-90">
                                    <Modal.CloseTrigger />
                                    <Modal.Header>
                                        <Modal.Heading>Edit your post</Modal.Heading>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <textarea value={body} onChange={(e) => setBody(e.target.value)} className='w-full dark:bg-black dark:text-white shadow-md dark:shadow-white/50 bg-slate-100 resize-none cursor-pointer p-2 rounded-2xl' placeholder="What's on your mind , ?">
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
                                        {likesData?.map((like) => <div key={like?._id || like?.id} className="flex mt-2 items-center gap-3">
                                            <Link to={`/profile/${like?._id || like?.id}`}>
                                                <div className="w-10 h-10">
                                                    <img className='rounded-full w-full h-full' src={like?.photo} alt={like?.name} />
                                                </div>
                                            </Link>
                                            <div>
                                                <Link to={`/profile/${like?._id || like?.id}`}>
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
                                                    Share this post with your friends and followers
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
                                                    <img className='rounded-full w-full h-full object-cover' src={data?.user?.photo} alt={data?.user?.name} />
                                                </div>
                                                <div>
                                                    <h3 className='font-medium text-sm text-[#060607] dark:text-[#FAF9F9]'>{data?.user?.name}</h3>
                                                    <span className='text-xs text-[#060607]/60 dark:text-[#FAF9F9]/60'>{dayjs(data?.createdAt).fromNow()}</span>
                                                </div>
                                            </div>

                                            {data?.body && (
                                                <p className="text-sm text-[#060607] dark:text-[#FAF9F9] mb-2">{data.body}</p>
                                            )}

                                            {data?.image && (
                                                <div className="w-full rounded-lg overflow-hidden mb-2">
                                                    <img className='w-full max-h-52 object-cover' src={data.image} alt={data.body} />
                                                </div>
                                            )}

                                            <div className="flex items-center gap-4 text-xs text-[#060607]/60 dark:text-[#FAF9F9]/60 pt-1">
                                                <span className="flex items-center gap-1">
                                                    <AiFillLike /> {data?.likesCount || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FaRegComment /> {data?.commentsCount || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <RiShareForwardLine /> {data?.sharesCount || 0}
                                                </span>
                                            </div>
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
                </div>
                {/* comments */}
                <div className="w-full lg:w-[30%] h-fit mt-3 lg:mt-0 p-3 dark:shadow-white/50  shadow-md">
                    <CreateComment id={id} />
                    {comments?.map((comment) => <Comment key={comment._id} comment={comment} postid={id} />)}
                </div>
            </div>

        </>
    )
}