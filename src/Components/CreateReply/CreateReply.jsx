import React, { useEffect } from 'react'
import { InputGroup, TextField } from "@heroui/react";
import { RiSendInsFill } from 'react-icons/ri';
import { MdOutlinePhotoCamera } from 'react-icons/md';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FaSpinner } from 'react-icons/fa';
import { Createreply } from '../../Api/CreateReply.api';
import { Slide, toast } from 'react-toastify';

export default function CreateReply({ postid, commentid, onSuccessReply }) {
  const queryClient = useQueryClient()
  const form = useForm({
    defaultValues: {
      content: '',
      image: ''
    }
  })
  const { register, handleSubmit, reset } = form

  const { isPending, mutate } = useMutation({
    mutationFn: (formData) => Createreply({ postid, commentid }, formData),
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({
        queryKey: ['getDetails']
      })

      queryClient.invalidateQueries({
        queryKey: ['getCommentrep', postid, commentid]
      })
      if (onSuccessReply) {
        onSuccessReply()
      }
      toast.success('Reply Added Successfuly', {
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
    onError: (err) => {
      console.log(err?.response?.data)
      toast.error(err?.response?.data?.message, {
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

  function handelReply(values) {
    if (!values.content && !values.image?.[0]) return
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
      <form onSubmit={handleSubmit(handelReply)}>
        <TextField className="w-full mt-2" name='text' aria-label='reply'>
          <InputGroup>
            <InputGroup.Input {...register('content')} className="w-full " placeholder="Write a reply..." />
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
