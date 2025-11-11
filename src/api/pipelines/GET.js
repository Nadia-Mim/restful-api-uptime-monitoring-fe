import axios from 'axios';
import Server from '../../../Server';

export const listPipelineTemplates = async () => {
    try {
        const res = await axios.get(`${Server.baseApi}/pipelines`);
        return [true, res?.data?.data || []];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to load pipeline templates'];
    }
};
