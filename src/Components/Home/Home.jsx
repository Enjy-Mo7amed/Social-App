import React from 'react'
import { getAllPosts } from '../../Api/GetPosts'
import CardPost from '../CardPost/CardPost'
import Loader from '../Loader/Loader'
import Error from '../Error/Error'
import { useQuery } from '@tanstack/react-query'
import CreatePost from '../CreatePost/CreatePost'
import { getmyprofile } from '../../Api/GetMyProfile.api'
import LeftSideBar from '../LeftSideBar/LeftSideBar'
import RightSideBar from '../RightSideBar/RightSideBar'
import { getFeeds } from '../../Api/GetFeeds.api'

export default function Home() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["GetPosts"],
    queryFn: getAllPosts,
    select: (data) => data?.data?.data?.posts
  })
  // console.log(data);

  const { data: feedsData, isLoading: feedsLoading, isError: feedsIsError } = useQuery({
    queryKey: ['GetFeeds'],
    queryFn: () => getFeeds(),
    select: (data) => data?.data?.data?.posts
  })

  const { data: userData } = useQuery({
    queryKey: ['getmyprofile'],
    queryFn: getmyprofile,
    select: (data) => data?.data?.data?.user
  })
  const allPosts = [...(feedsData || []), ...(data || [])]
  const uniquePosts = Array.from(
    new Map(allPosts.map((post) => [post.id, post])).values()
  ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  if (isLoading || feedsLoading) {
    return <Loader />
  }
  if (isError) {
    return <Error apiError={error.message} />
  }
  if (feedsIsError) {
    return <Error apiError="Failed to load feeds" />
  }

  return (
    <>
      <div className="bg-[#f7faff] dark:bg-[#060607] flex flex-col justify-center gap-3 lg:flex-row">
        {/* left sidebaar */}
        <div className="hidden lg:w-[25%] max-w-full self-start lg:sticky lg:top-16 lg:block">
          <LeftSideBar data={userData} />
        </div>
        {/* posts */}
        <div className="w-[95%] my-5 mx-auto lg:w-[60%] ">
          <CreatePost photo={userData?.photo} />
          {uniquePosts.map((post) => <CardPost post={post} key={post.id} />)}
        </div>
        {/* right sidebar */}
        <div className="hidden mr-3 lg:sticky lg:top-20 lg:self-start lg:block">
          <RightSideBar />
        </div>
      </div>

    </>
  )
}
