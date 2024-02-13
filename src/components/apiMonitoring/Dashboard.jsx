import React, { useState } from 'react'
import SearchIcon from '../../icons/SearchIcon.svg'
import RightAlignedProgressParrot from '../../icons/RightAlignedProgressParrot.svg'
import EditIcon from '../../icons/EditIcon.svg'
import DeleteIcon from '../../icons/DeleteIcon.svg'
import CustomToggleSwitch from '../common/customSwitch/CustomToggleSwitch'
import AddNewApiModal from './AddNewApiModal'
import Select from "react-select";


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

    const [addNewApiModalVisualize, setAddNewApiModalVisualize] = useState(false);
    const [selectedState, setSelectedState] = useState('Active');


    const handleStateChange = () => {

    }

    return (
        <div>

            {addNewApiModalVisualize &&
                <AddNewApiModal
                    addNewApiModalVisualize={addNewApiModalVisualize}
                    setAddNewApiModalVisualize={setAddNewApiModalVisualize}
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

                    <div style={{width: '200px'}}>
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
                {arr?.map((apiDetails, index) => {
                    return (
                        <div style={styles.apiDetailsCard} key={`apiDetail-${index}`}>
                            <div>
                                {/* Progress */}
                                <div>
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
                                            // isChecked={true}
                                            origin={`api-state`}
                                            disabled={false}
                                            actionOnChange={() => handleStateChange()}
                                        />
                                    </div>
                                </div>


                                <div style={{ ...styles.flexBetween, marginBottom: '10px' }}>
                                    <div>
                                        <div style={styles.smallText}>URL</div>
                                        <div>google.com</div>
                                    </div>

                                    <div>
                                        <div style={styles.smallText}>State</div>
                                        <div>
                                            <span style={badgeColors['DOWN']}>DOWN</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={styles.smallText}>Protocol</div>
                                        <div>http</div>
                                    </div>

                                    <div>
                                        <div style={styles.smallText}>Method</div>
                                        <div>POST</div>
                                    </div>

                                    <div>
                                        <div style={styles.smallText}>Status Codes</div>
                                        <div>200, 201</div>
                                    </div>

                                    <div>
                                        <div style={styles.smallText}>Action</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <img src={EditIcon} style={{ cursor: 'pointer' }} alt='EditIcon' />
                                            <img src={DeleteIcon} style={{ cursor: 'pointer' }} alt='DeleteIcon' />
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