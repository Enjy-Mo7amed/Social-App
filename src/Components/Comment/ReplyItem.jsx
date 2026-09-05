import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import React, { useState } from 'react'
import { AiOutlineLike } from 'react-icons/ai'
import { BiDislike } from 'react-icons/bi'
import CreateReply from '../CreateReply/CreateReply'
import { Link } from 'react-router-dom'

export default function ReplyItem({ reply, postid, commentid, comment }) {
    dayjs.extend(relativeTime)
    return (
        <>
            <div className="dark:bg-black dark:text-white  dark:shadow-white/50 bg-white p-2 rounded-xl shadow-2xs">
                <div className="flex items-center gap-2">
                    <Link to={`/profile/${reply?.commentCreator?._id}`}>
                        <img
                            src={reply?.commentCreator?.photo}
                            alt={reply?.commentCreator?.name}
                            className="w-7 h-7 rounded-full object-cover"
                        />
                    </Link>
                    <div className="">
                        <Link to={`/profile/${reply?.commentCreator?._id}`}>
                            <h3 className='font-semibold text-black dark:text-white text-sm hover:underline'>{reply?.commentCreator?.name}</h3>
                        </Link>
                        <span className='text-xs text-gray-400'>{dayjs(reply?.createdAt).fromNow()}</span>
                    </div>
                </div>
                <div className='w-full'>
                    <p className="dark:text-white text-sm text-gray-800 mt-0.5 font-semibold"><Link to={`/profile/${comment?.commentCreator?._id}`} className='text-blue-700 hover:underline'>{comment?.commentCreator?.name}</Link> {reply?.content}</p>
                    {reply.image && (
                        <div className="w-full flex items-center justify-center mt-2">
                            <img src={reply.image} className='rounded-lg max-h-40 object-cover' alt={reply.content} />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
