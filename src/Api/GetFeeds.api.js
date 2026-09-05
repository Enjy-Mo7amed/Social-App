import axios from "axios"

export async function getFeeds() {
    return await axios.get(`https://route-posts.routemisr.com/posts/feed?only=following&limit=30`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}



