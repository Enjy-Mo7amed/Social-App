import React from 'react'
import { InputGroup, TextField } from "@heroui/react";
import { RiSendInsFill } from 'react-icons/ri';
import { MdOutlinePhotoCamera } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CommentCreate } from '../../Api/CommentCreate.api';
import { FaSpinner } from 'react-icons/fa';


export default function CreateComment({ id }) {
    const queryClient = useQueryClient()
    const form = useForm({
        defaultValues: {
            content: '',
            image: ''
        }
    })
    const { register, handleSubmit, reset } = form

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
        },
        onError: (err) => {
            // console.log("Comment Error:", err?.response?.data || err.message)
            toast.error(err?.response?.data?.message || "Failed to add comment")
        }
    })

    function handelComment(values) {
        if (!values.content && !values.image?.[0]) return
        // console.log(values);
        const formData = new FormData()

        if (values.content) {
            formData.append('content', values.content)
        }

        if (values.image[0]) {
            formData.append('image', values.image[0])
        }
        mutate(formData)
    }

    return (
        <>
            <form onSubmit={handleSubmit(handelComment)}>
                <TextField className="w-full mt-3 " name='text' aria-label='comment'>
                    <InputGroup>
                        <InputGroup.Input {...register('content')} className="w-full " placeholder="Comment as " />
                        <InputGroup.Suffix>
                            <label className='cursor-pointer mr-2' htmlFor="imageIcon"><MdOutlinePhotoCamera className='size-5' /></label>
                            <input {...register('image')} type="file" id='imageIcon' hidden />
                            <button type='submit' disabled={isPending} className={isPending ? "cursor-not-allowed" : "cursor-pointer"}>
                                {isPending ? <FaSpinner className='animate-spin' /> : <RiSendInsFill className='size-4 cursor-pointer' />}
                            </button>
                        </InputGroup.Suffix>
                    </InputGroup>
                </TextField>
            </form>
        </>
    )
}
