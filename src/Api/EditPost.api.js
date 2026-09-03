import axios from "axios";

export async function EditPost({id },formData) {
    return await axios.put(`https://route-posts.routemisr.com/posts/${id}`,formData,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}