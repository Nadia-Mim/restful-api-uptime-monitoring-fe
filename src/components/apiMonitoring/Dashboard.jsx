import React, { useEffect, useState } from 'react'
import Select from "react-select"
import { deleteApiCheck } from '../../api/apiChecks/DELETE'
import { getAllChecks } from '../../api/apiChecks/GET'
import { updateCheck } from '../../api/apiChecks/PUT'
import DeleteIcon from '../../icons/DeleteIcon.svg'
import EditIcon from '../../icons/EditIcon.svg'
import DetailsIcon from '../../icons/DetailsIcon.svg'
import { useNavigate } from 'react-router-dom'
import SearchIcon from '../../icons/SearchIcon.svg'
import CustomToggleSwitch from '../common/customSwitch/CustomToggleSwitch'
import EmptyScreen from '../common/emptyScreen/EmptyScreen'
import Loader from '../common/loader/Loader'
import DeleteModal from '../common/modals/deleteModal/DeleteModal'
import ErrorModal from '../common/modals/errorModal/ErrorModal'
import SuccessModal from '../common/modals/successModal/SuccessModal'
import AddNewApiModal from './AddNewApiModal'
// Note: we are not using react-query here to keep explicit loader control


const styles = {
    apiDetailsCard: {
        background: '#1E1F2600',
        padding: '15px 20px',
        marginBottom: '20px'
    },
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
        height: '22px',
        width: '120px',
        padding: '9px 14px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    searchButton: {
        border: "1px solid rgba(130, 141, 153, 0.5)",
        borderRadius: "5px",
        padding: "8px",
        width: "95%",
        background: '#1E1F26',
        color: '#fff'
    },
    searchIcon: {
        position: "absolute",
        top: "10px",
        right: "2px"
    },
    flexBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap'
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

const badgeColors = {
    UP: {
        background: 'rgba(51, 219, 41, 1)',
        // color: 'rgb(69, 69, 230)',
        padding: '1px 20px',
        fontWeight: 600,
        borderRadius: '10px'
    },
    DOWN: {
        background: '#F52D2D',
        // color: 'rgb(69, 69, 230)',
        padding: '1px 10px',
        fontWeight: 600,
        borderRadius: '10px'
    }
}

