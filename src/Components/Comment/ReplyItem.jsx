import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useContext, useState } from 'react'
import { AiFillLike, AiOutlineLike } from 'react-icons/ai'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Button, Dropdown, Label, Modal } from "@heroui/react";
import { BsThreeDots } from 'react-icons/bs'
import { MdDelete, MdModeEditOutline } from 'react-icons/md'
import { FaFileImage } from 'react-icons/fa'
import { BiLoaderCircle } from 'react-icons/bi'
import { EditComment } from '../../Api/EditCom.api'
import { Slide, toast } from 'react-toastify'
import { TokenContext } from '../../Context/TokenContext'
import { LikeComment } from '../../Api/LikeComment.api'
import { DeleteComment } from '../../Api/DeleteComment.api'


dayjs.extend(relativeTime)

export default function ReplyItem({ reply, postid, comment, commentid }) {
    const { myId } = useContext(TokenContext)
    const [isOpen, setIsOpen] = useState(false)
    const [content, setContent] = useState("")
    const [image, setImage] = useState(null)
    const queryClient = useQueryClient()
    const userId = reply?.commentCreator?._id

    const isLiked = reply?.likes?.some((like) => (like) === myId)
    const likesCount = reply?.likes?.length || 0

    const { mutate: likeMutate } = useMutation({
        mutationFn: () => LikeComment({ postid, commentid: reply?._id }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getCommentrep"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getComments"]
            })
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'Something went wrong', {
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

    const { mutate: deleteMutate } = useMutation({
        mutationFn: () => DeleteComment({ postid, commentid: reply?._id }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getCommentrep"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getComments"]
            })
            queryClient.invalidateQueries({
                queryKey: ["GetPosts"]
            })
            toast.success('Reply have Been Deleted successfully', {
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
            toast.error(error?.response?.data?.message || 'Failed to delete reply', {
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


    // ===== Edit reply =====
    function openEdit() {
        setIsOpen(true)
        setContent(reply?.content || "")
        setImage(null)
    }

    const { mutate: editMutate, isPending: editPending } = useMutation({
        mutationFn: (formData) => EditComment({ postid, commentid: reply?._id }, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["getCommentrep"]
            })
            queryClient.invalidateQueries({
                queryKey: ["getComments"]
            })
            setIsOpen(false)
            toast.success('Reply have Been Updated successfully', {
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
            toast.error(error?.response?.data?.errors || 'Failed to update reply', {
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
        editMutate(formData)
    }

    return (
        <>
            <div className="dark:bg-black dark:text-white dark:shadow-white/50 bg-white p-2 rounded-xl shadow-2xs">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <Link to={`/profile/${reply?.commentCreator?._id}`}>
                            <img
                                src={reply?.commentCreator?.photo}
                                alt={reply?.commentCreator?.name}
                                className="w-7 h-7 rounded-full object-cover"
                            />
                        </Link>
                        <div>
                            <Link to={`/profile/${reply?.commentCreator?._id}`}>
                                <h3 className='font-semibold text-black dark:text-white text-sm hover:underline'>{reply?.commentCreator?.name}</h3>
                            </Link>
                            <span className='text-xs text-gray-400'>{dayjs(reply?.createdAt).fromNow()}</span>
                        </div>
                    </div>

                    {/* delete reply */}
                    {myId === userId && (
                        <div className="cursor-pointer shrink-0">
                            <Dropdown>
                                <Button className='py-1 px-2 bg-transparent hover:bg-gray-100 dark:hover:bg-white/20 text-black dark:text-white' aria-label="Menu" variant="secondary">
                                    <BsThreeDots />
                                </Button>
                                <Dropdown.Popover className={'mr-13'}>
                                    <Dropdown.Menu>
                                        <Dropdown.Item onAction={() => openEdit()} className='dark:text-[#FAF9F9] text-black flex items-center justify-between gap-3' id="edit-reply" textValue="Edit reply">
                                            <span className="text-lg dark:text-[#FAF9F9] text-black"><MdModeEditOutline /></span>
                                            <Label>Edit Reply</Label>
                                        </Dropdown.Item>
                                        <Dropdown.Item onAction={() => deleteMutate()} className='dark:text-[#FAF9F9] text-black flex items-center justify-between gap-3' id="delete-reply" textValue="Delete reply" variant="danger">
                                            <span className="text-lg text-black dark:text-[#FAF9F9]"><MdDelete /></span>
                                            <Label className='text-black dark:text-[#FAF9F9]'>Delete Reply</Label>
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown.Popover>
                            </Dropdown>
                        </div>
                    )}
                </div>

                <div className='w-full'>
                    <p className="dark:text-white text-sm text-gray-800 mt-0.5 font-semibold">
                        {comment?.commentCreator?._id !== reply?.commentCreator?._id && (
                            <Link to={`/profile/${comment?.commentCreator?._id}`} className='text-blue-700 hover:underline'>
                                {comment?.commentCreator?.name}
                            </Link>
                        )} {reply?.content}
                    </p>
                    {reply.image && (
                        <div className="w-full flex items-center justify-center mt-2">
                            <img src={reply.image} className='rounded-lg max-h-40 object-cover' alt={reply.content} />
                        </div>
                    )}
                </div>

                {/* like */}
                <div className="flex gap-4 mt-1.5 items-center text-xs">
                    <div onClick={() => likeMutate()} className="flex items-center gap-1 text-gray-500 dark:text-white cursor-pointer hover:underline">
                        {isLiked ? <AiFillLike className='dark:text-white text-black' /> : <AiOutlineLike />}
                        {likesCount !== 0 && <span>{likesCount}</span>}
                    </div>
                </div>



                {/* ===== Edit Reply Modal ===== */}
                <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                    <Modal.Backdrop>
                        <Modal.Container>
                            <Modal.Dialog className="sm:max-w-90 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9]">
                                <Modal.CloseTrigger />
                                <Modal.Header>
                                    <Modal.Heading className="text-[#060607] dark:text-[#FAF9F9]">Edit your Reply</Modal.Heading>
                                </Modal.Header>
                                <Modal.Body>
                                    <textarea value={content} onChange={(e) => setContent(e.target.value)} className='w-full shadow-md dark:shadow-white/50 bg-[#060607]/10 dark:bg-[#FAF9F9]/10 text-[#060607] dark:text-[#FAF9F9] resize-none cursor-pointer p-2 rounded-2xl' placeholder="Edit your reply...">
                                    </textarea>
                                </Modal.Body>
                                <Modal.Footer>
                                    <button className="bg-[#FAF9F9] flex justify-center w-[50%] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden">
                                        <span className="relative z-20 text-sm md:tex-lg font-bold">
                                            <label htmlFor="imageReply" className='flex gap-1 cursor-pointer items-center'><FaFileImage />Choose img</label>
                                            <input onChange={(e) => setImage(e.target.files[0])} id='imageReply' type="file" hidden />
                                        </span>
                                        <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                                        <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                                        <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                                        <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                                        <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                                    </button>

                                    <button onClick={() => handelUpdate()} disabled={editPending} className="w-[50%] bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-3 text-center font-barlow text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden">
                                        <span className="relative flex justify-center z-20 text-sm md:tex-lg font-bold">
                                            {editPending ? <BiLoaderCircle className='animate-spin' /> : "Edit Reply"}
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
        </>
    )
}