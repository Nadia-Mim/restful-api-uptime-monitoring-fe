import axios from "axios";
import Server from "../../../Server";
// const token = JSON.parse(localStorage.w_auth).accessToken;


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

export const CreateUser = (userInfo) => {
    return (
        axios.post(`${Server.baseApi}/user`, userInfo, {
            headers: {
                'Content-Type': "application/json",
                // 'Authorization': 'Bearer ' + token
            }
        }).then(response => {
            return ([response?.data]);
        }).catch(error => {
            return handleError(error);
        })
    )
};
