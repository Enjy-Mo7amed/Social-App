import axios from "axios";

export async function PostShare({ id }) {
    return await axios.post(`https://route-posts.routemisr.com/posts/${id}/share`,{}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}