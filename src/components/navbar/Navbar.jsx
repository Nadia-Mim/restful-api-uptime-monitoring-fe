import React from 'react';
import Gear from '../../icons/Gear.svg';
import User from '../../icons/User.svg';


const Navbar = () => {
    return (

        <div className='nav'>
            <div className='top-nav'>
                <div>
                    <h3>LOGO</h3>
                </div>
                <div>
                    <h3>Log Out</h3>
                </div>
            </div>

            <div className='left-nav'>
                <ul>
                    <li>
                        <nav to="/">
                            <span className='icon'><img src={Gear} style={{ height: '28px', width: '28px' }} /></span>
                            <span className='circle'></span>
                        </nav>
                    </li>
                    <li>
                        <nav to="/">
                            <span className='icon'><img src={User} style={{ height: '25px', width: '25px' }} /></span>
                            <span className='circle'></span>
                        </nav>
                    </li>
                </ul>
            </div>
        </div>
    )
}

export default Navbar