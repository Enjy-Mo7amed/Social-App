import React, { useState } from 'react'
import { Input, Label } from "@heroui/react";
import { Button } from '@heroui/react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import ErrorMsg from '../../Components/ErrorMsg/ErrorMsg';
import { useMutation } from '@tanstack/react-query';
import { ChangePassword } from '../../Api/ChangePass.api';
import { Slide, toast } from 'react-toastify';


export default function Changepass() {
    const [showpass, setShowpass] = useState(false)
    const [showNewPass, setShowNewPass] = useState(false)

    ///////////////////////validation///////////////////////
    const schema = z.object({
        password: z.string().min(1, "current password is required"),
        newPassword: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password must be start with ....")
    }).refine((data) => data.password !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"]
    })

    ///////////////////////form///////////////////////
    const form = useForm({
        defaultValues: {
            password: "",
            newPassword: ""
        },
        resolver: zodResolver(schema),
        mode: "all"
    })
    let { register, handleSubmit, formState, watch, reset } = form
    const passValue = watch("password")
    const newPassValue = watch("newPassword")


    const { mutate, isPending } = useMutation({
        mutationFn: (values) => ChangePassword(values),
        onSuccess: () => {
            toast.success('pass have Been changed successfully 👍', {
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
            reset()
        },
        onError: (error) => {
            toast.error(error?.response?.data?.message || 'incorrect password', {
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
    function handelChangepass(values) {
        mutate(values)
    }

    return (
        <>
            <div className="flex py-[128.5px] items-center justify-center bg-linear-to-r from-slate-400 via-slate-500 to-black">
                <div className="relative">
                    <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg bg-linear-to-r from-black via-slate-600 to-slate-800 shadow-lg animate-pulse" />
                    <div id="form-container" className="bg-gray-200 p-5 md:p-10 rounded-lg shadow-2xl w-70 md:w-100 relative z-10 transform transition duration-500 ease-in-out">
                        <h2 id="form-title" className="text-center text-3xl font-bold mb-10 text-gray-800">Change Password</h2>
                        <form className='space-y-5' onSubmit={handleSubmit(handelChangepass)}>
                            <div className="flex w-full  flex-col gap-4">

                                {/* ///////////////////////////////pass//////////////////////////// */}
                                <div className="flex flex-col gap-1 relative">
                                    {passValue && <span onClick={() => setShowpass(!showpass)} className='absolute right-3 top-8.5 cursor-pointer'>{showpass ? <FaEye /> : <FaEyeSlash />}</span>}
                                    <Label htmlFor="input-type-password" className='dark:text-black'>Password</Label>
                                    <Input {...register('password')} className=" dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-password" placeholder="••••••••" type={showpass ? "text" : "password"} />
                                    <ErrorMsg error={formState.errors.password} />
                                </div>

                                {/* ///////////////////////////////new pass//////////////////////////// */}
                                <div className="flex flex-col gap-1 relative">
                                    {newPassValue && <span onClick={() => setShowNewPass(!showNewPass)} className='absolute right-3 top-8.5 cursor-pointer'>{showNewPass ? <FaEye /> : <FaEyeSlash />}</span>}
                                    <Label htmlFor="input-type-newpassword" className='dark:text-black'>New Password</Label>
                                    <Input {...register('newPassword')} className=" dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-newpassword" placeholder="••••••••" type={showNewPass ? "text" : "password"} />
                                    <ErrorMsg error={formState.errors.newPassword} />
                                </div>
                                <div>
                                    <Button isDisabled={isPending} type='submit' className="w-full h-12 px-8 z-30 py-3 bg-gray-500 rounded-xl text-white relative font-semibold after:-z-20 after:absolute after:h-1 after:w-1 after:bg-red-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#be123c;] hover:[text-shadow:2px_2px_2px_#ddd] text-2xl">{isPending ? <FaSpinner className='animate-spin' /> : "submit"}</Button>
                                    <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />

                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
