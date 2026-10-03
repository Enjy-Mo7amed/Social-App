import axios from "axios";

export async function PostShare({ id, body }) {
    const payload = {}
    if (body && body.trim()) {
        payload.body = body.trim()
    }
    return await axios.post(`https://route-posts.routemisr.com/posts/${id}/share`, payload, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}