import { useFormik } from "formik";
import React, { useEffect, useState } from 'react';
import * as Yup from "yup";
import { getUserInfoByUserId } from '../../api/user/GET';
import UserCardBackground from '../../images/UserCardBackground.jpg';
import Loader from '../common/loader/Loader';
import ResetUserPasswordModal from './ResetUserPasswordModal';
import { updateUserDetails } from "../../api/user/PUT";
import ErrorTooltip from "../common/ErrorTooltip/ErrorTooltip";
import SuccessModal from "../common/modals/successModal/SuccessModal";
import ErrorModal from "../common/modals/errorModal/ErrorModal";
import AddIcon from "../../icons/AddIcon.svg";
import MinusIcon from "../../icons/MinusIcon.svg";

const styles = {
    card: {
        backgroundImage: `url(${UserCardBackground})`,
        backgroundPosition: 'left',
        width: '100%',
        height: '170px',
        // background: '#1E1F26',
        boxShadow: '0px 4px 1rem #000',
        display: 'flex',
        alignItems: 'center'
    },
    largeText: {
        fontSize: '18px',
        fontWeight: 400,
    },
    smallText: {
        fontSize: '12px',
        fontWeight: 300,
    },
    userInfoTitle: {
        width: '150px',
    },
    userInfo: {
        fontWeight: 600,
    },
    blueButton: {
        background: '#4545E6',
        width: '130px',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    redButton: {
        background: '#F52D2D',
        width: '55px',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    editIconStyle: {
        height: '20px',
        width: "20px",
        borderRadius: "50%",
        border: '2px solid white',
        background: "black",
        padding: "5px",
        cursor: 'pointer',
        position: 'absolute',
        left: 270,
        top: 250
    },
    inputFieldStyle: {
        width: '97%',
        border: "1px solid rgba(255, 255, 255, 0.14)",
        borderRadius: "10px",
        background: 'rgba(255,255,255,0.03)',
        padding: "8px",
        fontSize: '17px',
        fontWeight: 300,
        color: '#fff'
    },
    customError: {
        float: "right",
        marginRight: "6px",
        marginTop: "-30px",
        position: "relative",
        zIndex: 2,
        color: "red",
    }
}

const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};

const UserProfile = () => {

    const [userInfo, setUserInfo] = useState({});
    const [reload, setReload] = useState(false);
    const [isEditable, setIsEditable] = useState(false);

    const [resetPassModalVisualize, setResetPassModalVisualize] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (authData?.userId) {
            setShowLoader(true);
            getUserInfoByUserId(authData?.userId).then(response => {
                setShowLoader(false);
                if (response?.[0]) {
                    setUserInfo(response?.[0]);
                } else {
                    setUserInfo({});
                }
            });
        }
    }, [reload])

    const { handleSubmit, handleChange, values, touched, errors, handleBlur, setValues, resetForm, setErrors } = useFormik({
        initialValues: {},
        validationSchema: Yup.object().shape({
            firstName: Yup.string().required('First Name is required'),
            lastName: Yup.string().required('Last Name is required'),
            email: Yup.string().email('Invalid email').required('Email is required'),
            phone: Yup.string().required('Phone is required'),
        }),
        onSubmit: (value) => {
            updateUserDetails(values).then(response => {
                if (response?.[0]) {
                    setMessage('User information updated successfully.')
                    setSuccessModalVisible(true);
                } else {
                    setMessage(response?.[1]);
                    setErrorModalVisible(true);
                }
            })
        },
    });

    const addAdditionalEmail = () => {
        setValues({
            ...values,
            additionalEmails: values?.additionalEmails?.length > 0 ? [...values?.additionalEmails, ""] : [""]
        })
    }

    const updateAdditionalEmail = (updatedValue, index) => {
        const updatedAdditionalEmails = [...values.additionalEmails];
        updatedAdditionalEmails[index] = updatedValue;
        setValues({
            ...values,
            additionalEmails: updatedAdditionalEmails
        });
    }

    const deleteAdditionalEmail = (index) => {
        const updatedAdditionalEmails = [...values.additionalEmails];
        updatedAdditionalEmails.splice(index, 1);
        setValues({
            ...values,
            additionalEmails: updatedAdditionalEmails
        });
    };

    const actionOnSuccessModal = () => {
        setReload(!reload);
        setIsEditable(false);
        setValues({});
        setSuccessModalVisible(false);
    }

    const actionOnErrorModal = () => {
        setErrorModalVisible(false);
    }

    console.log(values)

    return (
        <div>

            {showLoader &&
                <Loader />
            }

            {resetPassModalVisualize &&
                <ResetUserPasswordModal
                    resetPassModalVisualize={resetPassModalVisualize}
                    setResetPassModalVisualize={setResetPassModalVisualize}
                />
            }

            {successModalVisible &&
                <SuccessModal
                    modalVisible={successModalVisible}
                    actionOnSuccessModal={actionOnSuccessModal}
                    message={message}
                />
            }

            {errorModalVisible &&
                <ErrorModal
                    modalVisible={errorModalVisible}
                    actionOnErrorModal={actionOnErrorModal}
                    message={message}
                />
            }


            <div style={{ marginBottom: '25px' }}>
                <div style={styles.card} className="glass-panel">
                    <span style={{ fontSize: '35px', fontWeight: 600, marginLeft: '25px' }}>
                        {`${userInfo?.firstName} ${userInfo?.lastName}`}
                    </span>
                </div>
            </div>

            <div style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600, fontSize: '20px' }}>User Details</div>

                    <div>
                        <div
                            style={{ ...styles.blueButton, width: '90px' }}
                            className="glass-button-primary"
                            onClick={() => {
                                setValues({ ...userInfo });
                                setIsEditable(true);
                            }}
                        >
                            Edit Details
                        </div>
                    </div>
                </div>
                <hr />
            </div>


            {/* User Details */}
            {isEditable ?
                <div className="user-info-edit glass-card" style={{ padding: '16px' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">First Name</div>
                        <div>
                            <input
                                className="glass-input"
                                placeholder='Type First Name'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.firstName}
                                onChange={(e) => setValues({ ...values, firstName: e.target.value })}
                            />
                            {touched?.firstName && errors?.firstName && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.firstName} origin={`firstName`} /></span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Last Name</div>
                        <div>
                            <input
                                className="glass-input"
                                placeholder='Type Last Name'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.lastName}
                                onChange={(e) => setValues({ ...values, lastName: e.target.value })}
                            />
                            {touched?.lastName && errors?.lastName && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.lastName} origin={`lastName`} /></span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Email</div>
                        <div>
                            <input
                                className="glass-input"
                                placeholder='Type Email'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.email}
                                onChange={(e) => setValues({ ...values, email: e.target.value })}
                            />
                            {touched?.email && errors?.email && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.email} origin={`email`} /></span>
                            )}
                        </div>
                    </div>

                    {values?.additionalEmails?.length > 0 &&
                        values?.additionalEmails?.map((additionalEmail, index) => {
                            return (
                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText}>Additional Email {index + 1}</div>
                                    <div>
                                        <input
                                            className="glass-input"
                                            placeholder='Type Additional Email'
                                            type="text"
                                            style={styles.inputFieldStyle}
                                            value={additionalEmail}
                                            onChange={(e) => updateAdditionalEmail(e.target.value, index)}
                                        />
                                    </div>
                                    <div
                                        style={{ marginBottom: '15px', color: 'blue', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => deleteAdditionalEmail(index)}
                                    >
                                        <img src={MinusIcon} />
                                        Remove Email
                                    </div>
                                </div>
                            )
                        })
                    }


                    <div
                        style={{ marginBottom: '15px', color: 'blue', display: 'flex', gap: '10px', alignItems: 'center', cursor: 'pointer' }}
                        onClick={() => addAdditionalEmail()}
                    >
                        <img src={AddIcon} />
                        Add Additional Email
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Phone No.</div>
                        <div>
                            <input
                                className="glass-input"
                                placeholder='Type Phone'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.phone ? values?.phone : '880'}
                                onChange={(e) => setValues({ ...values, phone: e.target.value })}
                            />
                            {touched?.phone && errors?.phone && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.phone} origin={`phone`} /></span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>

                        <div
                            style={{ ...styles.redButton, marginRight: '15px' }}
                            className="glass-button-danger"
                            onClick={() => setIsEditable(false)}
                        >
                            Cancel
                        </div>

                        <div
                            style={{ ...styles.blueButton, width: '105px' }}
                            className="glass-button-primary"
                            onClick={handleSubmit}
                        >
                            Update User
                        </div>
                    </div>
                </div>
                :
                <div>
                    <div style={{ display: 'flex', marginBottom: '25px' }}>
                        <div style={styles?.userInfoTitle}>User Id</div>
                        <div className='user-info-show'>
                            {userInfo?.userId ? `: ${userInfo?.userId}` : ': N/A'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '25px' }}>
                        <div style={styles?.userInfoTitle}>User Name</div>
                        <div className='user-info-show'>
                            {`: ${userInfo?.firstName} ${userInfo?.lastName}`}
                        </div>
                    </div>

                    <div style={{ display: 'flex', marginBottom: '25px' }}>
                        <div style={styles?.userInfoTitle}>Email</div>
                        <div className='user-info-show'>
                            {userInfo?.email ? `: ${userInfo?.email}` : 'N/A'}
                        </div>
                    </div>

                    {userInfo?.additionalEmails?.length > 0 &&
                        <div style={{ display: 'flex', marginBottom: '25px' }}>
                            <div style={styles?.userInfoTitle}>Additional Emails</div>
                            <div className='user-info-show'>
                                {userInfo?.additionalEmails?.length && `: ${userInfo?.additionalEmails?.join(', ')}`}
                            </div>
                        </div>
                    }

                    <div style={{ display: 'flex', marginBottom: '25px' }}>
                        <div style={styles?.userInfoTitle}>Phone No.</div>
                        <div className='user-info-show'>
                            {userInfo?.phone ? `: ${userInfo?.phone}` : 'N/A'}
                        </div>
                    </div>

                    <div>
                        <div
                            style={styles.blueButton}
                            className="glass-button-primary"
                            onClick={() => setResetPassModalVisualize(true)}
                        >
                            Reset Password
                        </div>
                    </div>
                </div>
            }




        </div>
    )
}

export default UserProfile