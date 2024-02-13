import { useFormik } from "formik";
import React from 'react';
import Select from "react-select";
import * as Yup from "yup";
import { CustomModal, CustomModalBody, CustomModalHeader } from '../common/modals/customModal/CustomModal';

const styles = {
    largeText: {
        fontSize: '35px',
        fontWeight: 400,
    },
    smallText: {
        fontSize: '12px',
        fontWeight: 300,
    },
    blueButton: {
        background: '#4545E6',
        width: '150px',
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
    selectStyle: {
        control: (styles) => ({
            ...styles,
            backgroundColor: '#1E1F26',
            borderColor: "rgba(130, 141, 153, 0.5)",
            color: '#FFFFFF',
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isSelected ? '#4545E6' : '#1E1F26',
            color: isSelected ? '#FFFFFF' : '#FFFFFF',
            ':hover': {
                backgroundColor: isFocused ? '#45464D' : '#1E1F26',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',
            fontWeight: 300
        }),
    }
}

const protocolOptions = [
    { label: 'http', value: 'http' },
    { label: 'https', value: 'https' }
]

const methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'http' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'http' }
]

const statusCodeOptions = [
    { label: '100 - Continue', value: '100' },
    { label: '101 - Switching Protocols', value: '101' },
    { label: '200 - OK', value: '200' },
    { label: '201 - Created', value: '201' },
    { label: '202 - Accepted', value: '202' },
    { label: '203 - Non-Authoritative Information', value: '203' },
    { label: '204 - No Content', value: '204' },
    { label: '205 - Reset Content', value: '205' },
    { label: '206 - Partial Content', value: '206' },
    { label: '300 - Multiple Choices', value: '300' },
    { label: '301 - Moved Permanently', value: '301' },
    { label: '302 - Found', value: '302' },
    { label: '303 - See Other', value: '303' },
    { label: '304 - Not Modified', value: '304' },
    { label: '305 - Use Proxy', value: '305' },
    { label: '307 - Temporary Redirect', value: '307' },
    { label: '308 - Permanent Redirect', value: '308' },
    { label: '400 - Bad Request', value: '400' },
    { label: '401 - Unauthorized', value: '401' },
    { label: '402 - Payment Required', value: '402' },
    { label: '403 - Forbidden', value: '403' },
    { label: '404 - Not Found', value: '404' },
    { label: '405 - Method Not Allowed', value: '405' },
    { label: '406 - Not Acceptable', value: '406' },
    { label: '407 - Proxy Authentication Required', value: '407' },
    { label: '408 - Request Timeout', value: '408' },
    { label: '409 - Conflict', value: '409' },
    { label: '410 - Gone', value: '410' },
    { label: '411 - Length Required', value: '411' },
    { label: '412 - Precondition Failed', value: '412' },
    { label: '413 - Payload Too Large', value: '413' },
    { label: '414 - URI Too Long', value: '414' },
    { label: '415 - Unsupported Media Type', value: '415' },
    { label: '416 - Range Not Satisfiable', value: '416' },
    { label: '417 - Expectation Failed', value: '417' },
    { label: '418 - I\'m a teapot', value: '418' },
    { label: '421 - Misdirected Request', value: '421' },
    { label: '422 - Unprocessable Entity', value: '422' },
    { label: '423 - Locked', value: '423' },
    { label: '424 - Failed Dependency', value: '424' },
    { label: '426 - Upgrade Required', value: '426' },
    { label: '428 - Precondition Required', value: '428' },
    { label: '429 - Too Many Requests', value: '429' },
    { label: '431 - Request Header Fields Too Large', value: '431' },
    { label: '451 - Unavailable For Legal Reasons', value: '451' },
    { label: '500 - Internal Server Error', value: '500' },
    { label: '501 - Not Implemented', value: '501' },
    { label: '502 - Bad Gateway', value: '502' },
    { label: '503 - Service Unavailable', value: '503' },
    { label: '504 - Gateway Timeout', value: '504' },
    { label: '505 - HTTP Version Not Supported', value: '505' },
    { label: '506 - Variant Also Negotiates', value: '506' },
    { label: '507 - Insufficient Storage', value: '507' },
    { label: '508 - Loop Detected', value: '508' },
    { label: '510 - Not Extended', value: '510' },
    { label: '511 - Network Authentication Required', value: '511' }
];

const initialValues = {

}

const AddNewApiModal = (props) => {

    const { handleSubmit, handleChange, values, touched, errors, handleBlur, setValues, resetForm, setErrors } = useFormik({
        initialValues: initialValues,
        validationSchema: Yup.object().shape({

        }),
        onSubmit: (value) => {

        },
    });

    return (
        <div>
            <CustomModal visible={props?.addNewApiModalVisualize} style={{ maxWidth: '600px' }}>
                <CustomModalHeader onClose={() => props.setAddNewApiModalVisualize(false)}>Add New Check</CustomModalHeader>
                <CustomModalBody style={{ padding: '15px 5%' }}>
                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText}>URL Path</div>
                        <div>
                            <input placeholder='Type URL' type="text" style={styles.inputFieldStyle} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText}>Protocol</div>
                        <div>
                            <Select
                                // onChange={(e) => {
                                //     setSimId(e.id)
                                // }}
                                options={protocolOptions}
                                // value={allNumber.filter(item => item.id === simId)}
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
                                placeholder={'Select Protocol'}
                                styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                    </div>


                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText}>Method</div>
                        <div>
                            <Select
                                // onChange={(e) => {
                                //     setSimId(e.id)
                                // }}
                                options={methodOptions}
                                // value={allNumber.filter(item => item.id === simId)}
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
                                placeholder={'Select Method'}
                                styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText}>Success Codes</div>
                        <div>
                            <Select
                                // onChange={(e) => {
                                //     setSimId(e.id)
                                // }}
                                options={statusCodeOptions}
                                // value={allNumber.filter(item => item.id === simId)}
                                isMulti
                                className="basic-multi-select"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
                                placeholder={'Select Protocol'}
                                styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText}>Timeout seconds (must be less than 10)</div>
                        <div>
                            <input placeholder='Timeout seconds' type="text" style={styles.inputFieldStyle} />
                        </div>
                    </div>


                    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '25px 0' }}>

                        <div
                            style={{ ...styles.redButton, marginRight: '15px' }}
                            onClick={() => props.setAddNewApiModalVisualize(false)}
                        >
                            Cancel
                        </div>
                        <div
                            style={styles.blueButton}
                        // onClick={() => setAddNewApiModalVisualize(true)}
                        >
                            Create New Check
                        </div>
                    </div>


                </CustomModalBody>
            </CustomModal>
        </div>
    )
}

export default AddNewApiModal