import axios from 'axios';
import Server from '../../../Server';

export const listDeploymentProjects = async (environment) => {
    try {
        const qs = environment ? `?environment=${encodeURIComponent(environment)}` : '';
        const res = await axios.get(`${Server.baseApi}/deploymentProjects${qs}`);
        return [true, res?.data?.data || []];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to load projects'];
    }
};
