import axios from "axios"

export async function markNotificationRead({ notificationId }) {
    return await axios.patch(`https://route-posts.routemisr.com/notifications/read`, { notificationId }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}