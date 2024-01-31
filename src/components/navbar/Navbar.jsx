import React from 'react'
import Gear from '../../icons/Gear.svg'
import User from '../../icons/User.svg'
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
    return (
        <div className='navbar'>
            <ul>
                <li>
                    <NavLink to="/">
                        <span className='icon'><img src={Gear} /></span>
                        <span className='text'>Gear</span>
                        <span className='circle'></span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/">
                        <span className='icon'><img src={User} /></span>
                        <span className='text'>User</span>
                        <span className='circle'></span>
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/">
                        <span className='icon'><img src={Gear} /></span>
                        <span className='text'>User2</span>
                        <span className='circle'></span>
                    </NavLink>
                </li>
            </ul>
        </div>
    )
}

export default Navbar