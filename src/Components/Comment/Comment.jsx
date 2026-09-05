import dayjs from 'dayjs'
import React, { useContext, useState } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'
import { getCommentrep } from '../../Api/GetCommentRep.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BiDislike, BiLoaderCircle, BiSolidDislike } from 'react-icons/bi'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import CreateReply from '../CreateReply/CreateReply'
import ReplyItem from './ReplyItem'
import { Link } from 'react-router-dom'
import { Button, Dropdown, Label, Modal } from "@heroui/react";
import { BsThreeDots } from 'react-icons/bs'
import { MdDelete, MdModeEditOutline } from 'react-icons/md'
import { DeleteComment } from '../../Api/DeleteComment.api'
import { Slide, toast } from 'react-toastify'
import { EditComment } from '../../Api/EditCom.api'
import { FaFileImage } from 'react-icons/fa'
import { TokenContext } from '../../Context/TokenContext'
import { LikeComment } from '../../Api/LikeComment.api'



export default function Comment({ comment, postid }) {
    dayjs.extend(relativeTime)
    const [showReplies, setShowReplies] = useState(false)
    const [showrep, setShowrep] = useState(false)
    const { myId } = useContext(TokenContext)
    const userId = comment?.commentCreator?._id
    const [content, setContent] = useState("")
    const [image, setImage] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const queryClient = useQueryClient()



    const { data: replies, isLoading } = useQuery({
        queryKey: ["getCommentrep", postid, comment._id],
        queryFn: () => getCommentrep({ postid, commentid: comment?._id }),
        select: (replies) => replies?.data?.data?.replies,
        enabled: !!comment?._id && !!postid
    })
    // console.log(replies);

    // delete mutation
    const { mutate: DeleteMutate } = useMutation({
        mutationFn: () => DeleteComment({ postid, commentid: comment?._id }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getCommentrep"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getComments"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getmyposts"]
            })
            queryClient.invalidateQueries({
                queryKey: ["GetPosts"]
            })
            toast.success('Comment have Been Deleted successfully', {
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


    // Update mutation
    function editComment() {
        setIsOpen(true)
        setContent(comment?.content || "")
        setImage(null)
    }

    const { mutate: EditMutate, isPending } = useMutation({
        mutationFn: (formData) => EditComment({ postid, commentid: comment?._id }, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['getCommentrep']
            })
            queryClient.invalidateQueries({
                queryKey: ["getComments"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getmyposts"]
            })
            queryClient.invalidateQueries({
                queryKey: ["GetPosts"]
            })
            setIsOpen(false)
            toast.success('Comment have Been Updated successfully', {
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
        formData.append('content', content)
        if (image) {
            formData.append('image', image)
        }
        EditMutate(formData)
    }

    //like and unlike 
    const {  mutate } = useMutation({
        mutationFn: () => LikeComment({ postid, commentid: comment?._id }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getComments"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getmyposts"]
            })
            queryClient.invalidateQueries({
                queryKey: ["GetPosts"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getDetails"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getCommentrep"]
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
    // console.log(data?.data?.data?.liked);
const isLiked = comment?.likes?.some((like) => (like?._id || like?.id) === myId)
const likesCount = comment?.likes?.length || 0    

    return (
        <>
            <div className=" my-3 bg-[#FAF9F9] dark:bg-[#060607] lg:my-0 lg:mb-3 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                    <Link to={`/profile/${comment?.commentCreator?._id}`}>
                        <div className="rounded-full w-9 h-9 overflow-hidden shrink-0">
                            <img
                                src={comment.commentCreator.photo}
                                alt={comment.commentCreator.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                    <div className="w-full ">
                        <div className=" p-2.5 rounded-2xl shadow-md  dark:shadow-white/50 bg-[#FAF9F9] dark:bg-[#060607]">
                            <div className="flex items-center justify-between">
                                <div className="">
                                    <Link to={`/profile/${comment?.commentCreator?._id}`}>
                                        <h3 className='font-semibold text-sm text-black dark:text-white hover:underline'>{comment.commentCreator.name}</h3>
                                    </Link>
                                    <span className='text-xs text-gray-500'>{dayjs(comment.createdAt).fromNow()}</span>
                                </div>
                                {myId === userId && <>
                                    <div className="cursor-pointer">
                                        <Dropdown>
                                            <Button className='py-1 px-3.5  dark:hover:bg-white/20 dark:hover:text-black bg-transparent hover:bg-gray-100 text-black dark:text-white' aria-label="Menu" variant="secondary">
                                                <BsThreeDots />
                                            </Button>
                                            <Dropdown.Popover className={' mr-13'}>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item onAction={() => editComment()} className='dark:text-[#FAF9F9] text-black flex items-center justify-between gap-3' id="edit-file" textValue="Edit file">
                                                        <span className="text-lg dark:text-[#FAF9F9] text-black"><MdModeEditOutline /></span>
                                                        <Label>Edit Comment</Label>
                                                    </Dropdown.Item>
                                                    <Dropdown.Item onAction={() => DeleteMutate()} className='dark:text-[#FAF9F9] text-black flex items-center justify-between gap-3' id="delete-file" textValue="Delete file" variant="danger">
                                                        <span className="text-lg text-black dark:text-[#FAF9F9]"><MdDelete /></span>
                                                        <Label className=' text-black dark:text-[#FAF9F9]'>Delete Comment</Label>
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown.Popover>
                                        </Dropdown>
                                    </div>
                                </>}
                            </div>
                            <div className="">
                                <p className="text-sm text-gray-800 dark:text-white mt-0.5">{comment?.content}</p>
                                {comment.image && (
                                    <div className="w-full flex items-center justify-center mt-2">
                                        <img src={comment.image} className='rounded-lg max-h-40 object-cover' alt="" />
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 mt-3 items-center">
                                <div onClick={() => mutate()} className="flex items-center mt-2 text-gray-500 dark:text-white mr-3 cursor-pointer">
                                    { isLiked ? <AiFillLike /> : <AiOutlineLike />}
                                    {likesCount  == 0 ? "" : likesCount}
                                </div>
                                <span onClick={() => setShowrep(!showrep)} className='text-gray-500  dark:text-white text-sm hover:underline cursor-pointer'>Reply</span>
                            </div>
                            {showrep && <CreateReply postid={postid} commentid={comment?._id} onSuccessReply={() => {
                                setShowrep(false)
                                setShowReplies(true)
                            }} />}
                        </div>
                        <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                            <Modal.Backdrop>
                                <Modal.Container>
                                    <Modal.Dialog className="sm:max-w-90">
                                        <Modal.CloseTrigger />
                                        <Modal.Header>
                                            <Modal.Heading>Edit your Comment</Modal.Heading>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <textarea value={content} onChange={(e) => setContent(e.target.value)} className='w-full dark:bg-black dark:text-white shadow-md dark:shadow-white/50 bg-slate-100 resize-none cursor-pointer p-2 rounded-2xl' placeholder="Edit your comment...">
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
                                                    {isPending ? <BiLoaderCircle className='animate-spin' /> : "Edit Comment"}
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

                        {replies?.length > 0 && <div className="mt-1 ml-2">
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-xs text-blue-600 font-medium hover:underline cursor-pointer"
                            >
                                {showReplies ? "Hide replies" : `View ${replies?.length} replies`}
                            </button>
                        </div>}

                        {showReplies && (
                            <div className="mt-2 ml- pl-4 border-l-2 border-gray-200 flex flex-col gap-2">
                                {isLoading ? (
                                    <BiLoaderCircle className="animate-spin text-gray-500 text-sm" />
                                ) : replies?.length > 0 && (
                                    replies.map((reply) => (
                                        <ReplyItem key={reply._id}
                                            reply={reply}
                                            postid={postid}
                                            commentid={comment?._id}
                                            comment={comment} />
                                    ))
                                )
                                }
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </>
    )
}
