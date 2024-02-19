import React from 'react'
import Avatar from 'react-avatar';

const styles = {
    card: {
        width: '100%',
        height: '170px',
        // borderRadius: '15px',
        background: '#1E1F26',
        boxShadow: '0px 4px 1rem #000'
    },
    largeText: {
        fontSize: '18px',
        fontWeight: 400,
    },
    smallText: {
        fontSize: '12px',
        fontWeight: 300,
    },
}

function UserDetails() {
    return (
        <div>
            <div style={{ marginBottom: '50px' }}>
                <div style={styles.card}></div>
                <div style={{ marginTop: '-120px', marginLeft: '50px', display: 'flex', gap: '20px' }}>
                    <Avatar size="150" round={true} name={`Jonayed Ahmed`} />
                    <span style={{ fontSize: '35px', fontWeight: 600, display: 'flex', alignItems: 'center' }}>Jonayed Ahmed Riduan</span>
                </div>
            </div>

            
        </div>
    )
}

export default UserDetails