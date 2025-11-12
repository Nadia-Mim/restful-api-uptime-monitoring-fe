import React from 'react';
import EmptyScreen from '../common/emptyScreen/EmptyScreen';

const AgentsTab = ({
    loading,
    agents,
    agentStatus,
    styles,
    openAddAgent,
    setAgentDetailsModal,
    setShowDownloadAgent,
    setAgentStatus
}) => {
    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <div style={{ ...styles.blueButton, width: '140px' }} onClick={openAddAgent}>+ Register Agent</div>
            </div>
            {loading ? null : (
                agents?.length ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12 }}>
                        {agents.map((a) => (
                            <div key={a._id} className="api-details-card" style={{ padding: 12, background: '#1E1F2600', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div style={{ fontSize: 14, color: '#DCE4F0', fontWeight: 700 }}>{a.name}</div>
                                    <span className={`glass-badge ${(agentStatus[a._id]?.status === 'online' || a.status === 'ONLINE') ? 'success' : 'danger'}`}>
                                        {agentStatus[a._id]?.status ? agentStatus[a._id]?.status.toUpperCase() : (a.status || 'OFFLINE')}
                                    </span>
                                </div>
                                <div style={{ fontSize: 12, color: '#9fb0c6' }}>Host</div>
                                <div style={{ fontSize: 14, color: '#DCE4F0' }}>{a.hostType}</div>
                                {a.description && (
                                    <div>
                                        <div style={{ fontSize: 12, color: '#9fb0c6' }}>Description</div>
                                        <div style={{ fontSize: 14, color: '#DCE4F0' }}>{a.description}</div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 6 }}>
                                    <div style={{ fontSize: 12, color: '#9fb0c6' }}>Last Heartbeat</div>
                                    <div style={{ fontSize: 12, color: '#DCE4F0' }}>
                                        {(agentStatus[a._id]?.lastCheckIn || a.lastSeenAt)
                                            ? new Date(agentStatus[a._id]?.lastCheckIn || a.lastSeenAt).toLocaleString()
                                            : '—'}
                                    </div>
                                </div>
                                <div style={{ fontSize: 12, color: '#9fb0c6' }}>Token</div>
                                <div style={{ fontSize: 12, color: '#c9d6e6', wordBreak: 'break-all' }}>{a.token}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={async () => {
                                            const { validateAgent } = await import('../../api/agents/VALIDATE');
                                            const [ok, data] = await validateAgent(a._id);
                                            setAgentStatus(s => ({
                                                ...s,
                                                [a._id]: ok && data ? data : { status: 'offline', lastCheckIn: null }
                                            }));
                                        }}
                                    >
                                        Validate Agent
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowDownloadAgent(a)}
                                    >
                                        Download
                                    </button>
                                </div>
                                <div style={{ marginTop: 6, fontSize: 12, color: '#9fb0c6' }}>
                                    Download will install and configure this agent to connect securely to the control server. You can also run the script via curl.
                                </div>
                                {/* Status message */}
                                {agentStatus[a._id]?.status === 'online' && (
                                    <div className="glass-badge success" style={{ marginTop: 6 }}>
                                        ✅ Agent is running and connected.
                                    </div>
                                )}
                                {agentStatus[a._id]?.status === 'offline' && (
                                    <div className="glass-badge danger" style={{ marginTop: 6 }}>
                                        ⚠️ Agent not responding.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <EmptyScreen
                            title={'No Agents Registered'}
                            description={'Deployment agents will appear here once you register them!'}
                        />
                    </div>
                )
            )}
        </div>
    );
};

export default AgentsTab;
