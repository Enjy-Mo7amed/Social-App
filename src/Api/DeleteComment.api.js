import axios from "axios";

export async function DeleteComment({postid , commentid}) {
    return await axios.delete(`https://route-posts.routemisr.com/posts/${postid}/comments/${commentid}`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}