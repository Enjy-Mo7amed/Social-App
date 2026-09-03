import axios from "axios";

export async function getCommentrep({postid,commentid}) {
    return await axios.get(`https://route-posts.routemisr.com/posts/${postid}/comments/${commentid}/replies?page=1&limit=10`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}