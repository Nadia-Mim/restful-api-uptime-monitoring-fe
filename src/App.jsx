import React, { useState } from 'react';
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
// import './App.css';
import './css/projectMain.css'

// Navbar
import Navbar from '../src/components/navbar/Navbar';

// Login Components
const Login = React.lazy(() => import('../src/components/login/Login'));
const SignUp = React.lazy(() => import('../src/components/login/SignUp'));
const Dashboard = React.lazy(() => import('../src/components/apiMonitoring/Dashboard'));


function App() {

    const [showNavbar, setShowNavbar] = useState(false);

    return (
        <HashRouter>

            {showNavbar && <Navbar />}

            <div className="main-content">
                <Routes>
                    <Route exact path='/dashboard' name="Dashboard" element={<Dashboard />} />
                    <Route exact path='/login' name="login" element={<Login setShowNavbar={setShowNavbar} />} />
                    <Route exact path='/sign-up' name="SignUp" element={<SignUp />} />

                    <Route path="/*" element={<Navigate to='/login' />} />
                </Routes>
            </div>
        </HashRouter>
    )
}

export default App
