import React from 'react'
import { CustomModal, CustomModalBody, CustomModalHeader } from '../customModal/CustomModal'


const styles = {
    transparentButton: {
        width: '55px',
        padding: '10px',
        cursor: 'pointer',
        border: '2px solid #4545E6',
        borderRadius: '5px'
    },
    redButton: {
        background: '#F52D2D',
        width: '55px',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px'
    }
}


const DeleteModal = (props) => {
    return (
        <div>
            <CustomModal visible={props?.deleteModalVisible}>

                <CustomModalHeader onClose={() => props.setDeleteModalVisible(false)}>
                    Delete API Check
                </CustomModalHeader>
                
                <CustomModalBody style={{ padding: '15px 5%' }}>
                    <div style={{ marginBottom: '35px' }}>
                        {props?.message ? props?.message : 'Are you sure you want to delete this?'}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '25px 0' }}>

                        <div
                            style={{ ...styles.transparentButton, marginRight: '15px' }}
                            onClick={() => props.setDeleteModalVisible(false)}
                        >
                            Cancel
                        </div>
                        <div
                            style={styles.redButton}
                            onClick={() => props.actionOnDeleteModal(props?.requestId)}
                        >
                            Delete
                        </div>
                    </div>
                </CustomModalBody>
            </CustomModal>
        </div>
    )
}

export default DeleteModal