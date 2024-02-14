import { useFormik } from "formik";
import React from 'react';
import * as Yup from "yup";
import LoginBackground from '../../images/LoginBackground.jpg';
import { CreateUser } from "../../api/user/POST";
import { useNavigate } from 'react-router-dom';

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
        height: '600px',
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

const initialValues = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    tosAgreement: false
}

const SignUp = () => {

    const navigate = useNavigate(); // To route to another page

    const { handleSubmit, handleChange, values, touched, errors, handleBlur, setValues, resetForm, setErrors } = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object().shape({

        }),
        onSubmit: (value) => {
            CreateUser(values).then(response => {
                if (response?.[0]) {
                    routeToLogin();
                }
            })
        },
    });

    const routeToLogin = () => {
        navigate('/login');
    }


    return (
        <div style={styles.backgroundStyle}>
            <div style={styles.containerStyle}>
                <div style={styles.loginWrapper}>
                    <div style={{ textAlign: 'center' }}><h5>Sign Up</h5></div>

                    <div style={{ marginBottom: "15px" }}>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='First Name'
                                type="text"
                                value={values?.firstName}
                                onChange={(e) => setValues({ ...values, firstName: e.target.value })}
                            />
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='Last Name'
                                type="text"
                                value={values?.lastName}
                                onChange={(e) => setValues({ ...values, lastName: e.target.value })}
                            />
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='Email'
                                type="email"
                                id="inputEmail4"
                                value={values?.email}
                                onChange={(e) => setValues({ ...values, email: e.target.value })}
                            />
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='Phone'
                                type="number"
                                value={values?.phone}
                                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                            />
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='Password'
                                type="password"
                                id="inputPassword4"
                                value={values?.password}
                                onChange={(e) => setValues({ ...values, password: e.target.value })}
                            />
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            <input
                                style={styles.checkbox}
                                type="checkbox"
                                value={values?.tosAgreement}
                                onChange={(e) => setValues({ ...values, tosAgreement: e.target.checked })}
                            /> &nbsp; Accept all terms & conditions
                        </div>
                    </div>
                    <div>
                        <div
                            style={styles.submitButton}
                            onClick={handleSubmit}
                        >
                            Create Account
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp