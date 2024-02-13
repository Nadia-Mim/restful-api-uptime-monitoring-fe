import React, { useState } from 'react'
import '../../Styles/ResponseModal.css';
import Approve from '../../Assets/Icons/ApproveGreen.svg';
import ErrorTooltip from './ErrorTooltip';

const styles = {
    modalContent: {
        display: 'flex',
        flexDirection: 'column',
        width: '98%',
        margin: 'auto',
        padding: '5px 10px 20px 10px',
        // maxHeight: '65vh',
        overflow: 'auto'
    },
    approveButtonHolder: {
        display: 'flex',
        justifyContent: 'center',
        // alignItems: 'center',
        margin: '0px 0px 5px 0px',
    },
    approveText: {
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: '16px',
        color: '#000000',
        margin: '5px 0px 0px 0px',
        textAlign: 'left',
    },
    buttonHolder: {
        display: 'flex',
        width: '100%',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        cursor: 'pointer',
    },
    no: {
        background: '#FAFAFA',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: '12px',
        lineHeight: '16px',
        textAlign: 'center',
        textTransform: 'capitalize',
        padding: '7px 15px',
        color: '#EB5757',
        border: '2px solid #EB5757',
        borderRadius: '4px',
        height: '34px',
        marginRight: '20px',
    },
    yes: {
        background: '#219653',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: '12px',
        lineHeight: '16px',
        textAlign: 'center',
        textTransform: 'capitalize',
        padding: '7px 15px',
        color: '#FFFFFF',
        borderRadius: '4px',
        border: '2px solid #219653',
        height: '34px',
    },
    comment: {
        display: 'flex',
        width: '100%',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '400',
        fontSize: '14px',
        color: '#000000',
        lineHeight: '19px',
        position: 'relative',
    },
    commentText: {
        width: '100%',
        height: '90px',
        padding: '10px 0 0 10px',
        border: '1px solid #BDBDBD',
        borderRadius: '3px'
    },
    customError: {
        position: 'absolute',
        color: 'red',
        right: 0,
        bottom: 0,
        marginRight: '5px'
    }
}

// Expected Props
// approveModal = true/false to open Modal
// setApproveModal for modal visibility 
// modalContent = text message to ask confirmation (OPTIONAL)
// modalAction = function call after click yes 

const SuccessModal = (props) => {
    const [clickOnYesButton, setClickOnYesButton] = useState(false);
    const [requestBody, setRequestBody] = useState(
        {
            action: "APPROVED",
            remarks: ""
        }
    );
    const [attachment, setAttachment] = useState('');
    const [attachmentError, setAttachmentError] = useState('');

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        var modal = document.getElementById("approveModal");
        if (event.target === modal) {
            props.setApproveModal(false);
        }
    }

    const handleUploadedAttachment = (selectedFile) => {
        if (selectedFile?.size > 5000000) {
            setAttachmentError('File size exceeded. Uploaded file should be less than 5MB.');
        } else {
            setAttachmentError('');
            setAttachment(selectedFile);
        }
    }

    return (
        <div id="approveModal" className="response-modal" style={{ display: "block" }}>

            {/* <!-- Modal content --> */}
            <div className="response-modal-content" style={{ marginTop: "20vh" }}>
                {/* MODAL HEADER */}
                <div className="response-modal-header">
                    <span className="text-xl font-normal float-right text-black hover:text-red-600 hover:font-bold hover:cursor-pointer"
                        onClick={() => props.setApproveModal(false)}>
                        &times;
                    </span>
                </div>
                {/* MODAL BODY */}
                <div className="response-modal-body">
                    <div style={styles.modalContent} className='modalBodyContent'>
                        <div style={styles.approveButtonHolder}>
                            <img src={Approve} alt='Approve' />
                        </div>

                        <div style={styles.approveText}>
                            {props?.modalContent ? props?.modalContent : 'Are you sure you want to approve this ?'}
                        </div>
                        <br />


                        {props?.requiresAttachment &&
                            <div
                                style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', fontSize: '12px', marginBottom: '15px', color: '#828282' }}
                            >
                                <label className="mb-2">
                                    Attachment <span className="text-[#ff0000] ml-1">*</span>
                                </label>
                                <input
                                    type="file"
                                    name="file"
                                    onChange={(event) => {
                                        handleUploadedAttachment(event.currentTarget.files[0]);
                                    }}
                                    className="p-2 border rounded w-full"
                                />
                                {attachmentError &&
                                    <span className="absolute right-1 top-9 z-50">
                                        {/* {errors?.file} */}
                                        <ErrorTooltip
                                            content={attachmentError}
                                            origin={"fileOrigin"}
                                        />
                                    </span>
                                }
                            </div>
                        }

                        <div style={styles.comment}>
                            <textarea placeholder='Write reason here' style={styles.commentText} maxLength={250}
                                onChange={(e) => setRequestBody(
                                    {
                                        ...requestBody, remarks: e?.target?.value
                                    }
                                )}
                            />

                            {(requestBody?.remarks === '' && clickOnYesButton) && <span style={{ ...styles?.customError }}>
                                <ErrorTooltip content={'Comment is required.'} origin="rejectModalText" />
                            </span>}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '15px', color: '#828282' }}>
                            <div>Max 250 characters</div>
                            <div>
                                <span>{requestBody?.remarks ? requestBody?.remarks?.length : 0}</span>
                                <span>/ 250</span>
                            </div>
                        </div>

                        {/* Action */}
                        <div style={styles.buttonHolder}>
                            <div style={styles.no} className='focus:shadow-[0px_0px_1px_3px_#eb575736] focus:scale-95' tabIndex={0}
                                onClick={() => props.setApproveModal(false)}
                            >
                                No
                            </div>
                            <div style={styles.yes} className='focus-within:shadow-[0px_0px_1px_3px_#2196534f] focus-within:scale-95' tabIndex={0}
                                onClick={() => {
                                    if (!props?.requiresAttachment) {
                                        setClickOnYesButton(true);
                                        requestBody?.remarks && props.modalAction(props?.requestId, requestBody);
                                    } else {
                                        if (attachment) {
                                            setClickOnYesButton(true);
                                            requestBody?.remarks && props.modalAction(props?.requestId, requestBody, attachment);
                                        } else {
                                            setAttachmentError('Attachment is required.');
                                            setClickOnYesButton(true);
                                        }
                                    }
                                }}
                            >
                                Yes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SuccessModal