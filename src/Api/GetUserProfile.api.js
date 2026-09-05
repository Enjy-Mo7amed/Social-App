import axios from "axios"

export const getUserProfile = async({id})=>{

    return await axios.get(`https://route-posts.routemisr.com/users/${id}/profile`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}