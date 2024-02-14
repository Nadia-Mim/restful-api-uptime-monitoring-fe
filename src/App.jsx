import React, { useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import './css/projectMain.css'

// Navbar
import Navbar from '../src/components/navbar/Navbar';

// Login Components
const Login = React.lazy(() => import('../src/components/login/Login'));
const SignUp = React.lazy(() => import('../src/components/login/SignUp'));
const Dashboard = React.lazy(() => import('../src/components/apiMonitoring/Dashboard'));


function App() {

    const authData = localStorage.getItem('authData') ? JSON.parse(localStorage.getItem('authData')) : '';

    return (
        <HashRouter>

            {authData && <Navbar />}

            <div className={authData ? "main-content" : ''}>
                <React.Suspense>
                    <Routes>
                        <Route exact path='/dashboard' name="Dashboard" element={<Dashboard />} />
                        <Route exact path='/login' name="login" element={<Login />} />
                        <Route exact path='/sign-up' name="SignUp" element={<SignUp />} />

                        <Route path="/*" element={<Navigate to='/login' />} />
                    </Routes>
                </React.Suspense>
            </div>
        </HashRouter>
    )
}

export default App
