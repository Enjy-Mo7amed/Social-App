import axios from "axios"

export const getSavedBM = async()=>{

    return await axios.get(`https://route-posts.routemisr.com/users/bookmarks`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}