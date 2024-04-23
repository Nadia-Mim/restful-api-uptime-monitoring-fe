import { useFormik } from "formik";
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Yup from "yup";
import { crateTokenToLoginUser } from "../../api/token/POST";
import LoginBackground from '../../images/LoginBackground.jpg';
import AuthContext from "../../contexts/AuthContext";
import ErrorTooltip from "../common/ErrorTooltip/ErrorTooltip";

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
        margin: '30px 5px'
    },
    input: {
        width: '100%',
        padding: '0 5px',
        height: '40px',
        fontSize: '16px',
        border: 'none',
        background: 'none',
        outline: 'none'
    },
    customError: {
        float: "right",
        marginRight: "6px",
        marginTop: "-30px",
        position: "relative",
        zIndex: 2,
        color: "red",
        fontSize: '14px'
    }
}

const initialValues = {
    userName: "",
    password: ""
}


const Login = () => {

    const authContextConsumer = useContext(AuthContext);
    const navigate = useNavigate(); // To route to another page

    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        // If there is existing authentication stored in local storage and expiry is not exceeded then 
        // go to dashboard directly.
        let authData = JSON.parse(localStorage.getItem('authData'));
        if (authData && authData?.expires > Date.now()) {
            routeToDashboard();
            authContextConsumer.setAuthData(authData);
        }
    }, [])

    const { handleSubmit, handleChange, values, touched, errors, handleBlur, setValues, resetForm, setErrors } = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object().shape({
            userName: Yup.string().required('Username is required'),
            password: Yup.string().required('Password is required'),
        }),
        onSubmit: (value) => {
            crateTokenToLoginUser(values).then(response => {
                if (response?.[0]) {
                    localStorage.setItem("authData", JSON.stringify(response?.[0]));
                    authContextConsumer.setAuthData(response?.[0]);
                    routeToDashboard();
                } else {
                    setErrorMessage(response?.[1]);
                }
            })
        },
    });

    const routeToDashboard = () => {
        navigate('/dashboard');
    }

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
                                placeholder='Username'
                                type="email"
                                id="inputEmail4"
                                style={styles.input}
                                value={values?.userName}
                                onChange={(e) => setValues({ ...values, userName: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit();
                                    }
                                }}
                            />
                            {touched?.userName && errors?.userName && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.userName} origin={`userName`} /></span>
                            )}
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                placeholder='Password'
                                type="password"
                                id="inputPassword4"
                                style={styles.input}
                                value={values?.password}
                                onChange={(e) => setValues({ ...values, password: e.target.value })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSubmit();
                                    }
                                }}
                            />
                            {touched?.password && errors?.password && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.password} origin={`password`} /></span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div style={styles.submitButton} onClick={handleSubmit}>Sign In</div>
                        <div>
                            <span
                                style={styles.signUpText}
                                onClick={routeToSignUp}
                            >
                                Sign Up Here
                            </span>
                        </div>
                    </div>

                    {/* Error Message */}
                    <div style={{ color: 'red', fontSize: '14px', fontWeight: 400 }}>
                        {errorMessage ? `* ${errorMessage}` : ''}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login