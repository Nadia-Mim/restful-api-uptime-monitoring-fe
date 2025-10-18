const Server = {
    // Use Vite env var if provided; default to local backend for development
    baseApi: import.meta?.env?.VITE_API_BASE || 'http://localhost:5050',
};

export default Server