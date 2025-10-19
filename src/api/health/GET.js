import axios from 'axios';
import Server from '../../../Server';

export default async function getHealthLogs({ checkId, limit = 50, signal }) {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    const res = await axios.get(
        `${Server.baseApi}/health?checkId=${encodeURIComponent(checkId)}&limit=${limit}`,
        {
            headers: {
                'Content-Type': 'application/json',
                token: authData?.token || '',
            },
            signal,
        }
    );
    return res.data;
}
