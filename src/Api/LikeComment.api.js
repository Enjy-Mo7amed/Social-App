import axios from "axios";

export async function LikeComment({postid , commentid}) {
    return await axios.put(`https://route-posts.routemisr.com/posts/${postid}/comments/${commentid}/like`,{},{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
    
}