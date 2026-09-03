import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'
import React, { useContext, useState } from 'react'
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

export default function PostDetails() {
    const queryClient = useQueryClient()
    dayjs.extend(relativeTime)
    const { id } = useParams()
    const { myId } = useContext(TokenContext)
    const [isOpen, setIsOpen] = useState(false)
    const [body, setBody] = useState("")
    const [image, setImage] = useState(null)

    // details query
    const { data, isError, isLoading, error } = useQuery({
        queryKey: ["getDetails", id],
        queryFn: () => getDetails({ id }),
        select: (data) => data?.data?.data?.post,
        enabled: !!id
    })
    // console.log(data);
    const userId = data?.user?._id



    // comment query
    const { data: comments, isLoading: commentLoader } = useQuery({
        queryKey: ["getComments", id],
        queryFn: () => getComments({ id }),
        select: (comments) => comments?.data?.data?.comments,
        enabled: !!id
    })
    // console.log(comments);


    // like and unlike mutate
    const { data: likesData, mutate, error: likeError } = useMutation({
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
        },
        onError: (error) => {
            console.log(error.message);

        }
    })

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
            console.log('Server error message:',)
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
    if (isLoading) {
        return <Loader />
    }
    if (isError) {
        return <Error apiError={error.message} />
    }

    return (
        <>
            <div className="lg:flex p-5 min-h-screen bg-[#FAF9F9] dark:bg-black ">
                {/* caaaaaard */}
                <div className="card bg-[#FAF9F9] dark:bg-[#060607] dark:shadow-white/50 h-fit mr-5  w-full lg:w-[70%]  shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link to={'/profile'}>
                                <div className=" w-10 h-10"><img className='rounded-full w-full h-full' src={data.user.photo} alt={data.user.name} /></div>
                            </Link>
                            <div className="">
                                <Link to={'/profile'}>
                                    <h3 className='font-medium dark:text-[#FAF9F9]'>{data.user.name}</h3>
                                </Link>
                                <span className='dark:text-[#FAF9F9]'>{dayjs(data.createdAt).fromNow()}</span>
                            </div>
                        </div>
                        <div className="cursor-pointer">
                            <Dropdown>
                                <Button className=' text-black dark:text-white' aria-label="Menu" variant="secondary">
                                    <BsThreeDots />
                                </Button>
                                <Dropdown.Popover>
                                    <Dropdown.Menu>
                                        <Dropdown.Item className='flex items-center justify-between gap-3' onAction={() => bookmarkMutate()} id="Save Post" textValue="Save Post">
                                            <div className="text-lg dark:text-[#FAF9F9]">
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
                    {data?.body && <h4 className="card-title dark:text-[#FAF9F9]">{data?.body}</h4>}
                    {data?.image && <figure>
                        <img
                            className='w-full'
                            src={data?.image}
                            alt={data?.body} />
                    </figure>}
                    <div className="dark:text-[#FAF9F9] flex justify-between items-center">
                        <div onClick={() => mutate()} className="flex items-center gap-1 hover:bg-gray-50 rounded-lg py-1 px-2 cursor-pointer transition">{likesData?.data?.data?.liked ? <AiFillLike /> : <AiOutlineLike />}
                            {data?.likesCount == 0 ? "" : <span>{data?.likesCount}</span>}
                        </div>
                        <div className="flex items-center gap-1 hover:bg-gray-50 rounded-lg py-1 px-2 cursor-pointer transition"><FaRegComment />
                            {data?.commentsCount == 0 ? "" : <span>{data?.commentsCount}</span>}
                        </div>
                        <div className="flex items-center gap-1 hover:bg-gray-50 rounded-lg py-1 px-2 cursor-pointer transition"><RiShareForwardLine />
                            {data?.sharesCount == 0 ? "" : <span>{data?.sharesCount}</span>}
                        </div>
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
                                        <div className="w-[50%] font-semibold ">
                                            <label htmlFor="imageCard" className='flex gap-1 cursor-pointer items-center justify-center transition bg-slate-200 hover:bg-slate-300 rounded-full py-1.5'><FaFileImage />Choose img</label>
                                            <input onChange={(e) => setImage(e.target.files[0])} id='imageCard' type="file" hidden />
                                        </div>
                                        <Button onClick={() => handelUpdate()} className="w-[50%]" slot="close">
                                            {EditPending ? <BiLoaderCircle className='animate-spin' /> : "Edit Post"}
                                        </Button>
                                    </Modal.Footer>
                                </Modal.Dialog>
                            </Modal.Container>
                        </Modal.Backdrop>
                    </Modal>
                </div>
                {/* comments */}
                <div className="w-full lg:w-[30%] lg:p-3 dark:shadow-white/50  shadow-md">
                    {comments?.map((comment) => <Comment key={comment._id} comment={comment} postid={id} />)}
                    <CreateComment id={id} />
                </div>
            </div>

        </>
    )
}
