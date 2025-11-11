import axios from 'axios';
import Server from '../../../Server';

export const updateDeploymentProject = async (payload) => {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    try {
        const res = await axios.put(`${Server.baseApi}/deploymentProjects`, { ...payload, userId: authData?.userId }, {
            headers: { 'Content-Type': 'application/json', token: authData?.token }
        });
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to update project'];
    }
};
