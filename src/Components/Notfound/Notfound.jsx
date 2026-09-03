import React from 'react'
import { Link } from 'react-router-dom';

export default function Notfound() {
    return (
        <>
            <title>NotFounf Page</title>
            <div
                className="relative py-10 font-[Tajawal] min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#0d0906] text-white">

                <div className="absolute  inset-0 bg-[linear-gradient(rgba(38,38,38,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(38,38,38,0.5)_1px,transparent_1px)] bg-size-[60px_60px]"></div>
                <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>

                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)",
                    }}
                />

                <div className="relative z-10 flex flex-col items-center px-6 text-center max-w-xl">
                    <h1
                        className="font-black leading-none select-none"
                        style={{
                            fontSize: "clamp(5rem, 14vw, 8.5rem)",
                            background: "linear-gradient(180deg, #ffb238 0%, #f5750a 100%)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                            filter: "drop-shadow(0 0 30px rgba(245, 117, 10, 0.25))",
                        }}
                    >
                        404
                    </h1>


                    <div className="relative my-8 h-28 w-28 flex items-center justify-center ">
                        <div
                            className="absolute inset-0 rounded-full border border-orange-500"
                            style={{
                                background:
                                    "radial-gradient(circle at 35% 30%, rgba(245,117,10,0.35), rgba(60,30,10,0.4) 70%)",
                            }}
                        />

                        <i className="fa-regular fa-frown text-5xl text-[#f5750a]" />

                        <span className="absolute -top-2 -right-3 h-5 w-5 rounded-lg rotate-12 bg-[#FF6900] animate-bounce" />
                        <span className="absolute bottom-2 -left-4 h-4 w-4 rounded-full bg-[#c98a2b] animate-pulse" />
                    </div>

                    <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                        عفواً! الصفحة غير موجودة
                    </h2>

                    <p className="mb-8 leading-relaxed text-white/60 sm:text-base">
                        الصفحة التي تبحث عنها غير موجودة أو تم نقلها. دعنا نعيدك إلى
                        المسار الصحيح.
                    </p>

                    <div className="mb-10 flex flex-wrap items-center justify-center gap-4">
                        <Link 
                            className="flex items-center gap-2 bg-linear-to-r from-[#F76F14] to-[#EC5B0D] rounded-full px-6 py-4  font-bold text-white shadow-lg transition hover:-translate-y-0.5 duration-300"
                        >
                            <i className="fa-solid fa-house" />
                            الذهاب للرئيسية
                        </Link>

                        <Link className="flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-4  font-medium text-white  hover:bg-[#2A180B] hover:text-orange-500 hover:border-orange-500 transition-all duration-300">
                            <i className="fa-solid fa-newspaper " />
                            تصفح المقالات
                        </Link>
                    </div>

                    <div className="w-full border-t border-white/10 pt-6">
                        <p className="mb-3 text-xs text-white/40">قد تجد هذه مفيدة:</p>
                        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-white/60">
                            <Link className="hover:text-[#f5750a] transition">
                                الخصوصية
                            </Link>
                            <span className="text-white/20">·</span>
                            <Link  className="hover:text-[#f5750a] transition">
                                من نحن
                            </Link>
                            <span className="text-white/20">·</span>
                            <Link className="hover:text-[#f5750a] transition">
                                المدونة
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}