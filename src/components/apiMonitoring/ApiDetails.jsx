import React from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

// Minimal API Details view. Expects check data via router state; if absent, shows a simple not found.
const ApiDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const check = location?.state?.check || null;

    return (
        <div>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontWeight: 600, fontSize: '20px' }}>API Details</div>
                <div
                    className="glass-button-primary"
                    style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: '10px' }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </div>
            </div>

            {!check ? (
                <div className="glass-card" style={{ padding: '16px' }}>
                    No details available for this item. Try navigating from the Dashboard.
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '16px', display: 'grid', gridTemplateColumns: '180px 1fr', rowGap: '12px', columnGap: '12px' }}>
                    <div style={{ opacity: 0.8 }}>ID</div>
                    <div style={{ fontWeight: 600 }}>{check?._id || id}</div>

                    <div style={{ opacity: 0.8 }}>URL</div>
                    <div>{check?.url}</div>

                    <div style={{ opacity: 0.8 }}>Service Name</div>
                    <div>{check?.serviceName || 'N/A'}</div>

                    <div style={{ opacity: 0.8 }}>Protocol</div>
                    <div>{check?.protocol}</div>

                    <div style={{ opacity: 0.8 }}>Method</div>
                    <div>{check?.method}</div>

                    <div style={{ opacity: 0.8 }}>Group</div>
                    <div>{check?.group || 'N/A'}</div>

                    <div style={{ opacity: 0.8 }}>Active</div>
                    <div>{check?.isActive ? 'Yes' : 'No'}</div>

                    <div style={{ opacity: 0.8 }}>State</div>
                    <div>{check?.state || 'N/A'}</div>

                    <div style={{ opacity: 0.8 }}>Success Codes</div>
                    <div>{Array.isArray(check?.successCodes) ? check.successCodes.join(', ') : 'N/A'}</div>

                    <div style={{ opacity: 0.8 }}>Timeout (sec)</div>
                    <div>{check?.timeoutSeconds}</div>
                </div>
            )}
        </div>
    );
}

export default ApiDetails;
