import axios from 'axios';
import Server from '../../../Server';

export const deleteDeploymentProject = async (id) => {
    try {
        const res = await axios.delete(`${Server.baseApi}/deploymentProjects?id=${encodeURIComponent(id)}`);
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to delete project'];
    }
};
