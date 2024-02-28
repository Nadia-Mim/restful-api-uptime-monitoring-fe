import React, { useEffect, useState } from 'react'
import SearchIcon from '../../icons/SearchIcon.svg'
import RightAlignedProgressParrot from '../../icons/RightAlignedProgressParrot.svg'
import EditIcon from '../../icons/EditIcon.svg'
import DeleteIcon from '../../icons/DeleteIcon.svg'
import CustomToggleSwitch from '../common/customSwitch/CustomToggleSwitch'
import AddNewApiModal from './AddNewApiModal'
import Select from "react-select";
import { getAllChecks } from '../../api/apiChecks/GET'
import DeleteModal from '../common/modals/deleteModal/DeleteModal'
import { deleteApiCheck } from '../../api/apiChecks/DELETE'
import EmptyScreen from '../common/emptyScreen/EmptyScreen'
import { updateCheck } from '../../api/apiChecks/PUT'
import Loader from '../common/loader/Loader'


const styles = {
    cardStyle: {
        background: '#1E1F26',
        height: '15vh',
        width: '35vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '5px',
        boxShadow: '0px 4px 1rem #000'
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
        background: 'rgba(219, 201, 41, 1)',
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

let arr = [1, 2, 3, 4, 5, 6]

const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};

const Dashboard = () => {

    const [allApiChecks, setAllApiChecks] = useState([]);
    const [filteredApiChecks, setFilteredApiChecks] = useState([]);
    const [selectedApiCheckToEdit, setSelectedApiCheckToEdit] = useState({});
    const [addNewApiModalVisualize, setAddNewApiModalVisualize] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('Active');
    const [reload, setReload] = useState(false);
    const [searchedWord, setSearchedWord] = useState('');

    const [apiCheckIdToBeDeleted, setApiCheckIdToBeDeleted] = useState('');
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
                    setFilteredApiChecks(response?.[0]?.filter(apiCheck => apiCheck?.isActive === true));
                } else {
                    setAllApiChecks([]);
                    setFilteredApiChecks([]);
                }
            });


            setInterval(() => {
                getAllChecks(authData?.userId).then(response => {
                    if (response?.[0]) {
                        setAllApiChecks(response?.[0]);
                        setFilteredApiChecks(response?.[0]?.filter(apiCheck => apiCheck?.isActive === true));
                    } else {
                        setAllApiChecks([]);
                        setFilteredApiChecks([]);
                    }
                });
            }, 1000 * 60)
        }
    }, [reload])


    const handleDeleteApiCheck = (apiCheckId) => {
        setApiCheckIdToBeDeleted(apiCheckId);
        setMessage('Are you sure you want to delete this API check?');
        setDeleteModalVisible(true);
    }

    const actionOnDeleteModal = (requestId) => {
        deleteApiCheck(requestId).then(response => {
            if (response?.[0]) {
                setDeleteModalVisible(false);
                setReload(!reload);
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

    const updateFilteredDataOnStatus = (status) => {
        if (status === 'All') {
            setFilteredApiChecks([...allApiChecks]);
        } else if (status === 'Active') {
            setFilteredApiChecks([...allApiChecks?.filter(apiCheck => apiCheck?.isActive === true)]);
        } else {
            setFilteredApiChecks([...allApiChecks?.filter(apiCheck => apiCheck?.isActive === false)]);
        }
    }

    const handleFilter = (wordSearched) => {
        setSearchedWord(wordSearched);

        const newFilter = allApiChecks?.filter((value) => {

            return (value?.protocol?.toLowerCase()?.includes(wordSearched?.toLowerCase()) ||
                value?.url?.toLowerCase()?.includes(wordSearched?.toLowerCase()) ||
                value?.method?.toLowerCase()?.includes(wordSearched?.toLowerCase())
            )
        });

        setFilteredApiChecks([...newFilter]);
    };

    return (
        <div>

            {showLoader &&
                <Loader />
            }

            {addNewApiModalVisualize &&
                <AddNewApiModal
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

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
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
                    <div style={styles.largeText}>0.5</div>
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
                                setSelectedStatus(e.value);
                                updateFilteredDataOnStatus(e.value);
                            }}
                            options={checkStatusOptions}
                            value={checkStatusOptions?.filter(option => option?.value === selectedStatus)}
                            menuPortalTarget={document.body}
                            menuPlacement="auto"
                            placeholder={'Select State'}
                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
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
                                <div>
                                    {/* Progress */}
                                    {/* <div>
                                    <div>Connectivity</div>
                                </div>

                                <div style={styles.flexBetween}>
                                    <div>
                                        {arr?.map((item, index) => {
                                            return <img src={RightAlignedProgressParrot} style={{ height: '50px', width: '35px' }} key={`progress-${index}`} />
                                        })}
                                    </div>

                                    <div>
                                        <CustomToggleSwitch
                                            origin={`api-state`}
                                            disabled={false}
                                            actionOnChange={() => handleStateChange()}
                                        />
                                    </div>
                                </div> */}


                                    <div style={{ ...styles.flexBetween, marginBottom: '10px' }}>
                                        <div>
                                            <div style={styles.smallText}>URL</div>
                                            <div>{apiCheckDetails?.url}</div>
                                        </div>

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
                                            <div style={styles.smallText}>Protocol</div>
                                            <div>{apiCheckDetails?.protocol}</div>
                                        </div>

                                        <div>
                                            <div style={styles.smallText}>Method</div>
                                            <div>{apiCheckDetails?.method}</div>
                                        </div>

                                        <div>
                                            <div style={styles.smallText}>Success Codes</div>
                                            <div>{apiCheckDetails?.successCodes?.join(', ')}</div>
                                        </div>

                                        <div>
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