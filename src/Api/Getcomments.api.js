import axios from "axios";

export async function getComments({id}) {
    return await axios.get(`https://route-posts.routemisr.com/posts/${id}/comments?page=1&limit=10`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    })
}