import React from 'react';
import { HashRouter, Route, Routes } from "react-router-dom";
import './App.css';
import './css/projectMain.css'

// Navbar
import Navbar from '../src/components/navbar/Navbar';

// Login Components
const Login = React.lazy(() => import('../src/components/login/Login'));

function App() {

    return (
        <HashRouter>
            {/* <Navbar /> */}
            <Routes>
                <Route path='/' element={<Login />} />
            </Routes>
        </HashRouter>
    )
}

export default App
