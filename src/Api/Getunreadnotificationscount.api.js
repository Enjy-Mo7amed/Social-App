import axios from "axios"

export async function getUnreadNotificationsCount() {
    return await axios.get(`https://route-posts.routemisr.com/notifications/unread-count`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}