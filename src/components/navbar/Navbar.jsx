import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Gear from '../../icons/Gear.svg';
import GearBlue from '../../icons/GearBlue.svg';
import User from '../../icons/User.svg';
import UserBlue from '../../icons/UserBlue.svg';
import ExitIcon from '../../icons/ExitIcon.svg';
import ExitIconBlue from '../../icons/ExitIconBlue.svg';
import Systech from '../../images/Systech.png';
import MenuBarsIcon from '../../icons/MenuBarsIcon.svg';

const Navbar = () => {

    const [showMobileNav, setShowMobileNav] = useState(false);
    const [currentNavigation, setCurrentNavigation] = useState('Dashboard');
    const authContextConsumer = useContext(AuthContext);
    const navigate = useNavigate(); // To route to another page

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
                <div style={{ display: 'flex', gap: '25px' }}>
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
                        <span className='icon'><img src={currentNavigation === 'Dashboard' ? GearBlue : Gear} style={{ height: '28px', width: '28px' }} /></span>
                        API Check
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
                            <span className='icon'><img src={currentNavigation === 'Dashboard' ? GearBlue : Gear} style={{ height: '28px', width: '28px' }} /></span>
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