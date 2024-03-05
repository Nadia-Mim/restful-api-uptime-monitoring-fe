import React, { useEffect } from 'react';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../customModal/CustomModal';
import AcceptIcon from '../../../../icons/AcceptIcon.svg';


const styles = {
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: '50px',
        marginRight: '20px', // Add some margin between icon and text
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#999', // Change color to a darker shade
    },
    message: {
        fontSize: '16px',
        fontWeight: '400',
        color: '#fff', // Change color to a slightly darker shade
        textAlign: 'center',
    },
};

const SuccessModal = (props) => {

    useEffect(() => {
        setTimeout(() => {
            props.actionOnSuccessModal();
        }, 2500);
    }, []);


    return (
        <CustomModal visible={props?.modalVisible}>
            <CustomModalHeader>
                <div style={styles.header}>
                    <img src={AcceptIcon} alt='Tick Icon' style={styles.icon} />
                    <div style={styles.title}>Success!</div>
                </div>
            </CustomModalHeader>
            <CustomModalBody>
                <div style={styles.message}>{props?.message}</div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default SuccessModal;
