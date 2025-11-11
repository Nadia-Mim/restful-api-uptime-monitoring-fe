import axios from 'axios';
import Server from '../../../Server';

export const deletePipelineTemplate = async (id) => {
    try {
        const res = await axios.delete(`${Server.baseApi}/pipelines?id=${encodeURIComponent(id)}`);
        return [true, res?.data?.data];
    } catch (err) {
        return [false, err?.response?.data?.error || 'Failed to delete pipeline template'];
    }
};
