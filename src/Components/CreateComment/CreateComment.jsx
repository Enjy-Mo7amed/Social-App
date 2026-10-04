import { InputGroup, TextField } from "@heroui/react";
import { RiSendInsFill } from 'react-icons/ri';
import { MdOutlinePhotoCamera } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentCreate } from '../../Api/CommentCreate.api';
import { FaSpinner } from 'react-icons/fa';
import { Slide, toast } from 'react-toastify';
import { IoCloseSharp } from 'react-icons/io5';

export default function CreateComment({ id }) {
    const queryClient = useQueryClient()
    const uniqueInputId = `comment-image-${id}`

    const form = useForm({
        defaultValues: {
            content: '',
            image: null
        }
    })
    
    const { register, handleSubmit, reset, watch, setValue } = form

    const selectedImage = watch('image')
    const previewUrl = selectedImage && selectedImage[0] ? URL.createObjectURL(selectedImage[0]) : null

    const { isPending, mutate } = useMutation({
        mutationFn: (formData) => CommentCreate({ id }, formData),
        onSuccess: () => {
            reset()
            queryClient.invalidateQueries({
                queryKey: ['getDetails']
            })
            queryClient.invalidateQueries({
                queryKey: ['getComments']
            })
            queryClient.invalidateQueries({
                queryKey: ['GetPosts']
            })
            toast.success('Comment Added Successfully', {
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
        },
        onError: (err) => {
            toast.error(err?.response?.data?.message || "Failed to add comment", {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
                transition: Slide,
            })
        }
    })

    function handelComment(values) {
        const file = values.image?.[0] || values.image
        if (!values.content && !file) return

        const formData = new FormData()

        if (values.content) {
            formData.append('content', values.content)
        }

        if (file) {
            formData.append('image', file)
        }
        mutate(formData)
    }

    const removeImage = () => {
        setValue('image', null)
    }

    return (
        <div className="w-full mt-3">
            {previewUrl && (
                <div className="relative inline-block mb-2">
                    <img 
                        src={previewUrl} 
                        alt="Comment Preview" 
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-700" 
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition cursor-pointer"
                    >
                        <IoCloseSharp className="size-4" />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit(handelComment)}>
                <TextField className="w-full" name='text' aria-label='comment'>
                    <InputGroup>
                        <InputGroup.Input 
                            {...register('content')} 
                            className="w-full dark:text-white" 
                            placeholder="Write a comment..." 
                        />
                        <InputGroup.Suffix>
                            <label className='cursor-pointer mr-2 text-gray-600 dark:text-gray-300 hover:text-blue-500' htmlFor={uniqueInputId}>
                                <MdOutlinePhotoCamera className='size-5' />
                            </label>
                            <input 
                                {...register('image')} 
                                type="file" 
                                accept="image/*"
                                id={uniqueInputId} 
                                hidden 
                            />
                            <button 
                                type='submit' 
                                disabled={isPending} 
                                className={isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer text-blue-600 dark:text-blue-400"}
                            >
                                {isPending ? <FaSpinner className='animate-spin size-4' /> : <RiSendInsFill className='size-4' />}
                            </button>
                        </InputGroup.Suffix>
                    </InputGroup>
                </TextField>
            </form>
        </div>
    )
}