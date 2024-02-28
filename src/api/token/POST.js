import axios from "axios";
import Server from "../../../Server";


const handleError = (error) => {
    if (error?.response?.data?.error) {
        // Request made and server responded
        return ([false, error?.response?.data?.error])
    } else if (error.response) {
        // Request made and server did not specify reason
        return ([false, "An unexpected error occurred!"])
    } else if (error.request) {
        // The request was made but no response was received
        return ([false, "Network Error! Check your internet connection."])
    } else {
        // Something happened in setting up the request that triggered an Error
        return ([false, error.message])
    }
}

export const crateTokenToLoginUser = (loginInfo) => {
    return (
        axios.post(`${Server.baseApi}/token`, loginInfo, {
            headers: {
                'Content-Type': "application/json",
            }
        }).then(response => {
            return ([response?.data]);
        }).catch(error => {
            return handleError(error);
        })
    )
};
