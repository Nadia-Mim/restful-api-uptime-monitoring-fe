import axios from 'axios';
import Server from '../../../Server';

const handleError = (error) => {
    if (error?.response) {
        return [false, error?.response?.data?.error || 'An unexpected error occurred!'];
    } else if (error?.request) {
        return [false, 'Network Error! Check your internet connection.'];
    }
    return [false, error?.message || 'Unknown error'];
};

export const execCommand = async ({ command, cwd }) => {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    try {
        const res = await axios.post(`${Server.baseApi}/terminal`, {
            command,
            cwd,
            userId: authData?.userId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'token': authData?.token,
            }
        });
        return [true, res?.data];
    } catch (err) {
        return handleError(err);
    }
};
