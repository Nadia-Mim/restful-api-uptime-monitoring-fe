import React, { useState } from 'react'
import RejectIcon from '../../Assets/Icons/RejectIcon.svg';
import ErrorTooltip from './ErrorTooltip';
import '../../Styles/ResponseModal.css';

const styles = {
    modalContent: {
        // display: 'flex',
        flexDirection: 'column',
        // width: '90%',
        margin: 'auto',
        padding: '20px',
    },
    rejectButtonHolder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '5px',
    },
    rejectText: {
        display: 'flex',
        justifyContent: 'center',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: '16px',
        color: '#000000',
        margin: '15px 0px 20px 0px',
        textAlign: 'left',
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
        margin: '15px 0px 0px 0px',
        position: 'relative'
    },
    commentText: {
        width: '100%',
        height: '95px',
        padding: '10px 0 0 10px',
        border: '1px solid #BDBDBD',
        borderRadius: '3px'
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
        background: ' #EB5757',
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
        border: '2px solid  #EB5757',
        height: '34px',
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
// rejectModal = true/false to open Modal
// setRejectModal for modal visibility 
// modalContent = text message to ask confirmation (OPTIONAL)
// modalAction = function call after click yes 

const RejectModal = (props) => {
    const [clickOnYesButton, setClickOnYesButton] = useState(false);
    const [requestBody, setRequestBody] = useState(
        {
            action: "REJECTED",
            remarks: ""
        }
    );

    const [attachment, setAttachment] = useState('');
    const [attachmentError, setAttachmentError] = useState('');

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        var modal = document.getElementById("rejectModal");
        if (event.target === modal) {
            props.setRejectModal(false);
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

    console.log(attachmentError, 'attachmentError')

    return (
        <div id="rejectModal" className="response-modal" style={{ display: "block" }}>

            {/* <!-- Modal content --> */}
            <div className="response-modal-content" style={{ marginTop: "20vh" }}>
                {/* MODAL HEADER */}
                <div className="response-modal-header">
                    <span className="text-xl font-normal float-right text-black hover:text-red-600 hover:font-bold hover:cursor-pointer"
                        onClick={() => props.setRejectModal(false)}>
                        &times;
                    </span>
                </div>
                {/* MODAL BODY */}
                <div className="response-modal-body">
                    <div style={styles.modalContent}>
                        <div style={styles.rejectButtonHolder}>
                            <img className='w-12' src={RejectIcon} alt='Reject' />
                        </div>

                        <div style={styles.rejectText}>
                            {props?.modalContent ? props?.modalContent : 'Are you sure you want to reject this ?'}
                        </div>

                        {props?.requiresAttachment &&
                            <div
                                style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', fontSize: '12px', marginBottom: '15px', color: '#828282' }}
                            >
                                <label className="mb-2">
                                    Attachment
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
                                <ErrorTooltip content={'Reason is required.'} origin="rejectModalText" />
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
                                onClick={() => props.setRejectModal(false)}
                            >
                                No
                            </div>
                            <div style={styles.yes} className='focus:shadow-[0px_0px_1px_3px_#eb575736] focus:scale-95' tabIndex={0}
                                onClick={() => {
                                    if (!props?.requiresAttachment) {
                                        setClickOnYesButton(true);
                                        requestBody?.remarks && props.modalAction(props?.requestId, requestBody);
                                    } else {
                                        if (attachment) {
                                            setClickOnYesButton(true);
                                            requestBody?.remarks && props.modalAction(props?.requestId, requestBody, attachment);
                                        } else {
                                            setClickOnYesButton(true);
                                            requestBody?.remarks && props.modalAction(props?.requestId, requestBody);
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

export default RejectModal