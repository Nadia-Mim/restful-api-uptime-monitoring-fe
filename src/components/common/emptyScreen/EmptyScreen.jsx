import React from 'react';
import EmptyScreenIcon from '../../../icons/EmptyScreenIcon.svg'

const EmptyScreen = ({ title, description }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
                <img src={EmptyScreenIcon} alt='EmptyScreen' />
            </div>
            <div style={{ fontWeight: 600 }}>Opps!</div>
            <div style={{ fontSize: '12px' }}>{title ? title : 'Something went wrong'}</div>
            <div style={{ fontSize: '12px' }}>{description ? description : 'Please try again'}</div>
        </div>
    )
}

export default EmptyScreen