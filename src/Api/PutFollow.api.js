import axios from "axios";

export async function PutFollow({ id }) {
    return await axios.put(`https://route-posts.routemisr.com/users/${id}/follow`,{}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('userToken')}`
        }
    })
}