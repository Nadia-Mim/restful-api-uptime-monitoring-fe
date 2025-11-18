import { useFormik } from "formik";
import React, { useEffect, useState, useRef } from 'react';
import * as Yup from "yup";
import { getUserInfoByUserId } from '../../api/user/GET';
import Loader from '../common/loader/Loader';
import ResetUserPasswordModal from './ResetUserPasswordModal';
import { updateUserDetails } from "../../api/user/PUT";
import SuccessModal from "../common/modals/successModal/SuccessModal";
import ErrorModal from "../common/modals/errorModal/ErrorModal";
import { CustomModal, CustomModalBody, CustomModalHeader } from '../common/modals/customModal/CustomModal';

const styles = {
    section: {
        marginBottom: '20px',
        background: 'rgba(30, 31, 38, 0.5)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(130, 141, 153, 0.2)'
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#fff',
        marginBottom: '15px',
        borderBottom: '1px solid rgba(130, 141, 153, 0.2)',
        paddingBottom: '8px'
    },
    infoRow: {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid rgba(130, 141, 153, 0.1)'
    },
    label: {
        color: '#9fb0c6',
        fontSize: '13px'
    },
    value: {
        color: '#fff',
        fontSize: '13px',
        fontWeight: 500
    },
    smallText: {
        fontSize: '12px',
        fontWeight: 300,
    },
    inputFieldStyle: {
        width: '97%',
        border: "1px solid rgba(130, 141, 153, 0.5)",
        borderRadius: "5px",
        background: '#1E1F26',
        padding: "8px",
        fontSize: '17px',
        fontWeight: 300,
        color: '#fff'
    },
    blueButton: {
        background: '#4545E6',
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
    const [profileImage, setProfileImage] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(null);
    const fileInputRef = useRef(null);

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
        onSubmit: async (value) => {
            const formData = { ...values };

            // If there's a new profile image, convert to base64
            if (profileImage) {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    formData.profilePicture = reader.result;
                    const response = await updateUserDetails(formData);
                    if (response?.[0]) {
                        setMessage('Profile updated successfully.');
                        setSuccessModalVisible(true);
                    } else {
                        setMessage(response?.[1]);
                        setErrorModalVisible(true);
                    }
                };
                reader.readAsDataURL(profileImage);
            } else {
                const response = await updateUserDetails(formData);
                if (response?.[0]) {
                    setMessage('Profile updated successfully.');
                    setSuccessModalVisible(true);
                } else {
                    setMessage(response?.[1]);
                    setErrorModalVisible(true);
                }
            }
        },
    });

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setMessage('Image size should be less than 5MB');
                setErrorModalVisible(true);
                return;
            }
            setProfileImage(file);
            setProfileImagePreview(URL.createObjectURL(file));
        }
    };

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
        setProfileImage(null);
        setProfileImagePreview(null);
        setSuccessModalVisible(false);
    }

    const actionOnErrorModal = () => {
        setErrorModalVisible(false);
    }

    return (
        <div>
            {showLoader && <Loader />}

            {resetPassModalVisualize && (
                <ResetUserPasswordModal
                    resetPassModalVisualize={resetPassModalVisualize}
                    setResetPassModalVisualize={setResetPassModalVisualize}
                />
            )}

            {successModalVisible && (
                <SuccessModal
                    modalVisible={successModalVisible}
                    actionOnSuccessModal={actionOnSuccessModal}
                    message={message}
                />
            )}

            {errorModalVisible && (
                <ErrorModal
                    modalVisible={errorModalVisible}
                    actionOnErrorModal={actionOnErrorModal}
                    message={message}
                />
            )}

            {/* Header */}
            <div className="glass-toolbar" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: userInfo?.profilePicture ? `url(${userInfo.profilePicture})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 18,
                        fontWeight: 600,
                        color: '#fff'
                    }}>
                        {!userInfo?.profilePicture && `${userInfo?.firstName?.charAt(0) || ''}${userInfo?.lastName?.charAt(0) || ''}`}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>
                        {`${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`}
                    </div>
                </div>
                <span className="glass-badge secondary" style={{ padding: '4px 10px', borderRadius: 10, fontSize: 12 }}>
                    USER PROFILE
                </span>
                <button
                    className="glass-button-primary"
                    style={{ marginLeft: 'auto', padding: '8px 16px', borderRadius: 5 }}
                    onClick={() => {
                        setValues({ ...userInfo });
                        setProfileImagePreview(userInfo?.profilePicture || null);
                        setIsEditable(true);
                    }}
                >
                    Edit Profile
                </button>
            </div>

            {/* User Details */}
            <>
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Account Information</div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>User ID</span>
                        <span style={styles.value}>{userInfo?.userId || 'N/A'}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Full Name</span>
                        <span style={styles.value}>{`${userInfo?.firstName || ''} ${userInfo?.lastName || ''}`}</span>
                    </div>
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Email</span>
                        <span style={styles.value}>{userInfo?.email || 'N/A'}</span>
                    </div>
                    {userInfo?.additionalEmails?.length > 0 && (
                        <div style={styles.infoRow}>
                            <span style={styles.label}>Additional Emails</span>
                            <span style={styles.value}>{userInfo?.additionalEmails?.join(', ')}</span>
                        </div>
                    )}
                    <div style={styles.infoRow}>
                        <span style={styles.label}>Phone Number</span>
                        <span style={styles.value}>{userInfo?.phone || 'N/A'}</span>
                    </div>
                </div>

                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Security</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 4 }}>Password</div>
                            <div style={{ fontSize: 12, color: '#9fb0c6' }}>Change your password to keep your account secure</div>
                        </div>
                        <button
                            className="glass-button-primary"
                            style={{ padding: '8px 16px', borderRadius: 5 }}
                            onClick={() => setResetPassModalVisualize(true)}
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </>

            {/* Edit Profile Modal */}
            <CustomModal visible={isEditable} style={{ maxWidth: '600px' }}>
                <CustomModalHeader onClose={() => {
                    setIsEditable(false);
                    setValues({});
                    setProfileImage(null);
                    setProfileImagePreview(null);
                    resetForm();
                }}>
                    Edit Profile
                </CustomModalHeader>
                <CustomModalBody style={{ padding: '15px 5%', maxHeight: '82vh', overflowY: 'auto' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleProfileImageChange}
                    />

                    {/* Profile Picture Upload */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            background: profileImagePreview ? `url(${profileImagePreview})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 32,
                            fontWeight: 600,
                            color: '#fff',
                            marginBottom: 12,
                            border: '3px solid rgba(130, 141, 153, 0.3)',
                            cursor: 'pointer'
                        }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {!profileImagePreview && `${values?.firstName?.charAt(0) || ''}${values?.lastName?.charAt(0) || ''}`}
                        </div>
                        <button
                            type="button"
                            style={{
                                background: 'transparent',
                                border: '1px solid #4545E6',
                                color: '#4545E6',
                                padding: '6px 12px',
                                borderRadius: 5,
                                fontSize: 12,
                                cursor: 'pointer'
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {profileImagePreview ? 'Change Photo' : 'Upload Photo'}
                        </button>
                        <div style={{ fontSize: 11, color: '#9fb0c6', marginTop: 6 }}>Max size: 5MB</div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ marginBottom: '15px' }}>
                            <div style={styles.smallText} className="required">First Name</div>
                            <input
                                placeholder='Enter first name'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.firstName || ''}
                                onChange={(e) => setValues({ ...values, firstName: e.target.value })}
                                onBlur={handleBlur}
                                name="firstName"
                            />
                            {touched?.firstName && errors?.firstName && (
                                <div style={styles.customError}>{errors?.firstName}</div>
                            )}
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <div style={styles.smallText} className="required">Last Name</div>
                            <input
                                placeholder='Enter last name'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.lastName || ''}
                                onChange={(e) => setValues({ ...values, lastName: e.target.value })}
                                onBlur={handleBlur}
                                name="lastName"
                            />
                            {touched?.lastName && errors?.lastName && (
                                <div style={styles.customError}>{errors?.lastName}</div>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Email</div>
                        <input
                            placeholder='Enter email address'
                            type="email"
                            style={styles.inputFieldStyle}
                            value={values?.email || ''}
                            onChange={(e) => setValues({ ...values, email: e.target.value })}
                            onBlur={handleBlur}
                            name="email"
                        />
                        {touched?.email && errors?.email && (
                            <div style={styles.customError}>{errors?.email}</div>
                        )}
                    </div>

                    {values?.additionalEmails?.map((additionalEmail, index) => (
                        <div key={index} style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                <div style={styles.smallText}>Additional Email {index + 1}</div>
                                <button
                                    type="button"
                                    style={{
                                        background: 'transparent',
                                        border: '1px solid #EF5350',
                                        color: '#EF5350',
                                        padding: '4px 8px',
                                        borderRadius: 4,
                                        fontSize: 11,
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => deleteAdditionalEmail(index)}
                                >
                                    Remove
                                </button>
                            </div>
                            <input
                                placeholder='Enter additional email'
                                type="email"
                                style={styles.inputFieldStyle}
                                value={additionalEmail}
                                onChange={(e) => updateAdditionalEmail(e.target.value, index)}
                            />
                        </div>
                    ))}

                    <button
                        type="button"
                        style={{
                            background: 'transparent',
                            border: '1px solid #4545E6',
                            color: '#4545E6',
                            padding: '8px 16px',
                            borderRadius: 5,
                            fontSize: 13,
                            cursor: 'pointer',
                            marginBottom: 20,
                            width: '100%'
                        }}
                        onClick={() => addAdditionalEmail()}
                    >
                        + Add Additional Email
                    </button>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Phone Number</div>
                        <input
                            placeholder='Enter phone number'
                            type="text"
                            style={styles.inputFieldStyle}
                            value={values?.phone || '880'}
                            onChange={(e) => setValues({ ...values, phone: e.target.value })}
                            onBlur={handleBlur}
                            name="phone"
                        />
                        {touched?.phone && errors?.phone && (
                            <div style={styles.customError}>{errors?.phone}</div>
                        )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '25px 0' }}>
                        <div
                            style={{ ...styles.redButton, marginRight: '15px' }}
                            onClick={() => {
                                setIsEditable(false);
                                setValues({});
                                setProfileImage(null);
                                setProfileImagePreview(null);
                                resetForm();
                            }}
                        >
                            Cancel
                        </div>
                        <div
                            style={{ ...styles.blueButton, width: '120px' }}
                            onClick={handleSubmit}
                        >
                            Save Changes
                        </div>
                    </div>
                </CustomModalBody>
            </CustomModal>
        </div>
    )
}

export default UserProfile