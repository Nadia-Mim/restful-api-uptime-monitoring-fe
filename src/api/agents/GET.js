import axios from 'axios';
import Server from '../../../Server';

export const listAgents = async () => {
    try {
        const res = await axios.get(`${Server.baseApi}/deploymentAgents`);
        return [true, res?.data?.data || []];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to load agents'];
    }
};