const checkStatusOptions = [
    { label: 'All', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
]

const dummyGroups = [
    { label: 'All', value: 'All' },
    { label: 'Other', value: 'Other' }
]

let arr = [1, 2, 3, 4, 5, 6]

const Dashboard = () => {
    const navigate = useNavigate();
    // derive userId fresh each render to avoid stale data across logins
    const userId = (() => {
        try {
            return JSON.parse(localStorage.getItem('authData') || '{}')?.userId;
        } catch (e) {
            return undefined;
        }
    })();

    const [groupOptions, setGroupOptions] = useState(dummyGroups);
    const [selectedGroup, setSelectedGroup] = useState('All');
    const [allApiChecks, setAllApiChecks] = useState([]);
    const [filteredApiChecks, setFilteredApiChecks] = useState([]);
    const [selectedApiCheckToEdit, setSelectedApiCheckToEdit] = useState({});
    const [addNewApiModalVisualize, setAddNewApiModalVisualize] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Active');
    const [reload, setReload] = useState(false);
    const [searchedWord, setSearchedWord] = useState('');

    const [apiCheckIdToBeDeleted, setApiCheckIdToBeDeleted] = useState('');
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [showLoader, setShowLoader] = useState(false);


    // Data loading effect with explicit loader so Loader can be shown
    useEffect(() => {
        if (userId) {
            setShowLoader(true);
            getAllChecks(userId).then(response => {
                setShowLoader(false);
                if (response?.[0]) {
                    setAllApiChecks(response?.[0]);
                    updateFilteredDataOnStatus(selectedGroup, selectedStatus, response?.[0]);
                    generateGroupOptions(response);
                } else {
                    setAllApiChecks([]);
                    setFilteredApiChecks([]);
                }
            });
        }
    }, [reload, userId])


    // Optional: polling refresh every 60s unless the Add modal is open
    // We keep it simple and controlled; feel free to enable if desired.
    // useEffect(() => {
    //     if (!userId || addNewApiModalVisualize) return;
    //     const t = setInterval(() => setReload(r => !r), 60000);
    //     return () => clearInterval(t);
    // }, [userId, addNewApiModalVisualize]);


    const generateGroupOptions = (response) => {
        const uniqueGroups = new Set();
        const generatedGroupOptions = [
            { label: 'All', value: 'All' },
            ...response?.[0]?.map(check => {
                const group = check?.group;
                if (!uniqueGroups.has(group)) {
                    uniqueGroups.add(group);
                    return { label: group, value: group };
                }
                return null;
            }).filter(option => option !== null), // Filter out null values
            { label: 'Other', value: 'Other' }
        ];
        setGroupOptions(generatedGroupOptions);
    }


    const handleDeleteApiCheck = (apiCheckId) => {
        setApiCheckIdToBeDeleted(apiCheckId);
        setMessage('Are you sure you want to delete this API check?');
        setDeleteModalVisible(true);
    }

    const actionOnDeleteModal = (requestId) => {
        deleteApiCheck(requestId).then(response => {
            if (response?.[0]) {
                setMessage('API Check deleted successfully.');
                setSuccessModalVisible(true);
            } else {
                setMessage(response?.[1]);
                setErrorModalVisible(true);
            }
        });
    }

    const updateApiCheckStatus = (isChecked, detailsOfApiCheckToUpdate) => {

        let updatedApiCheckDetails = {
            checks: [{
                ...detailsOfApiCheckToUpdate, isActive: isChecked
            }]
        }

        updateCheck(updatedApiCheckDetails).then(response => {
            if (response?.[0]) {
                setReload(!reload);
            }
        });
    }

    const updateFilteredDataOnStatus = (group, status, apiChecks = allApiChecks) => {
        let allFilteredChecks = [];
        if (status === 'All') {
            allFilteredChecks = filterByGroup([...apiChecks], group);
        } else if (status === 'Active') {
            allFilteredChecks = filterByGroup([...apiChecks?.filter(apiCheck => apiCheck?.isActive === true)], group);
        } else {
            allFilteredChecks = filterByGroup([...apiChecks?.filter(apiCheck => apiCheck?.isActive === false)], group);
        }

        setFilteredApiChecks(allFilteredChecks);
    }

    const filterByGroup = (apiChecks, group) => {
        if (group !== 'All') {
            return apiChecks?.filter(check => check?.group === group);
        }
        return apiChecks;
    }

    const handleFilter = (wordSearched) => {
        setSearchedWord(wordSearched);

        const newFilter = allApiChecks?.filter((value) => {

            return (value?.protocol?.toLowerCase()?.includes(wordSearched?.toLowerCase()) ||
                value?.url?.toLowerCase()?.includes(wordSearched?.toLowerCase()) ||
                value?.method?.toLowerCase()?.includes(wordSearched?.toLowerCase()) ||
                value?.serviceName?.toLowerCase()?.includes(wordSearched?.toLowerCase()) ||
                value?.state?.toLowerCase()?.includes(wordSearched?.toLowerCase())
            )
        });

        setFilteredApiChecks([...newFilter]);
    };

    const actionOnSuccessModal = () => {
        setDeleteModalVisible(false);
        setReload(!reload);
        setSuccessModalVisible(false);
    }

    const actionOnErrorModal = () => {
        setErrorModalVisible(false);
    }

    const getAverageResponseTime = () => {
        if (filteredApiChecks?.length > 0) {
            const checksWithResponseTime = filteredApiChecks?.filter(filteredApiCheck => typeof (filteredApiCheck?.responseTime) === 'number');
            return (checksWithResponseTime.reduce((total, item) => total + item.responseTime, 0) / checksWithResponseTime.length).toFixed(2);
        }
        return 0;
    }


    return (
        <div>

            {showLoader &&
                <Loader />
            }

            {addNewApiModalVisualize &&
                <AddNewApiModal
                    groupOptions={groupOptions}
                    selectedGroup={selectedGroup}
                    setSelectedGroup={setSelectedGroup}
                    addNewApiModalVisualize={addNewApiModalVisualize}
                    setAddNewApiModalVisualize={setAddNewApiModalVisualize}
                    selectedApiCheckToEdit={selectedApiCheckToEdit}
                    setSelectedApiCheckToEdit={setSelectedApiCheckToEdit}
                    reload={reload}
                    setReload={setReload}
                />
            }

            {deleteModalVisible &&
                <DeleteModal
                    deleteModalVisible={deleteModalVisible}
                    setDeleteModalVisible={setDeleteModalVisible}
                    message={message}
                    requestId={apiCheckIdToBeDeleted}
                    actionOnDeleteModal={actionOnDeleteModal}
                />
            }

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

            <div style={{ display: 'flex', gap: '2%', flexWrap: 'wrap', marginBottom: '30px' }}>
                <div className='cardStyle'>
                    <div style={styles.smallText}>Total API Count</div>
                    <div style={styles.largeText}>{allApiChecks?.length}</div>
                </div>

                <div className='cardStyle'>
                    <div style={styles.smallText}>Currently Up</div>
                    <div style={styles.largeText}>{allApiChecks?.filter(apiCheck => apiCheck?.state === 'UP')?.length}</div>
                </div>

                <div className='cardStyle'>
                    <div style={styles.smallText}>Currently Down</div>
                    <div style={styles.largeText}>{allApiChecks?.filter(apiCheck => apiCheck?.state === 'DOWN')?.length}</div>
                </div>

                <div className='cardStyle'>
                    <div style={styles.smallText}>Currently Active</div>
                    <div style={styles.largeText}>{allApiChecks?.filter(apiCheck => apiCheck?.isActive === true)?.length}</div>
                </div>

                <div className='cardStyle'>
                    <div style={styles.smallText}>Avg. Response Time (ms)</div>
                    <div style={styles.largeText}>
                        {getAverageResponseTime()}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', paddingRight: '15px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginBottom: '15px' }}>
                    <div
                        style={styles.blueButton}
                        onClick={() => setAddNewApiModalVisualize(true)}
                    >
                        + Add New API
                    </div>

                    <div className='small-screen-full-width'>
                        <Select
                            onChange={(e) => {
                                setSelectedStatus(e.value);
                                updateFilteredDataOnStatus(selectedGroup, e.value);
                            }}
                            options={checkStatusOptions}
                            value={checkStatusOptions?.filter(option => option?.value === selectedStatus)}
                            menuPortalTarget={document.body}
                            menuPlacement="auto"
                            placeholder={'Select State'}
                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                        <div style={styles.smallText}>Select Status</div>
                    </div>
                </div>


                <div style={{ position: "relative" }} className='small-screen-full-width'>
                    <input
                        style={styles.searchButton}
                        className='glass-input'
                        placeholder="Search Here"
                        value={searchedWord}
                        onChange={(e) => handleFilter(e.target.value)}
                    />
                    <img
                        src={SearchIcon}
                        style={styles.searchIcon}
                        alt="search"
                    />
                </div>
            </div>


            <div>
                {filteredApiChecks?.length > 0 ?
                    filteredApiChecks?.map((apiCheckDetails, index) => {
                        return (
                            <div style={styles.apiDetailsCard} className='api-details-card' key={`apiDetail-${index}`}>
                                <div
                                    // style={{ ...styles.flexBetween, flexWrap: 'wrap', marginBottom: '10px' }}
                                    className='apiDetailsCardWrapper'
                                >
                                    <div className='apiCheckUrl'>
                                        <div style={styles.smallText}>URL</div>
                                        <div>{apiCheckDetails?.url}</div>
                                    </div>

                                    <div className='apiCheckContent largeScreenMarginRight'>
                                        <div>
                                            <div style={styles.smallText}>State</div>
                                            <div>
                                                {(apiCheckDetails?.isActive && apiCheckDetails?.state) ?
                                                    <span style={badgeColors[apiCheckDetails?.state]}>{apiCheckDetails?.state}</span>
                                                    :
                                                    'N/A'
                                                }
                                            </div>
                                        </div>

                                        <div>
                                            <div style={styles.smallText}>Service Name</div>
                                            <div>{apiCheckDetails?.serviceName || 'N/A'}</div>
                                        </div>

                                        <div>
                                            <div style={styles.smallText}>Protocol</div>
                                            <div>{apiCheckDetails?.protocol}</div>
                                        </div>
                                    </div>

                                    <div className='apiCheckContent'>
                                        {(apiCheckDetails?.protocol === 'http' || apiCheckDetails?.protocol === 'https') && (
                                            <>
                                                <div style={{ width: '100px' }}>
                                                    <div style={styles.smallText}>Method</div>
                                                    <div>{apiCheckDetails?.method}</div>
                                                </div>

                                                <div style={{ width: '120px' }}>
                                                    <div style={styles.smallText}>Success Codes</div>
                                                    <div>{apiCheckDetails?.successCodes?.join(', ')}</div>
                                                </div>
                                            </>
                                        )}
                                        {apiCheckDetails?.protocol === 'tcp' && (
                                            <div style={{ width: '100px' }}>
                                                <div style={styles.smallText}>TCP Port</div>
                                                <div>{apiCheckDetails?.port || '—'}</div>
                                            </div>
                                        )}
                                        {apiCheckDetails?.protocol === 'dns' && (
                                            <div style={{ width: '120px' }}>
                                                <div style={styles.smallText}>DNS Type</div>
                                                <div>{apiCheckDetails?.dnsRecordType || '—'}</div>
                                            </div>
                                        )}

                                        <div style={{ width: '160px', marginLeft: 'auto' }}>
                                            <div style={styles.smallText}>Action</div>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                <CustomToggleSwitch
                                                    origin={`api-state-${index}`}
                                                    disabled={false}
                                                    isChecked={apiCheckDetails?.isActive}
                                                    actionOnChange={(e) => updateApiCheckStatus(e.target.checked, apiCheckDetails)}
                                                />
                                                <img
                                                    src={EditIcon}
                                                    style={{ cursor: 'pointer' }}
                                                    alt='EditIcon'
                                                    onClick={() => {
                                                        setSelectedApiCheckToEdit(apiCheckDetails);
                                                        setAddNewApiModalVisualize(true);
                                                    }}
                                                />
                                                <img
                                                    src={DetailsIcon}
                                                    style={{ cursor: 'pointer', height: '18px', width: '18px' }}
                                                    alt='DetailsIcon'
                                                    onClick={() => {
                                                        navigate(`/check/${apiCheckDetails?._id}`, { state: { check: apiCheckDetails } });
                                                    }}
                                                />
                                                <img src={DeleteIcon}
                                                    style={{ cursor: 'pointer' }}
                                                    alt='DeleteIcon'
                                                    onClick={() => handleDeleteApiCheck(apiCheckDetails?._id)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                    :
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <EmptyScreen title={'No API Checks found.'} description={'API Checks will be available once they are added!'} />
                    </div>
                }
            </div>
        </div>
    )
}

export default Dashboard