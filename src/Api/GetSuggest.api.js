import axios from "axios"

export const getSuggestion = async()=>{
    return await axios.get(`https://route-posts.routemisr.com/users/suggestions?limt=10`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}