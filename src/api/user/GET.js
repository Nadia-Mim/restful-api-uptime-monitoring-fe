import axios from "axios";
import Server from "../../../Server";
const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};

const handleError = (error) => {
    if (error.response) {
        // Request made and server responded
        return ([false, "An unexpected error occurred!"])
    } else if (error.request) {
        // The request was made but no response was received
        return ([false, "Network Error! Check your internet connection."])
    } else {
        // Something happened in setting up the request that triggered an Error
        return ([false, error.message])
    }
}

export const getUserInfoByUserId = (userId) => {
    return (
        axios.get(`${Server.baseApi}/user?userId=${userId}`, {
            headers: {
                'Content-Type': "application/json",
                'token': authData?.token
            }
        }).then(response => {
            return ([response?.data]);
        }).catch(error => {
            return handleError(error);
        })
    )
};
