import axios from "axios";

export async function getPOstLikes({id}) {
    return await axios.get(`https://route-posts.routemisr.com/posts/${id}/likes?page=1&limit=20`,{
        headers:{
            Authorization:`Bearer ${localStorage.getItem('userToken')}`
        }
    });
}
