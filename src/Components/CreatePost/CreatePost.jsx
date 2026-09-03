import { Avatar, Input } from '@heroui/react'
import React, { useRef, useState } from 'react'
import { Button, Modal } from "@heroui/react";
import { IoCloseSharp } from "react-icons/io5";
import { FaFileImage } from 'react-icons/fa';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatePostApi } from '../../Api/CreatePost.api';
import { Slide, toast } from 'react-toastify';
import { Link } from 'react-router-dom';


export default function CreatePost({ photo }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUploaded, setIsUploaded] = useState(false)
    const TextRef = useRef(null)
    const imgRef = useRef(null)
    const queryClient = useQueryClient()


    function handelImage(e) {
        const path = URL.createObjectURL(e.target.files[0])
        setIsUploaded(path)
    }

    function handelPost() {
        const formData = new FormData()
        if (TextRef?.current?.value) {
            formData.append('body', TextRef?.current?.value)
        }
        if (imgRef?.current?.files[0]) {
            formData.append('image', imgRef?.current?.files[0])
        }
        return formData
    }

    const { mutate } = useMutation({
        mutationFn: () => CreatePostApi(handelPost()),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ['GetPosts']
            })
            queryClient.invalidateQueries({
                queryKey: ['getmyposts']
            })
            toast.success('Post have been Created Successfully', {
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
            TextRef.current.value = ""
            imgRef.current.value = ""
        },
        onError: (error) => {
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

    return (
        <>
            <div className="flex items-center">
                <Link to={'/profile'}>
                    <div className="mr-3">
                        <Avatar>
                            <Avatar.Image src={photo} />
                        </Avatar>
                    </div>
                </Link>
                <div className="w-full">
                    <Input onClick={() => setIsOpen(true)} aria-label="Name" className="w-full cursor-pointer focus:ring-0 focus:outline-0" placeholder="What's on your mind, ?" readOnly />
                </div>

                {/* modaaaaaaaaaaaaaaaal */}

                <div className="">
                    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
                        <Modal.Backdrop>
                            <Modal.Container>
                                <Modal.Dialog className="sm:max-w-90">
                                    <Modal.CloseTrigger />
                                    <Modal.Header>
                                        <Modal.Heading>Create your post</Modal.Heading>
                                    </Modal.Header>
                                    <Modal.Body>
                                        <textarea ref={TextRef} className='w-full dark:bg-black dark:text-white shadow-md dark:shadow-white/50 bg-slate-100 resize-none cursor-pointer p-2 rounded-2xl' placeholder="What's on your mind , ?">
                                        </textarea>
                                        {isUploaded && <div className="relative">
                                            <img className='mt-2' src={isUploaded} alt="" />
                                            <div onClick={() => setIsUploaded(false)} className="p-0.5 bg-gray-400 rounded-full absolute top-1.5 right-1.5 cursor-pointer text-2xl text-white">
                                                <IoCloseSharp />
                                            </div>
                                        </div>}
                                    </Modal.Body>
                                    <Modal.Footer>
                                        <div className="w-[50%] font-semibold ">
                                            <label htmlFor="imagePost" className='flex gap-1 cursor-pointer items-center justify-center transition bg-slate-200 hover:bg-slate-300 rounded-full py-1.5'><FaFileImage />Choose img</label>
                                            <input ref={imgRef} onChange={handelImage} id='imagePost' type="file" hidden />
                                        </div>
                                        <Button onClick={() => mutate()} className="w-[50%]">
                                            Share Post
                                        </Button>
                                    </Modal.Footer>
                                </Modal.Dialog>
                            </Modal.Container>
                        </Modal.Backdrop>
                    </Modal>
                </div>
            </div>
        </>
    )
}
