import React, { useEffect } from 'react';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../customModal/CustomModal';
import RejectNewIcon from '../../../../icons/RejectNewIcon.svg';

const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: '38px',
        marginRight: '20px', // Add some margin between icon and text
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#EB5757', // Bright red color for error title
    },
    message: {
        fontSize: '16px',
        fontWeight: '400',
        color: '#fff', // Darker shade of grey for error message
        textAlign: 'center',
    },
};

const ErrorModal = (props) => {
    useEffect(() => {
        setTimeout(() => {
            props.actionOnErrorModal();
        }, 2500);
    }, []);

    return (
        <CustomModal visible={props?.modalVisible}>
            <CustomModalHeader>
                <div style={styles.header}>
                    <img src={RejectNewIcon} alt='Reject Icon' style={styles.icon} />
                    <div style={styles.title}>Failed!</div>
                </div>
            </CustomModalHeader>
            <CustomModalBody>
                <div style={styles.message}>{props?.message}</div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default ErrorModal;
