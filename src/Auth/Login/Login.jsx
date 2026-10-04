import { useContext, useState } from 'react'
import {Input, Label } from "@heroui/react";
import { Button } from '@heroui/react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import ErrorMsg from '../../Components/ErrorMsg/ErrorMsg';
import axios from 'axios';
import { useNavigate, Link} from 'react-router-dom';
import { TokenContext } from '../../Context/TokenContext';
import Swal from 'sweetalert2';

export default function Login() {
  const [showpass, setShowpass] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setUserToken, setMyId } = useContext(TokenContext)

  ///////////////////////validation///////////////////////
  const schema = z.object({
    email: z.string().email("invalid mail"),
    password: z.string().regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, "password must be start with ....")
  })

  ///////////////////////form///////////////////////
  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(schema),
    mode: "all"
  })
  const { register, handleSubmit, formState, watch } = form
  const passValue = watch("password")

  ///////////////////////api///////////////////////

  async function submiting(values) {
    try {
      setLoading(true)
      const { data } = await axios.post(`https://route-posts.routemisr.com/users/signin`, values)
      setUserToken(data.data.token)
      localStorage.setItem('userToken', data.data.token)
      setMyId(data?.data?.user?._id)
      localStorage.setItem('MyId', data?.data?.user?._id)

      Swal.fire({
        title: "successfully",
        text: data.message,
        icon: "success",
        showConfirmButton: false,
        timer: 1500
      }).then(() => {
        navigate('/home')
      });

    } catch (error) {
      Swal.fire({
        title: "failed",
        text: error.response.data.message,
        icon: "error",
        confirmButtonText: 'ok'
      });
    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      <title>Log In</title>
      <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-slate-400 via-slate-500 to-black">
        <div className="relative">
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 rounded-lg bg-linear-to-r from-black via-slate-600 to-slate-800 shadow-lg animate-pulse" />
          <div id="form-container" className="bg-gray-200 p-10 rounded-lg shadow-2xl w-70 md:w-100 relative z-10 transform transition duration-500 ease-in-out">
            <h2 id="form-title" className="text-center text-3xl font-bold mb-10 text-gray-800">Login</h2>
            <form className='space-y-5' onSubmit={handleSubmit(submiting)}>

              {/* ///////////////////////////////email//////////////////////////// */}
              <div className="flex flex-col gap-1">
                <Label htmlFor="input-type-email" className='dark:text-black'>Email</Label>
                <Input {...register('email')} className="w-full h-12 border border-gray-800 px-3 rounded-lg  dark:bg-white" id="input-type-email" placeholder="jane@example.com" type="email" />
                <ErrorMsg error={formState.errors.email} />
              </div>

              {/* ///////////////////////////////pass//////////////////////////// */}
              <div className="flex flex-col gap-1 relative">
                {passValue && <span onClick={() => setShowpass(!showpass)} className='absolute right-3 top-8.5 cursor-pointer'>{showpass ? <FaEye /> : <FaEyeSlash />}</span>}
                <Label htmlFor="input-type-password" className='dark:text-black'>Password</Label>
                <Input {...register('password')} className="dark:bg-white w-full h-12 border border-gray-800 px-3 rounded-lg" id="input-type-password" placeholder="••••••••" type={showpass ? "text" : "password"} />
                <ErrorMsg error={formState.errors.password} />
                <a className="text-red-500 hover:text-red-800 text-sm" href="">Forgot Password?</a>
              </div>
              <div>
                <Button isDisabled={loading} type='submit' className="w-full h-12 px-8 z-30 py-3 bg-gray-500 rounded-xl text-white relative font-semibold after:-z-20 after:absolute after:h-1 after:w-1 after:bg-red-800 after:left-5 overflow-hidden after:bottom-0 after:translate-y-full after:rounded-md after:hover:scale-[300] after:hover:transition-all after:hover:duration-700 after:transition-all after:duration-700 transition-all duration-700 [text-shadow:3px_5px_2px_#be123c;] hover:[text-shadow:2px_2px_2px_#ddd] text-2xl">{loading ? <FaSpinner className='animate-spin' /> : "Login"}</Button>
                <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
              </div>
              <span className='mt-2 text-black text-sm md:text-lg flex flex-wrap justify-center'>If u don't have an account <Link to={'/'} className='text-black font-bold text-sm md:text-lg ml-1'>Register now</Link></span>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
