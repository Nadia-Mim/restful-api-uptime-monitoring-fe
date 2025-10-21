import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Gear from '../../icons/Gear.svg';
import GearBlue from '../../icons/GearBlue.svg';
import DashboardIcon from '../../icons/Dashboard.svg';
import DashboardBlueIcon from '../../icons/DashboardBlue.svg';
import User from '../../icons/User.svg';
import UserBlue from '../../icons/UserBlue.svg';
import Logout from '../../icons/Logout.svg';
import LogoutRed from '../../icons/LogoutRed.svg';
import DeploymentsWhite from '../../icons/DeploymentsWhite.svg';
import DeploymentsBlue from '../../icons/DeploymentsBlue.svg';
import Systech from '../../images/Systech.png';
import MenuBarsIcon from '../../icons/MenuBarsIcon.svg';

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
        if (p.startsWith('/deployments')) return 'Deployments';
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

    // Active nav derived from current location for reliable icon state
    const activeKey = useMemo(() => {
        const p = location.pathname.toLowerCase();
        if (p.startsWith('/dashboard')) return 'Dashboard';
        if (p.startsWith('/settings')) return 'Settings';
        if (p.startsWith('/deployments')) return 'Deployments';
        if (p.startsWith('/user')) return 'User';
        return '';
    }, [location.pathname]);

    return (
        <div className='nav'>
            {/* Top navigation bar */}
            <div className='top-nav'>
                <div>
                    <img src={Systech} style={{ height: '80px', width: '80px', marginLeft: '-15px', cursor: 'pointer' }} onClick={() => routeToDashboard()} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 18 }}>{pageTitle}</div>
                </div>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* User icon button */}
                    <img
                        src={activeKey === 'User' ? UserBlue : User}
                        className='topbar-icon'
                        style={{ height: '24px', width: '24px' }}
                        alt='User'
                        onClick={routeToUserProfile}
                        onMouseEnter={(e) => { e.currentTarget.src = UserBlue; }}
                        onMouseLeave={(e) => { e.currentTarget.src = (activeKey === 'User' ? UserBlue : User); }}
                    />
                    {/* Exit icon button (rounded; hover turns red) */}
                    <img
                        src={Logout}
                        className='topbar-icon'
                        alt='Log out'
                        title='Log out'
                        onClick={handleLogout}
                        onMouseEnter={(e) => { e.currentTarget.src = LogoutRed; }}
                        onMouseLeave={(e) => { e.currentTarget.src = Logout; }}
                    />
                    <img src={MenuBarsIcon} className='mobile-nav' onClick={() => setShowMobileNav(!showMobileNav)} />
                </div>
            </div>

            {/* Mobile dropdown navigation */}
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
                        <span className='icon'><img src={activeKey === 'Dashboard' ? DashboardBlueIcon : DashboardIcon} style={{ height: '28px', width: '28px' }} /></span>
                        API Check
                    </div>
                    <div
                        onClick={() => {
                            setCurrentNavigation('Deployments');
                            navigate('/deployments');
                            setShowMobileNav(false);
                        }}
                        style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <span className='icon'><img src={activeKey === 'Deployments' ? DeploymentsBlue : DeploymentsWhite} style={{ height: '28px', width: '28px' }} /></span>
                        Deployments
                    </div>
                    <div
                        onClick={() => {
                            setCurrentNavigation('Settings');
                            navigate('/settings');
                            setShowMobileNav(false);
                        }}
                        style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}
                    >
                        <span className='icon'><img src={activeKey === 'Settings' ? GearBlue : Gear} style={{ height: '28px', width: '28px' }} /></span>
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
                        <span className='icon'><img src={activeKey === 'User' ? UserBlue : User} style={{ height: '25px', width: '25px' }} /></span>
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
                        <span className='icon'><img src={Logout} style={{ height: '25px', width: '25px' }} onMouseEnter={(e) => { e.currentTarget.src = LogoutRed; }} onMouseLeave={(e) => { e.currentTarget.src = Logout; }} /></span>
                        Log Out
                    </div>
                </div>
            }

            {/* Left sidebar navigation */}
            <div className='left-nav'>
                <ul>
                    <li>
                        <Link to="/dashboard">
                            <span className='icon'><img src={activeKey === 'Dashboard' ? DashboardBlueIcon : DashboardIcon} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/deployments">
                            <span className='icon'><img src={activeKey === 'Deployments' ? DeploymentsBlue : DeploymentsWhite} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings">
                            <span className='icon'><img src={activeKey === 'Settings' ? GearBlue : Gear} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                    {/* User option removed from left navbar as requested */}
                </ul>
            </div>
        </div>
    )
}

export default Navbar