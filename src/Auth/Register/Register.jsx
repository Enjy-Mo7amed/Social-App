import { useState } from 'react'
import {Input, Label } from "@heroui/react";
import { Button } from '@heroui/react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import ErrorMsg from '../../Components/ErrorMsg/ErrorMsg';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Register() {
  const [showpass, setShowpass] = useState(false)
  const [showrePass, setShowrePass] = useState(false)

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()


  ///////////////////////validation///////////////////////
  const schema = z.object({
    name: z.string().min(3, "name must be at least 3 chars").max(15, "name must be at most 15 chars"),
    username: z.string().min(3, "name must be at least 3 chars").max(15, "name must be at most 15 chars").trim(),
    email: z.string().email("invalid mail"),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "invalid date").refine((date) => {
      const userDate = new Date(date)
      const nowDate = new Date()
      nowDate.setHours(0, 0, 0, 0)
      return userDate < nowDate
    }, "cant enter future date"),
    gender: z.enum(["male", "female"], "gender must be one of male or female"),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password must be start with ...."),
    rePassword: z.string()
  }).refine((object) => object.password === object.rePassword, {
    error: "password and repassword must be matchs",
    path: ['rePassword']
  })

  ///////////////////////form///////////////////////
  const form = useForm({
    defaultValues: {
      name: "",
      username: "",
      email: "",
      dateOfBirth: "",
      gender: "choose a gender",
      password: "",
      rePassword: "",
    },
    resolver: zodResolver(schema),
    mode: "all"
  })
  const { register, handleSubmit, formState, watch } = form
  const passValue = watch("password")
  const repassValue = watch("rePassword")

  ///////////////////////api///////////////////////
  async function submiting(values) {
    try {
      setLoading(true)
      let { data } = await axios.post(`https://route-posts.routemisr.com/users/signup`, values)

      Swal.fire({
        title: "successfully",
        text: data.message,
        icon: "success",
      }).then((result) => {
        if (result.isConfirmed) {
            navigate('/login')
        }
      });

    } catch (error) {
      Swal.fire({
        title: "failed",
        text: error.response.data.message,
        icon: "error",
      });
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <title>Register</title>
      <div className="min-h-screen py-10 flex items-center justify-center bg-linear-to-r from-slate-400 via-slate-500 to-black">
        <div className="relative  w-[95%] sm:w-[60%] md:w-[40%]">
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg bg-linear-to-r from-black via-slate-600 to-slate-800 shadow-lg animate-pulse" />
          <div id="form-container" className=" bg-gray-200 p-2.5 md:p-7  rounded-lg shadow-2xl relative z-10 transform transition duration-500 ease-in-out">
            <h2 id="form-title" className="text-center text-3xl font-bold mb-10 text-gray-800">Signup</h2>
            <form className='space-y-5' onSubmit={handleSubmit(submiting)}>
              <div className="flex w-full flex-col gap-4">

                {/* ///////////////////////////////name//////////////////////////// */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="input-type-name" className='dark:text-black'>Name</Label>
                  <Input {...register('name')} className="dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-name" placeholder="Enter your name" type="text" />
                  <ErrorMsg error={formState.errors.name} />
                </div>

                {/* ///////////////////////////////username//////////////////////////// */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="input-type-username" className='dark:text-black'>UserName</Label>
                  <Input  {...register('username')} className="dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-username" placeholder="Enter your username" type="text" />
                  <ErrorMsg error={formState.errors.username} />

                </div>

                {/* ///////////////////////////////email//////////////////////////// */}
                <div className="flex flex-col gap-1">
                  <Label htmlFor="input-type-email" className='dark:text-black'>Email</Label>
                  <Input {...register('email')} className="dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-email" placeholder="jane@example.com" type="email" />
                  <ErrorMsg error={formState.errors.email} />
                </div>

                {/* ///////////////////////////////date//////////////////////////// */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="input-type-date" className='dark:text-black'>Date of Birth</Label>
                    <Input {...register('dateOfBirth')} className="dark:bg-white placeholder:text-gray-500 w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-date" placeholder="Date of Birth" type="date" />
                    <ErrorMsg error={formState.errors.dateOfBirth} />
                  </div>

                {/* ///////////////////////////////gender//////////////////////////// */}
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="input-type-Gender" className='dark:text-black'>Gender</Label>
                    <select {...register('gender')} className='dark:bg-white text-black w-full h-12 border border-gray-800 px-3 rounded-lg bg-white p-1.5' id="input-type-Gender">
                      <option className='text-black' disabled value="choose a gender"><span className='text-black '>choose a gender</span></option>
                      <option className='' value="male">male</option>
                      <option value="female">female</option>
                    </select>
                    <ErrorMsg error={formState.errors.gender} />
                  </div>

                {/* ///////////////////////////////pass//////////////////////////// */}
                <div className="flex flex-col gap-1 relative">
                  {passValue && <span onClick={() => setShowpass(!showpass)} className='absolute right-3 top-8.5 cursor-pointer'>{showpass ? <FaEye /> : <FaEyeSlash />}</span>}
                  <Label htmlFor="input-type-password" className='dark:text-black'>Password</Label>
                  <Input {...register('password')} className="dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-password" placeholder="••••••••" type={showpass ? "text" : "password"} />
                  <ErrorMsg error={formState.errors.password} />
                </div>

                {/* ///////////////////////////////repass//////////////////////////// */}
                <div className="flex flex-col gap-1 relative">
                  {repassValue && <span onClick={() => setShowrePass(!showrePass)} className='absolute right-3 top-7.5 cursor-pointer'>{showrePass ? <FaEye /> : <FaEyeSlash />}</span>}
                  <Label htmlFor="input-type-RePassword" className='dark:text-black'>RePassword</Label>
                  <Input {...register('rePassword')} className="dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-RePassword" placeholder="••••••••" type={showrePass ? "text" : "password"} />
                  <ErrorMsg error={formState.errors.rePassword} />
                </div>
                <div>
                  <Button isDisabled={loading} type='submit' className=" w-full h-12 px-8 z-30 py-3 bg-gray-500 rounded-xl text-white relative font-semibold after:-z-20 after:absolute after:h-1 after:w-1 after:bg-red-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#be123c;] hover:[text-shadow:2px_2px_2px_#ddd] text-2xl">{loading ? <FaSpinner className='animate-spin' /> : "Submit"}</Button>
                  <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                </div>
                <span className='mt-1 text-black'>If u have an account <Link to={'/login'} className='text-black font-bold'>Login now</Link>
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
