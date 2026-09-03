import axios from "axios";

export async function CommentCreate({id},formData) {
    return await axios.post(`https://route-posts.routemisr.com/posts/${id}/comments`,formData,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
    
}