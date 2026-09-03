import axios from "axios"

export async function getmyprofile() {
    return await axios.get(`https://route-posts.routemisr.com/users/profile-data`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}



