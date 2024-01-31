import React from 'react'
import Gear from '../../icons/Gear.svg'
import User from '../../icons/User.svg'
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
    return (

        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '1rem' }}>
                <div>
                    <h3>LOGO</h3>
                </div>
                <div>
                    <h3>LogOut</h3>
                </div>
            </div>

            <div className='navbar'>
                <ul>
                    <li>
                        <nav to="/">
                            <span className='icon'><img src={Gear} style={{ height: '25px', width: '25px' }} /></span>
                            <span className='circle'></span>
                        </nav>
                    </li>
                    <li>
                        <nav to="/">
                            <span className='icon'><img src={User} style={{ height: '22px', width: '22px' }} /></span>
                            <span className='circle'></span>
                        </nav>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar