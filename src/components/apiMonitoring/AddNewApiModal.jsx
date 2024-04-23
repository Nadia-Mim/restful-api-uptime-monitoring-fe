import { useFormik } from "formik";
import React, { useEffect, useState } from 'react';
import Select from "react-select";
import * as Yup from "yup";
import { addNewChecks } from "../../api/apiChecks/POST";
import { updateCheck } from "../../api/apiChecks/PUT";
import ErrorTooltip from '../../components/common/ErrorTooltip/ErrorTooltip';
import CircularAddIcon from '../../icons/CircularAddIcon.svg';
import CircularMinusIcon from '../../icons/CircularMinusIcon.svg';
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

const protocolOptions = [
    { label: 'http', value: 'http' },
    { label: 'https', value: 'https' }
]

const methodOptions = [
    { label: 'GET', value: 'GET' },
    { label: 'POST', value: 'POST' },
    { label: 'PUT', value: 'PUT' },
    { label: 'DELETE', value: 'POST' }
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

const checkSampleData = {
    group: '',
    protocol: '',
    url: '',
    method: '',
    successCodes: [],
    timeoutSeconds: 1,
    isActive: true,
    serviceName: ''
};


const AddNewApiModal = (props) => {

    const [purpose, setPurpose] = useState('ADD');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [message, setMessage] = useState('');

    const { handleSubmit, handleChange, values, touched, errors, handleBlur, setValues, resetForm, setErrors } = useFormik({
        initialValues: {},
        validationSchema: Yup.object().shape({
            checks: Yup.array().of(
                Yup.object().shape({
                    group: Yup.string().required('Group Name is required'),
                    protocol: Yup.string().required('Protocol is required'),
                    url: Yup.string().required('URL is required'),
                    method: Yup.string().required('Method is required'),
                    serviceName: Yup.string().required('Service Name is required'),
                    successCodes: Yup.array().of(Yup.string().required('Success code is required')).min(1, 'At least one success code is required'),
                    timeoutSeconds: Yup.number().required('Timeout seconds is required').min(1, 'Timeout seconds must be greater than 0').max(10, 'Timeout seconds must be less than or equal to 10'),
                    isActive: Yup.boolean()
                })
            )
        }),
        onSubmit: (value) => {
            if (purpose === 'ADD') {
                addNewChecks(values).then(response => {
                    if (response?.[0]) {
                        props.setSelectedApiCheckToEdit({});
                        setMessage('API Check(s) added successfully.')
                        setSuccessModalVisible(true);
                    } else {
                        setMessage(response?.[1]);
                        setErrorModalVisible(true);
                    }
                });
            } else {
                updateCheck(values).then(response => {
                    if (response?.[0]) {
                        props.setSelectedApiCheckToEdit({});
                        setMessage('API Check updated successfully.')
                        setSuccessModalVisible(true);
                    } else {
                        setMessage(response?.[1]);
                        setErrorModalVisible(true);
                    }
                });
            }
        },
    });

    useEffect(() => {

        if (props?.selectedApiCheckToEdit && Object.keys(props?.selectedApiCheckToEdit)?.length > 0) {
            setPurpose('EDIT');
            setValues({
                checks: [{ ...props?.selectedApiCheckToEdit }]
            });
        } else {
            setPurpose('ADD');
            setValues({
                checks: [{ ...checkSampleData }]
            });
        }
    }, [props])

    const addMoreApiCheck = () => {
        setValues({
            checks: [
                ...values?.checks,
                { ...checkSampleData }
            ]
        });
    }

    const removeCheck = (index) => {
        let checkData = values?.checks;
        checkData.splice(index, 1);
        setValues({
            checks: [...checkData]
        });
    }

    const updateGroupOfAllChecks = (group) => {
        let checkData = values?.checks?.map(check => ({
            ...check,
            group
        }))
        setValues({
            checks: [...checkData]
        });
    }

    const handleCheckInput = (fieldName, value, index) => {
        let checkData = values?.checks;

        checkData[index] = {
            ...checkData?.[index],
            [fieldName]: fieldName === 'timeoutSeconds' ? Number(value) : value
        }

        setValues({
            checks: [...checkData]
        });
    }

    const handleSuccessCodeMultiSelect = (selectedOptions, index) => {
        let statusCodes = selectedOptions?.map(selectedOption => selectedOption?.value);

        let checkData = values?.checks;
        checkData[index]['successCodes'] = statusCodes;

        setValues({
            checks: [...checkData]
        });
    }

    const actionOnSuccessModal = () => {
        props.setReload(!props?.reload);
        setSuccessModalVisible(false);
        props.setSelectedGroup(values?.checks?.[0]?.group);
        closeModal();
    }

    const actionOnErrorModal = () => {
        setErrorModalVisible(false);
    }

    const closeModal = () => {
        props.setSelectedApiCheckToEdit({});
        props.setAddNewApiModalVisualize(false);
    }

    return (
        <div>

            <CustomModal visible={props?.addNewApiModalVisualize} style={{ maxWidth: '600px' }}>
                <CustomModalHeader
                    onClose={() => {
                        closeModal()
                    }}
                >
                    {purpose === 'ADD' ? 'Add New API Checks' : 'Edit API Check'}
                </CustomModalHeader>
                <CustomModalBody style={{ padding: '15px 5%', height: '82vh', overflowY: 'auto' }}>

                    {/* Group */}
                    <div style={{ marginBottom: '15px' }}>
                        <div style={styles.smallText} className="required">Group Name</div>
                        <div>
                            <Select
                                value={props?.groupOptions?.filter(clusterOption => clusterOption?.value === values?.checks?.[0].group)?.[0]}
                                onChange={(e) => {
                                    props.setSelectedGroup(e?.value);
                                    updateGroupOfAllChecks(e.value === "Other" ? '' : e.value);
                                }}
                                options={props?.groupOptions?.filter(group => group?.value !== 'All')}
                                menuPortalTarget={document.body}
                                menuPlacement="auto"
                                placeholder={'Select Group'}
                                styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            />
                            {props?.selectedGroup === 'Other' &&
                                <input
                                    placeholder='Type New Group Name'
                                    type="text"
                                    style={{ ...styles.inputFieldStyle, marginTop: '20px' }}
                                    value={values?.group}
                                    onChange={(e) => updateGroupOfAllChecks(e.target.value)}
                                />
                            }
                            {touched?.checks?.[0].group && errors?.checks?.[0].group && (
                                <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[0].group} origin={`method`} /></span>
                            )}
                        </div>
                    </div>

                    {values?.checks?.map((checkData, index) => {
                        return (
                            <div
                                key={`checkData-${index}`}
                                style={{ marginTop: index > 0 && '30px' }}
                            >

                                {values?.checks?.length > 1 &&
                                    <div>
                                        {`API Check ${index + 1}`}
                                    </div>
                                }

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText} className="required">URL Path</div>
                                    <div>
                                        <input
                                            placeholder='Type URL'
                                            type="text"
                                            style={styles.inputFieldStyle}
                                            value={checkData?.url}
                                            onChange={(e) => handleCheckInput('url', e.target.value, index)}
                                        />
                                        {touched?.checks?.[index].url && errors?.checks?.[index].url && (
                                            <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[index].url} origin={`url`} /></span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText} className="required">Service Name</div>
                                    <div>
                                        <input
                                            placeholder='Type Service Name'
                                            type="text"
                                            style={styles.inputFieldStyle}
                                            value={checkData?.serviceName}
                                            onChange={(e) => handleCheckInput('serviceName', e.target.value, index)}
                                        />
                                        {touched?.checks?.[index].serviceName && errors?.checks?.[index].serviceName && (
                                            <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[index].serviceName} origin={`serviceName`} /></span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText} className="required">Protocol</div>
                                    <div>
                                        <Select
                                            value={protocolOptions?.filter(protocolOption => protocolOption?.value === checkData?.protocol)?.[0]}
                                            onChange={(e) => handleCheckInput('protocol', e.value, index)}
                                            options={protocolOptions}
                                            menuPortalTarget={document.body}
                                            menuPlacement="auto"
                                            placeholder={'Select Protocol'}
                                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                        {touched?.checks?.[index].protocol && errors?.checks?.[index].protocol && (
                                            <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[index].protocol} origin={`protocol`} /></span>
                                        )}
                                    </div>
                                </div>


                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText} className="required">Method</div>
                                    <div>
                                        <Select
                                            value={methodOptions?.filter(methodOption => methodOption?.value === checkData?.method)?.[0]}
                                            onChange={(e) => handleCheckInput('method', e.value, index)}
                                            options={methodOptions}
                                            menuPortalTarget={document.body}
                                            menuPlacement="auto"
                                            placeholder={'Select Method'}
                                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                        {touched?.checks?.[index].method && errors?.checks?.[index].method && (
                                            <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[index].method} origin={`method`} /></span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText} className="required">Success Codes</div>
                                    <div>
                                        <Select
                                            value={statusCodeOptions?.filter(statusCodeOption => checkData?.successCodes?.includes(statusCodeOption?.value))}
                                            onChange={(e) => handleSuccessCodeMultiSelect(e, index)}
                                            options={statusCodeOptions}
                                            isMulti
                                            className="basic-multi-select"
                                            classNamePrefix="select"
                                            menuPortalTarget={document.body}
                                            menuPlacement="auto"
                                            placeholder={'Select Protocol'}
                                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        />
                                        {touched?.checks?.[index].successCodes && errors?.checks?.[index].successCodes && (
                                            <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[index].successCodes} origin={`successCodes`} /></span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '15px' }}>
                                    <div style={styles.smallText} className="required">Timeout seconds (must be less than 10)</div>
                                    <div>
                                        <input
                                            placeholder='Timeout seconds'
                                            type="text"
                                            style={styles.inputFieldStyle}
                                            value={checkData?.timeoutSeconds}
                                            onChange={(e) => handleCheckInput('timeoutSeconds', e.target.value, index)}
                                        />
                                        {touched?.checks?.[index].timeoutSeconds && errors?.checks?.[index].timeoutSeconds && (
                                            <span style={styles.customError}><ErrorTooltip content={errors?.checks?.[index].timeoutSeconds} origin={`timeoutSeconds`} /></span>
                                        )}
                                    </div>
                                </div>

                                {values?.checks?.length > 1 &&
                                    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '200px' }} onClick={() => removeCheck(index)}>
                                        <img src={CircularMinusIcon} alt='Minus Icon' /> &nbsp;&nbsp;
                                        <span>Remove API Check</span>
                                    </div>
                                }
                            </div>
                        )
                    })}

                    {purpose === 'ADD' &&
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', width: '200px' }} onClick={() => addMoreApiCheck()}>
                            <img src={CircularAddIcon} alt='Add Icon' /> &nbsp;&nbsp;
                            <span>Add More API Check</span>
                        </div>
                    }


                    <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '25px 0' }}>

                        <div
                            style={{ ...styles.redButton, marginRight: '15px' }}
                            onClick={() => closeModal()}
                        >
                            Cancel
                        </div>
                        <div
                            style={{ ...styles.blueButton, width: purpose === 'ADD' ? '150px' : '120px' }}
                            onClick={handleSubmit}
                        >
                            {purpose === 'ADD' ? "Create New Check" : "Update Check"}
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

export default AddNewApiModal