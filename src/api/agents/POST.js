import axios from 'axios';
import Server from '../../../Server';

export const registerAgent = async (payload) => {
    try {
        const authData = JSON.parse(localStorage.getItem('authData') || '{}');
        const token = authData?.token?.id || authData?.token;
        const userId = authData?.user?._id || authData?.userId || authData?.id;
        const res = await axios.post(`${Server.baseApi}/deploymentAgents`, { ...payload, userId }, {
            headers: { token }
        });
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to register agent'];
    }
};
