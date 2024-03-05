import { useFormik } from "formik";
import React from 'react';
import * as Yup from "yup";
import LoginBackground from '../../images/LoginBackground.jpg';
import { CreateUser } from "../../api/user/POST";
import { useNavigate } from 'react-router-dom';
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
    disabledButton: {
        padding: '6px',
        color: '#333333',
        backgroundColor: '#D3D3D3',
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
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            phone: Yup.string().required('Phone is required'),
            password: Yup.string().required('Password is required'),
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

    console.log(values)


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
                            {touched?.firstName && errors?.firstName && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.firstName} origin={`firstName`} /></span>
                            )}
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='Last Name'
                                type="text"
                                value={values?.lastName}
                                onChange={(e) => setValues({ ...values, lastName: e.target.value })}
                            />
                            {touched?.lastName && errors?.lastName && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.lastName} origin={`lastName`} /></span>
                            )}
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
                            {touched?.email && errors?.email && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.email} origin={`email`} /></span>
                            )}
                        </div>
                        <div style={styles.inputWrapper}>
                            <input
                                style={styles.input}
                                placeholder='Phone'
                                type="number"
                                value={values?.phone}
                                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                            />
                            {touched?.phone && errors?.phone && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.phone} origin={`phone`} /></span>
                            )}
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
                            {touched?.password && errors?.password && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.password} origin={`password`} /></span>
                            )}
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
                            style={values?.tosAgreement ? styles.submitButton : styles.disabledButton}
                            onClick={() => {
                                if (values?.tosAgreement) {
                                    handleSubmit()
                                }
                            }}
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