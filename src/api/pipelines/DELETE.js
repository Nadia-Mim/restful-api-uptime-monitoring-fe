import axios from 'axios';
import Server from '../../../Server';

export const deletePipelineTemplate = async (id) => {
    try {
        const authData = JSON.parse(localStorage.getItem('authData'));
        const token = authData?.token?.id || authData?.token;

        const res = await axios.delete(`${Server.baseApi}/pipelines?id=${encodeURIComponent(id)}`, {
            headers: token ? { token } : {}
        });
        return [true, res?.data?.data];
    } catch (err) {
        console.error('Delete pipeline error:', err);
        return [false, err?.response?.data?.error || 'Failed to delete pipeline template'];
    }
};
