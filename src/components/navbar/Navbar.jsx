import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Gear from '../../icons/Gear.svg';
import GearBlue from '../../icons/GearBlue.svg';
import DashboardIcon from '../../icons/Dashboard.svg';
import DashboardBlueIcon from '../../icons/DashboardBlue.svg';
import User from '../../icons/User.svg';
import UserBlue from '../../icons/UserBlue.svg';
import ExitIcon from '../../icons/ExitIcon.svg';
import ExitIconBlue from '../../icons/ExitIconBlue.svg';
import Systech from '../../images/Systech.png';
import MenuBarsIcon from '../../icons/MenuBarsIcon.svg';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import getSettings from '../../api/settings/GET';
import putSettings from '../../api/settings/PUT';

const Navbar = () => {

    const [showMobileNav, setShowMobileNav] = useState(false);
    const [currentNavigation, setCurrentNavigation] = useState('Dashboard');
    const authContextConsumer = useContext(AuthContext);
    const navigate = useNavigate(); // To route to another page
    const location = useLocation();

    // dynamic page title near logo
    const pageTitle = (() => {
        const p = location.pathname.toLowerCase();
        if (p.startsWith('/dashboard')) return 'Dashboard';
        if (p.startsWith('/settings')) return 'Settings';
        if (p.startsWith('/check/')) return 'API Details';
        if (p.startsWith('/user')) return 'Profile';
        return '';
    })();

    const handleLogout = () => {
        localStorage.clear();
        authContextConsumer.setAuthData('');
        navigate('/login');
    }

    const routeToDashboard = () => {
        navigate('/dashboard');
    }

    const routeToUserProfile = () => {
        navigate('/user');
    }

    return (
        <div className='nav'>
            <div className='top-nav'>
                <div>
                    <img src={Systech} style={{ height: '80px', width: '80px', marginLeft: '-15px', cursor: 'pointer' }} onClick={() => routeToDashboard()} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>{pageTitle}</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <h3 style={{ cursor: 'pointer' }} className='logOutButton' onClick={handleLogout}>Log Out</h3>
                    <img src={MenuBarsIcon} className='mobile-nav' onClick={() => setShowMobileNav(!showMobileNav)} />
                </div>
            </div>

            {showMobileNav &&
                <div style={{ position: 'absolute', padding: '20px', background: 'rgba(30, 31, 38, 0.9)', width: '100%', boxShadow: '0 4px 8px rgba(74, 75, 81, 0.5)' }}>
                    <div
                        onClick={() => {
                            setCurrentNavigation('Dashboard');
                            routeToDashboard();
                            setShowMobileNav(false);
                        }}
                        style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <span className='icon'><img src={currentNavigation === 'Dashboard' ? DashboardBlueIcon : DashboardIcon} style={{ height: '28px', width: '28px' }} /></span>
                        API Check
                    </div>
                    <div
                        onClick={() => {
                            setCurrentNavigation('Settings');
                            navigate('/settings');
                            setShowMobileNav(false);
                        }}
                        style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <span className='icon'><img src={currentNavigation === 'Settings' ? GearBlue : Gear} style={{ height: '28px', width: '28px' }} /></span>
                        Settings
                    </div>
                    <div
                        onClick={() => {
                            setCurrentNavigation('User');
                            routeToUserProfile();
                            setShowMobileNav(false);
                        }}
                        style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <span className='icon'><img src={currentNavigation === 'User' ? UserBlue : User} style={{ height: '25px', width: '25px' }} /></span>
                        Profile
                    </div>
                    <div
                        onClick={() => {
                            setCurrentNavigation('Logout');
                            handleLogout();
                            setShowMobileNav(false);
                        }}
                        style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <span className='icon'><img src={currentNavigation === 'Logout' ? ExitIconBlue : ExitIcon} style={{ height: '25px', width: '25px' }} /></span>
                        Log Out
                    </div>
                </div>
            }

            <div className='left-nav'>
                <ul>
                    <li onClick={() => setCurrentNavigation('Dashboard')}>
                        <Link to="/dashboard">
                            <span className='icon'><img src={currentNavigation === 'Dashboard' ? DashboardBlueIcon : DashboardIcon} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                    <li onClick={() => setCurrentNavigation('Settings')}>
                        <Link to="/settings">
                            <span className='icon'><img src={currentNavigation === 'Settings' ? GearBlue : Gear} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                    <li onClick={() => setCurrentNavigation('User')}>
                        <Link to="/user">
                            <span className='icon'><img src={currentNavigation === 'User' ? UserBlue : User} style={{ height: '25px', width: '25px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar