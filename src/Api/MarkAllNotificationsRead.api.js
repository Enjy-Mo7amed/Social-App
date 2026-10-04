import axios from "axios"

export async function markAllNotificationsRead() {
    return await axios.patch(`https://route-posts.routemisr.com/notifications/read-all`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}