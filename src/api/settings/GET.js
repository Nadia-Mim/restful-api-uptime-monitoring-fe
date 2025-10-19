import axios from 'axios';
import Server from '../../../Server';

export default async function getSettings({ userId }) {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    const res = await axios.get(`${Server.baseApi}/settings?userId=${encodeURIComponent(userId)}`, {
        headers: {
            'Content-Type': 'application/json',
            token: authData?.token || ''
        }
    });
    return res.data;
}
