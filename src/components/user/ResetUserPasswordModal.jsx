import { useFormik } from "formik";
import React, { useEffect, useState } from 'react';
import * as Yup from "yup";
import { resetPassword } from "../../api/user/PUT";
import ErrorTooltip from "../common/ErrorTooltip/ErrorTooltip";
import { CustomModal, CustomModalBody, CustomModalHeader } from '../common/modals/customModal/CustomModal';
import ErrorModal from "../common/modals/errorModal/ErrorModal";
import SuccessModal from "../common/modals/successModal/SuccessModal";


const styles = {
    smallText: {
        fontSize: '12px',
        fontWeight: 300,
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
    inputFieldStyle: {
        width: '97%',
        // height: '25px',
        border: "1px solid rgba(130, 141, 153, 0.5)",
        borderRadius: "5px",
        background: '#1E1F26',
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

const ResetUserPasswordModal = (props) => {

    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [message, setMessage] = useState('');

    const { handleSubmit, handleChange, values, touched, errors, handleBlur, setValues, resetForm, setErrors } = useFormik({
        initialValues: {},
        validationSchema: Yup.object().shape({
            currentPassword: Yup.string().required('Current Password is required'),
            password: Yup.string().required('New Password is required'),
            reWrittenPassword: Yup.string()
                .required('Re-entered Password is required')
                .oneOf([Yup.ref('password'), null], 'Passwords must match')
        }),
        onSubmit: (value) => {
            resetPassword(values).then(response => {
                if (response?.[0]) {
                    setMessage('Password updated successfully.');
                    setSuccessModalVisible(true);
                } else {
                    setMessage(response?.[1]);
                    setErrorModalVisible(true);
                }
            });
        }
    });

    useEffect(() => {
        setValues({
            userId: authData?.userId,
            currentPassword: "",
            password: "",
            reWrittenPassword: ""
        });
    }, [])

    const actionOnSuccessModal = () => {
        setSuccessModalVisible(false);
        props.setResetPassModalVisualize(false);
    }

    const actionOnErrorModal = () => {
        setErrorModalVisible(false);
    }


    return (
        <div>
            <CustomModal visible={props?.resetPassModalVisualize} style={{ maxWidth: '600px' }}>
                <CustomModalHeader onClose={() => props.setResetPassModalVisualize(false)}>Reset Password</CustomModalHeader>
                <CustomModalBody style={{ padding: '15px 5%' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Current Password</div>
                        <div>
                            <input
                                placeholder='Current Password'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.currentPassword || ""}
                                onChange={(e) => setValues({ ...values, currentPassword: e.target.value })}
                            />
                            {touched?.currentPassword && errors?.currentPassword && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.currentPassword} origin={`currentPassword`} /></span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">New Password</div>
                        <div>
                            <input
                                placeholder='New Password'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.password || ""}
                                onChange={(e) => setValues({ ...values, password: e.target.value })}
                            />
                            {touched?.password && errors?.password && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.password} origin={`password`} /></span>
                            )}
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Confirm New Password</div>
                        <div>
                            <input
                                placeholder='Confirm New Password'
                                type="text"
                                style={styles.inputFieldStyle}
                                value={values?.reWrittenPassword || ""}
                                onChange={(e) => setValues({ ...values, reWrittenPassword: e.target.value })}
                            />
                            {touched?.reWrittenPassword && errors?.reWrittenPassword && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.reWrittenPassword} origin={`reWrittenPassword`} /></span>
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '25px 0' }}>

                        <div
                            style={{ ...styles.redButton, marginRight: '15px' }}
                            onClick={() => props.setResetPassModalVisualize(false)}
                        >
                            Cancel
                        </div>
                        <div
                            style={{ ...styles.blueButton, width: '130px' }}
                            onClick={handleSubmit}
                        >
                            Reset Password
                        </div>
                    </div>
                </CustomModalBody>
            </CustomModal>

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
        </div>
    )
}

export default ResetUserPasswordModal