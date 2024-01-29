import React from 'react';
import './CustomToggleSwitch.css';

const CustomToggleSwitch = (props) => {
    return (
        <div style={{ display: 'flex', gap: '10px' }}>
            <div className="switchContainer">
                <input
                    type="checkbox"
                    className="checkbox"
                    id={props.origin}
                    checked={props?.isChecked}
                    onChange={props.actionOnChange}
                    disabled={props?.disabled || false}
                />
                <label className="switch" htmlFor={props.origin}>
                    <span className="slider"></span>
                </label>
            </div>
        </div>
    );
};

export default CustomToggleSwitch;