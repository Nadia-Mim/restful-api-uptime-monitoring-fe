import axios from 'axios';
import Server from '../../../Server';

export const deleteAgent = async (agentId) => {
    try {
        const authData = JSON.parse(localStorage.getItem('authData') || '{}');
        const token = authData?.token?.id || authData?.token;
        const res = await axios.delete(`${Server.baseApi}/deploymentAgents/${agentId}`, {
            headers: { token }
        });
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to delete agent'];
    }
};
