import axios from "axios";

export async function Createreply({postid , commentid},formData) {
    return await axios.post(`https://route-posts.routemisr.com/posts/${postid}/comments/${commentid}/replies`,formData,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
    
}