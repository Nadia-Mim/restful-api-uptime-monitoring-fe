import React, { useEffect, useState } from 'react'
import Select from "react-select"
import { deleteApiCheck } from '../../api/apiChecks/DELETE'
import { getAllChecks } from '../../api/apiChecks/GET'
import { updateCheck } from '../../api/apiChecks/PUT'
import DeleteIcon from '../../icons/DeleteIcon.svg'
import EditIcon from '../../icons/EditIcon.svg'
import SearchIcon from '../../icons/SearchIcon.svg'
import CustomToggleSwitch from '../common/customSwitch/CustomToggleSwitch'
import EmptyScreen from '../common/emptyScreen/EmptyScreen'
import Loader from '../common/loader/Loader'
import DeleteModal from '../common/modals/deleteModal/DeleteModal'
import ErrorModal from '../common/modals/errorModal/ErrorModal'
import SuccessModal from '../common/modals/successModal/SuccessModal'
import AddNewApiModal from './AddNewApiModal'
import { useQuery } from 'react-query';


const styles = {
    cardStyle: {
        background: '#1E1F26',
        height: '15vh',
        width: '18%',
        minWidth: '35vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '5px',
        boxShadow: '0px 4px 1rem #000',
        marginBottom: '15px'
    },
    apiDetailsCard: {
        background: '#1E1F26',
        padding: '15px 20px',
        marginBottom: '20px',
        boxShadow: '0px 4px 1rem #000'
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
        width: '150px',
        padding: '8px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    searchButton: {
        border: "1px solid rgba(130, 141, 153, 0.5)",
        borderRadius: "5px",
        padding: "8px",
        width: "100%",
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

const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};

const Dashboard = () => {

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


    useEffect(() => {
        if (authData?.userId) {
            setShowLoader(true);
            getAllChecks(authData?.userId).then(response => {
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
    }, [reload])


    const getAllApiChecks = () => {
        getAllChecks(authData?.userId).then(response => {
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

    const { data, isLoading, isError, refetch } = useQuery(
        'apiCheckData',
        getAllApiChecks,
        {
            refetchInterval: addNewApiModalVisualize ? false : 1000 * 60, // Refetch every 10 seconds if addNewApiModalVisualize is false
        }
    );


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
            return ((checksWithResponseTime.reduce((total, item) => total + item.responseTime, 0) / checksWithResponseTime.length) / 1000).toFixed(4)
        }
        return 0;
    }

    console.log(selectedGroup)

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

            <div style={{ display: 'flex', gap: '2.5%', flexWrap: 'wrap', marginBottom: '30px' }}>
                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Total API Count</div>
                    <div style={styles.largeText}>{allApiChecks?.length}</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Currently Up</div>
                    <div style={styles.largeText}>{allApiChecks?.filter(apiCheck => apiCheck?.state === 'UP')?.length}</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Currently Down</div>
                    <div style={styles.largeText}>{allApiChecks?.filter(apiCheck => apiCheck?.state === 'DOWN')?.length}</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Currently Active</div>
                    <div style={styles.largeText}>{allApiChecks?.filter(apiCheck => apiCheck?.isActive === true)?.length}</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Avg. Response Time (sec)</div>
                    <div style={styles.largeText}>
                        {getAverageResponseTime()}
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', paddingRight: '15px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div
                        style={styles.blueButton}
                        onClick={() => setAddNewApiModalVisualize(true)}
                    >
                        + Create New API
                    </div>

                    <div style={{ width: '200px' }}>
                        <Select
                            onChange={(e) => {
                                setSelectedGroup(e?.value);
                                updateFilteredDataOnStatus(e.value, selectedStatus);
                            }}
                            value={groupOptions?.filter(group => group?.value === selectedGroup)?.[0]}
                            options={groupOptions?.filter(group => group?.value !== 'Other')}
                            menuPortalTarget={document.body}
                            menuPlacement="auto"
                            placeholder={'Select State'}
                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                        <div style={styles.smallText}>Select Group</div>
                    </div>

                    <div style={{ width: '200px' }}>
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


                <div style={{ position: "relative" }}>
                    <input
                        style={styles.searchButton}
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
                            <div style={styles.apiDetailsCard} key={`apiDetail-${index}`}>
                                <div style={{ ...styles.flexBetween, flexWrap: 'wrap', marginBottom: '10px' }}>
                                    <div style={{ width: '300px' }}>
                                        <div style={styles.smallText}>URL</div>
                                        <div>{apiCheckDetails?.url}</div>
                                    </div>

                                    <div style={{ width: '70px' }}>
                                        <div style={styles.smallText}>State</div>
                                        <div>
                                            {(apiCheckDetails?.isActive && apiCheckDetails?.state) ?
                                                <span style={badgeColors[apiCheckDetails?.state]}>{apiCheckDetails?.state}</span>
                                                :
                                                'N/A'
                                            }
                                        </div>
                                    </div>

                                    <div style={{ width: '210px' }}>
                                        <div style={styles.smallText}>Service Name</div>
                                        <div>{apiCheckDetails?.serviceName || 'N/A'}</div>
                                    </div>

                                    <div style={{ width: '100px' }}>
                                        <div style={styles.smallText}>Protocol</div>
                                        <div>{apiCheckDetails?.protocol}</div>
                                    </div>

                                    <div style={{ width: '100px' }}>
                                        <div style={styles.smallText}>Method</div>
                                        <div>{apiCheckDetails?.method}</div>
                                    </div>

                                    <div style={{ width: '100px' }}>
                                        <div style={styles.smallText}>Success Codes</div>
                                        <div>{apiCheckDetails?.successCodes?.join(', ')}</div>
                                    </div>

                                    <div style={{ width: '120px' }}>
                                        <div style={styles.smallText}>Action</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <CustomToggleSwitch
                                                origin={`api-state`}
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
                                            <img src={DeleteIcon}
                                                style={{ cursor: 'pointer' }}
                                                alt='DeleteIcon'
                                                onClick={() => handleDeleteApiCheck(apiCheckDetails?._id)}
                                            />
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