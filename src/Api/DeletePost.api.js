import axios from "axios";

export async function DeletePost({id}) {
    return await axios.delete(`https://route-posts.routemisr.com/posts/${id}`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
    
}