import React, { useEffect, useState } from 'react';
import './App.css';
import './css/projectMain.css';
import Routes from './routes';
import { AuthDetailsProvider } from './contexts/AuthContext';


function App() {

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
            <Routes />
        </AuthDetailsProvider>
    )
}

export default App
