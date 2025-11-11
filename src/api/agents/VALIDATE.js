import axios from 'axios';
import Server from '../../../Server';

export const validateAgent = async (id) => {
    try {
        const res = await axios.get(`${Server.baseApi}/deploymentAgents`, { params: { action: 'validate', id } });
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to validate agent'];
    }
};
