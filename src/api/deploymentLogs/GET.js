import axios from 'axios';
import Server from '../../../Server';

export const getDeploymentLogs = async (runId, since) => {
    try {
        const qs = new URLSearchParams();
        qs.set('runId', runId);
        if (since) qs.set('since', String(since));
        const res = await axios.get(`${Server.baseApi}/deploymentLogs?${qs.toString()}`);
        return [true, res?.data?.data || []];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to load logs'];
    }
};
