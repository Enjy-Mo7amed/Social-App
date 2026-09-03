import axios from "axios"; 

export async function UploadPhoto(body) {
    return await axios.put(`https://route-posts.routemisr.com/users/upload-photo`,body,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}