import axios from 'axios';
import Server from '../../../Server';

export const deleteAgent = async (agentId) => {
    try {
        const authData = JSON.parse(localStorage.getItem('authData') || '{}');
        const token = authData?.token?.id || authData?.token;
        const res = await axios.delete(`${Server.baseApi}/deploymentAgents?id=${encodeURIComponent(agentId)}`, {
            headers: { token }
        });
        return [true, res?.data?.data];
    } catch (err) {
        console.error('Delete agent error:', err);
        return [false, err?.response?.data?.error || 'Failed to delete agent'];
    }
};
