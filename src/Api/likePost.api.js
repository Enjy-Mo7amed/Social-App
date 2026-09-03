import axios from "axios";

export async function LikePost({ post }) {
    return await axios.put(`https://route-posts.routemisr.com/posts/${post?.id}/like`,{}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}