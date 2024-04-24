import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import { AuthDetailsProvider } from './contexts/AuthContext';
import './css/projectMain.css';
import Routes from './routes';

function App() {
    const queryClient = new QueryClient();
    const [authData, setAuthData] = useState('');

    useEffect(() => {
        const storedAuthData = localStorage.getItem('authData');
        if (storedAuthData) {
            setAuthData(JSON.parse(storedAuthData));
        }
    }, []);

    return (
        <AuthDetailsProvider
            value={{
                authData,
                setAuthData
            }}
        >
            <QueryClientProvider client={queryClient}>
                <Routes />
            </QueryClientProvider>
        </AuthDetailsProvider>
    )
}

export default App
