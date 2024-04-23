import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import Gear from '../../icons/Gear.svg';
import GearBlue from '../../icons/GearBlue.svg';
import User from '../../icons/User.svg';
import UserBlue from '../../icons/UserBlue.svg';
import Systech from '../../images/Systech.png';

const Navbar = () => {

    const [currentNavigation, setCurrentNavigation] = useState('Dashboard');
    const authContextConsumer = useContext(AuthContext);
    const navigate = useNavigate(); // To route to another page

    const handleLogout = () => {
        localStorage.clear();
        authContextConsumer.setAuthData('');
        navigate('/login');
    }

    return (
        <div className='nav'>
            <div className='top-nav'>
                <div>
                    <img src={Systech} style={{ height: '80px', width: '80px', marginLeft: '-15px' }} />
                </div>
                <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <h3>Log Out</h3>
                </div>
            </div>

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