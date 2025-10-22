import React from 'react';

const Deployments = () => {
    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={new URL('../../icons/DeploymentsBlue.svg', import.meta.url).href} style={{ width: 24, height: 24 }} />
                <div style={{ fontSize: 20, fontWeight: 700, color: '#DCE4F0' }}>Deployments</div>
            </div>
            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '40px 20px', marginBottom: '12px', color: '#a7b4c7' }}>
                Coming soon.
            </div>
        </div>
    );
};

export default Deployments;
