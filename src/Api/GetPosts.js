import axios from "axios"

export const getAllPosts = async()=>{

    return await axios.get(`https://route-posts.routemisr.com/posts`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })

}