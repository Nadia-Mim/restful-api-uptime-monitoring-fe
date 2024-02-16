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

const checkStateOptions = [
    { label: 'All', value: 'All' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' }
]

let arr = [1, 2, 3, 4, 5, 6]


const Dashboard = () => {

    const [allApiChecks, setAllApiChecks] = useState([]);
    const [filteredApiChecks, setFilteredApiChecks] = useState([]);
    const [selectedApiCheckToEdit, setSelectedApiCheckToEdit] = useState({});
    const [addNewApiModalVisualize, setAddNewApiModalVisualize] = useState(false);
    const [selectedState, setSelectedState] = useState('Active');
    const [reload, setReload] = useState(false);

    const [apiCheckIdToBeDeleted, setApiCheckIdToBeDeleted] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [message, setMessage] = useState('');


    useEffect(() => {
        getAllChecks().then(response => {
            if (response?.[0]) {
                setAllApiChecks(response?.[0]);
                setFilteredApiChecks(response?.[0]);
            } else {
                setAllApiChecks([]);
                setFilteredApiChecks([]);
            }
        });


        setInterval(() => {
            getAllChecks().then(response => {
                if (response?.[0]) {
                    setAllApiChecks(response?.[0]);
                    setFilteredApiChecks(response?.[0]);
                } else {
                    setAllApiChecks([]);
                    setFilteredApiChecks([]);
                }
            });
        }, 1000 * 60)
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
        })
    }

    return (
        <div>

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
                    <div style={styles.largeText}>10</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Currently Up</div>
                    <div style={styles.largeText}>10</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Currently Down</div>
                    <div style={styles.largeText}>10</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Avg. Response Time</div>
                    <div style={styles.largeText}>10</div>
                </div>

                <div style={styles.cardStyle}>
                    <div style={styles.smallText}>Avg. Response Time</div>
                    <div style={styles.largeText}>10</div>
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
                            onChange={(e) => setSelectedState(e.value)}
                            options={checkStateOptions}
                            value={checkStateOptions?.filter(option => option?.value === selectedState)}
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
                    // value={searchKeyword}
                    // onChange={(e) => handleOnChangeSearch(e.target.value)}
                    />
                    <img
                        src={SearchIcon}
                        style={styles.searchIcon}
                        alt="search"
                    />
                </div>
            </div>


            <div>
                {filteredApiChecks?.map((apiCheckDetails, index) => {
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
                                            <span style={badgeColors[apiCheckDetails?.state]}>{apiCheckDetails?.state}</span>
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
                })}
            </div>
        </div>
    )
}

export default Dashboard