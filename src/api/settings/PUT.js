import axios from 'axios';
import Server from '../../../Server';

export default async function putSettings({ userId, ttlHours, sslThresholdDays }) {
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    const res = await axios.put(`${Server.baseApi}/settings`, { userId, ttlHours, sslThresholdDays }, {
        headers: {
            'Content-Type': 'application/json',
            token: authData?.token || ''
        }
    });
    return res.data;
}
