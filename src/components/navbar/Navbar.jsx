import React, { useContext } from 'react';
import Gear from '../../icons/Gear.svg';
import User from '../../icons/User.svg';
import Systech from '../../images/Systech.png';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const Navbar = () => {

    const authContextConsumer = useContext(AuthContext);
    const navigate = useNavigate(); // To route to another page

    const handleLogout = () => {
        localStorage.removeItem("authData");
        authContextConsumer.setAuthData('');
        navigate('/login');
    }

    return (
        <div className='nav'>
            <div className='top-nav'>
                <div>
                    <img src={Systech} style={{ height: '75px', width: '75px' }} />
                </div>
                <div onClick={handleLogout} style={{ cursor: 'pointer' }}>
                    <h3>Log Out</h3>
                </div>
            </div>

            <div className='left-nav'>
                <ul>
                    <li>
                        <Link to="/">
                            <span className='icon'><img src={Gear} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                    <li>
                        <Link to="/user">
                            <span className='icon'><img src={User} style={{ height: '25px', width: '25px' }} /></span>
                            <span className='circle'></span>
                        </Link>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar