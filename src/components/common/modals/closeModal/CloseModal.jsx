import React, { useState } from 'react'
import '../../Styles/ResponseModal.css';
import CloseIcon from '../../Assets/Icons/CloseIcon.svg';
import ErrorTooltip from './ErrorTooltip';

const styles = {
    modalContent: {
        // display: 'flex',
        flexDirection: 'column',
        // width: '90%',
        margin: 'auto',
        padding: '20px',
    },
    approveButtonHolder: {
        display: 'flex',
        justifyContent: 'center',
        // alignItems: 'center',
        margin: '15px'
    },
    approveText: {
        display: 'flex',
        fontFamily: 'Open Sans',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: '16px',
        color: '#000000',
        margin: '15px 0px 0px 0px',
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
// closeModal = true/false to open Modal
// setCloseModal for modal visibility 
// modalContent = text message to ask confirmation (OPTIONAL)
// modalAction = function call after click yes 

const CloseModal = (props) => {
    const [clickOnYesButton, setClickOnYesButton] = useState(false);
    const [requestBody, setRequestBody] = useState(
        {
            action: "CLOSED",
            remarks: ""
        }
    );

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        var modal = document.getElementById("closeModal");
        if (event.target === modal) {
            props.setCloseModal(false);
        }
    }

    return (
        <div id="closeModal" className="response-modal" style={{ display: "block" }}>

            {/* <!-- Modal content --> */}
            <div className="response-modal-content" style={{ marginTop: "20vh" }}>
                {/* MODAL HEADER */}
                <div className="response-modal-header" style={{
                    color: '#F13C3C'
                }}>
                    <span className="text-xl font-normal float-right text-black hover:text-red-600 hover:font-bold hover:cursor-pointer"
                        onClick={() => props.setCloseModal(false)}>
                        &times;
                    </span>
                </div>
                {/* MODAL BODY */}
                <div className="response-modal-body">
                    <div style={styles.modalContent}>
                        <div className="flex justify-center items-center m-[15px]">
                            <img
                                className="bg-[#FAE6E6] p-7 rounded-full h-24 w-24"
                                src={CloseIcon}
                                alt="Close"
                            />
                        </div>

                        <div style={styles.approveText}>
                            {props?.modalContent ? props?.modalContent : 'Are you sure you want to close this ?'}
                        </div>
                        <br />
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
                                onClick={() => props.setCloseModal(false)}
                            >
                                No
                            </div>
                            <div style={styles.yes} className='focus:shadow-[0px_0px_1px_3px_#eb575736] focus:scale-95' tabIndex={0}
                                onClick={() => {
                                    setClickOnYesButton(true);
                                    props.modalAction(props?.requestId, requestBody);
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

export default CloseModal