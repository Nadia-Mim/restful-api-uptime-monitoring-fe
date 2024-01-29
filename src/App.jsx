import React from 'react';
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';

// Navbar
import Navbar from '../src/components/navbar/Navbar';

// Login Components
const Login = React.lazy(() => import('../src/components/login/Login'));
const Dashboard = React.lazy(() => import('../src/components/apiMonitoring/Dashboard'));

function App() {

    return (
        <HashRouter>
            {/* <Navbar /> */}
            <Routes>
                <Route exact path='/dashboard' name="Dashboard" element={<Dashboard />} />
                <Route exact path='/login' name="login" element={<Login />} />

                <Route path="/*"
                    element={
                        <Navigate to='/dashboard' />
                    }
                />

            </Routes>
        </HashRouter>
    )
}

export default App
