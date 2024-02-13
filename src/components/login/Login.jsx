import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginBackground from '../../images/LoginBackground.jpg';

const styles = {
    backgroundStyle: {
        backgroundImage: `url(${LoginBackground})`,
        position: 'absolute',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        width: '100%',
        height: '100vh',
    },
    containerStyle: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loginWrapper: {
        height: '410px',
        width: "390px",
        backgroundColor: "#1E1F26",
        boxShadow: '0px 4px 1rem #000',
        fontSize: "1.8rem",
        padding: "1rem"
    },
    signUpText: {
        color: "#f9dbbd",
        fontSize: "14px",
        textAlign: "left",
        marginTop: "0.5rem",
        cursor: 'pointer'
    },
    submitButton: {
        padding: '6px',
        color: '#F9DBBD',
        backgroundColor: '#4545E6',
        fontSize: '16px',
        borderRadius: '5px',
        cursor: 'pointer',
        textAlign: 'center'
    },
    inputWrapper: {
        position: 'relative',
        borderBottom: '2px solid #35363e',
        margin: '30px 0'
    },
    input: {
        width: '100%',
        padding: '0 5px',
        height: '40px',
        fontSize: '16px',
        border: 'none',
        background: 'none',
        outline: 'none'
    }
}
const Login = () => {

    const navigate = useNavigate(); // To route to another page

    const [selectedForm, setSelectedForm] = useState('LOGIN');

    useEffect(() => {

    }, [])

    const routeToSignUp = () => {
        navigate('/sign-up');
    }

    return (
        <div style={styles.backgroundStyle}>
            <div style={styles.containerStyle}>
                <div style={styles.loginWrapper}>

                    <div style={{ textAlign: 'center' }}><h5>Login</h5></div>

                    <div style={{ marginBottom: "3.5rem" }}>
                        <div style={styles.inputWrapper}>
                            <input
                                placeholder='Email'
                                type="email"
                                id="inputEmail4"
                                style={styles.input}
                            />
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                placeholder='Password'
                                type="password"
                                id="inputPassword4"
                                style={styles.input}
                            />
                        </div>
                    </div>
                    <div>
                        <div style={styles.submitButton}>Sign In</div>
                        <div>
                            {/* <div style={styles.signUpText}>Forgot Password?</div> */}
                            <span
                                style={styles.signUpText}
                                onClick={routeToSignUp}
                            >
                                Sign Up Here
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login