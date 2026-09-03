import axios from "axios";

export async function EditComment({postid, commentid },formData) {
    return await axios.put(`https://route-posts.routemisr.com/posts/${postid}/comments/${commentid}`,formData,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}