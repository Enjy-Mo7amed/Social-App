import React from 'react'
import { useQuery } from '@tanstack/react-query'
import CardPost from '../CardPost/CardPost';
import { getmyprofile } from '../../Api/GetMyProfile.api';
import LeftSideBar from '../LeftSideBar/LeftSideBar';
import Loader from '../Loader/Loader';
import Error from '../Error/Error';
import { getFeeds } from '../../Api/GetFeeds.api';

export default function Feeds() {
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['GetFeeds'],
    queryFn: () => getFeeds(),
    select: (data) => data?.data?.data?.posts
  })
  console.log(data);

  const { data: userData } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: getmyprofile,
    select: (data) => data?.data?.data?.user
  })

  if (isLoading) {
    return <Loader />
  }
  if (isError) {
    return <Error apiError={error?.message} />
  }

  return (
    <>
      <div className="bg-[#f7faff] dark:bg-[#060607] flex flex-col justify-center gap-3 lg:flex-row lg:gap-10">
        <div className="hidden lg:w-[25%] self-start lg:sticky lg:top-16 lg:block">
          <LeftSideBar data={userData} />
        </div>
        <div className="w-[95%] mx-auto my-5 lg:w-[60%]">
          {data && data.length > 0 ? (
            data.map((post) => <CardPost key={post?.id || post?._id} post={post} />)
          ) : (
            <div className="text-center text-gray-500 my-10 text-lg">No Feeds</div>
          )}
        </div>
      </div>
    </>
  )
}
