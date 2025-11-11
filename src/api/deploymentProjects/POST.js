import axios from 'axios';
import Server from '../../../Server';

export const createDeploymentProject = async (payload) => {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    try {
        const res = await axios.post(`${Server.baseApi}/deploymentProjects`, { ...payload, createdBy: authData?.userId }, {
            headers: { 'Content-Type': 'application/json', token: authData?.token }
        });
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to create project'];
    }
};
