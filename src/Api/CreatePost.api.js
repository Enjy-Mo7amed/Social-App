import axios from "axios"; 

export async function CreatePostApi(formData) {
    return await axios.post(`https://route-posts.routemisr.com/posts`,formData,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}