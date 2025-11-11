import axios from 'axios';
import Server from '../../../Server';

export const listDeploymentRuns = async (deploymentId) => {
    try {
        const qs = deploymentId ? `?deploymentId=${encodeURIComponent(deploymentId)}` : '';
        const res = await axios.get(`${Server.baseApi}/deploymentRuns${qs}`);
        return [true, res?.data?.data || []];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to load runs'];
    }
};
