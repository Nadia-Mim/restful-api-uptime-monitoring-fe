import axios from 'axios';
import Server from '../../../Server';

export const triggerDeploymentRun = async ({ deploymentId, environment, versionTag }) => {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    try {
        const res = await axios.post(`${Server.baseApi}/deploymentRuns`, {
            deploymentId,
            environment,
            versionTag,
            triggeredBy: authData?.userId,
        }, {
            headers: { 'Content-Type': 'application/json', token: authData?.token }
        });
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to trigger run'];
    }
};
