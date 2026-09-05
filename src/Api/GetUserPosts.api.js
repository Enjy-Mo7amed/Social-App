import axios from "axios"

export const getUserPosts = async({id})=>{
    return await axios.get(`https://route-posts.routemisr.com/users/${id}/posts`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}