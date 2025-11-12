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

export const getAgentDetails = async (agentId) => {
    try {
        const res = await axios.get(`${Server.baseApi}/deploymentAgents?id=${agentId}`);
        return [true, res?.data?.data || null];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to load agent details'];
    }
};
