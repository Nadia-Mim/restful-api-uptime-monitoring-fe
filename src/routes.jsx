import React, { useContext } from 'react';
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import './App.css';
import './css/projectMain.css'

// Navbar
import Navbar from './components/navbar/Navbar';
import AuthContext from './contexts/AuthContext';

// Login Components
const Login = React.lazy(() => import('./components/login/Login'));
const SignUp = React.lazy(() => import('./components/login/SignUp'));
const Dashboard = React.lazy(() => import('./components/apiMonitoring/Dashboard'));
const ApiDetails = React.lazy(() => import('./components/apiMonitoring/ApiDetails'));
const UserProfile = React.lazy(() => import('./components/user/UserProfile'));
const Settings = React.lazy(() => import('./components/settings/Settings'));

let authData = JSON.parse(localStorage.getItem('authData'));

const routes = () => {

    const authContextConsumer = useContext(AuthContext);

    return (
        <div>
            <HashRouter>

                {authContextConsumer?.authData?.expires > Date.now() && <Navbar />}

                <div className={(authContextConsumer?.authData?.expires > Date.now()) ? "main-content" : ''}>
                    <React.Suspense>
                        <Routes>
                            {(authContextConsumer?.authData?.expires > Date.now()) &&
                                <>
                                    <Route exact path='/dashboard' name="Dashboard" element={<Dashboard />} />
                                    <Route exact path='/check/:id' name="ApiDetails" element={<ApiDetails />} />
                                    <Route exact path='/user' name="User" element={<UserProfile />} />
                                    <Route exact path='/settings' name="Settings" element={<Settings />} />
                                </>
                            }

                            <Route exact path='/sign-up' name="SignUp" element={<SignUp />} />
                            <Route exact path='/login' name="login" element={<Login />} />
                            <Route path="/*" element={<Navigate to='/login' />} />
                        </Routes>
                    </React.Suspense>
                </div>
            </HashRouter>
        </div>
    )
}

export default routes