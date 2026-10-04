import axios from "axios"

export async function getNotifications() {
    return await axios.get(`https://route-posts.routemisr.com/notifications`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}