import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSuggestion } from '../../Api/GetSuggest.api'
import { IoCloseOutline } from 'react-icons/io5';
import Loader from '../Loader/Loader';
import { PutFollow } from '../../Api/PutFollow.api'
import { Slide, toast } from 'react-toastify'
import { BiLoaderCircle } from 'react-icons/bi';

export default function RightSideBar() {
  const queryClient = useQueryClient()
  const [removedIds, setRemovedIds] = useState([])
  const [activeFollowId, setActiveFollowId] = useState(null)

  const { data, isLoading } = useQuery({
    queryKey: ['getFollowSuggest'],
    queryFn: () => getSuggestion(),
    select: (data) => data?.data?.data?.suggestions
  })

  const { isPending: followPending, mutate: followMutate } = useMutation({
    mutationFn: (userId) => PutFollow({ id: userId }),
    onMutate: (userId) => {
      setActiveFollowId(userId)
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({
        queryKey: ['getFollowSuggest']
      })
      queryClient.invalidateQueries({
        queryKey: ['getmyprofile']
      })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Failed to update follow status', {
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
    },
    onSettled: () => {
      setActiveFollowId(null)
    }
  })

  const displayedUsers = data
    ?.filter((user) => !removedIds.includes(user?._id))
    ?.slice(0, 9)

  function handelRemove(userId) {
    setRemovedIds((prev) => [...prev, userId])
  }

  return (
    <>
      {isLoading ? <Loader /> : <>
        <div className="dark:shadow-white/25 bg-[#FAF9F9] dark:bg-[#060607] p-5 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-[#060607] dark:text-[#FAF9F9]">Suggested followers</h2>
          </div>

          <div className="space-y-4">
            {displayedUsers?.map((user) => {
              const isCurrentLoading = followPending && activeFollowId === user?._id
              return (
                <div key={user?._id} className="flex items-center justify-between gap-3">
                  <Link to={`/profile/${user?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <img
                      src={user?.photo}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="truncate">
                      <h3 className="text-sm font-medium truncate text-[#060607] dark:text-[#FAF9F9]">
                        {user?.name}
                      </h3>
                      <p className="text-xs truncate text-[#060607]/70 dark:text-[#FAF9F9]/70">
                        {user?.mutualFollowersCount} mutual friends
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      disabled={isCurrentLoading}
                      onClick={() => followMutate(user?._id)}
                      className="bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] relative cursor-pointer py-1.5 w-full text-center font-barlow px-3 text-base uppercase rounded-lg border-solid transition-transform duration-300 ease-in-out group outline-offset-4 focus:outline focus:outline-black focus:outline-offset-4 overflow-hidden"
                    >
                      <span className="relative z-20 text-[13px] font-semibold flex items-center justify-center">
                        {isCurrentLoading ? <BiLoaderCircle className='animate-spin text-base' /> : 'Follow'}
                      </span>
                      <span className="absolute left-[-75%] top-0 h-full w-[50%] bg-black/20 dark:bg-[#faf9f93b] rotate-12 z-10 blur-lg group-hover:left-[125%] transition-all duration-1000 ease-in-out" />
                      <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-tl-lg border-l-2 border-t-2 top-0 left-0" />
                      <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute group-hover:h-[90%] h-[60%] rounded-tr-lg border-r-2 border-t-2 top-0 right-0" />
                      <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[60%] group-hover:h-[90%] rounded-bl-lg border-l-2 border-b-2 left-0 bottom-0" />
                      <span className="w-1/2 drop-shadow-3xl transition-all duration-300 block border-[#060607] dark:border-[#FAF9F9] absolute h-[20%] rounded-br-lg border-r-2 border-b-2 right-0 bottom-0" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handelRemove(user?._id)}
                      className="text-[#060607]/70 hover:text-[#060607] dark:text-[#FAF9F9]/70 dark:hover:text-[#FAF9F9] cursor-pointer text-lg p-1 transition-colors"
                      aria-label="Remove suggestion"
                    >
                      <IoCloseOutline />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </>}
    </>
  )
}
