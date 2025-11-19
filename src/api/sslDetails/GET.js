const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050';

export const getSSLDetails = async (checkId) => {
    const token = localStorage.getItem('token');
    
    try {
        const url = `${API_BASE}/check/ssl?id=${checkId}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return [false, errorData.error || 'Failed to fetch SSL details'];
        }

        const data = await response.json();
        return [true, data];
    } catch (error) {
        console.error('Error fetching SSL details:', error);
        return [false, 'Network error occurred'];
    }
};

export const updateSSLRenewalAlert = async (checkId, enabled) => {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch(`${API_BASE}/check/ssl-renewal?id=${checkId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'token': token
            },
            body: JSON.stringify({ enabled })
        });

        if (!response.ok) {
            const errorData = await response.json();
            return [false, errorData.error || 'Failed to update SSL renewal alert'];
        }

        const data = await response.json();
        return [true, data];
    } catch (error) {
        console.error('Error updating SSL renewal alert:', error);
        return [false, 'Network error occurred'];
    }
};
