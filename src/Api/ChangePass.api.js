import axios from "axios";

export async function ChangePassword(body) {
    return await axios.patch(`https://route-posts.routemisr.com/users/change-password`,body,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
    
}