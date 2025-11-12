import React, { useEffect, useState } from 'react';
import { CustomModal, CustomModalBody } from '../common/modals/customModal/CustomModal';
import { getAgentDetails } from '../../api/agents/GET';
import Loader from '../common/loader/Loader';

const AgentDetailsModal = ({ visible, agentId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'projects' | 'jobs' | 'stats'

    useEffect(() => {
        if (visible && agentId) {
            loadDetails();
        }
    }, [visible, agentId]);

    const loadDetails = async () => {
        setLoading(true);
        const [ok, result] = await getAgentDetails(agentId);
        setLoading(false);
        if (ok) {
            setData(result);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (startedAt, finishedAt) => {
        if (!startedAt || !finishedAt) return 'N/A';
        const diff = Math.round((new Date(finishedAt) - new Date(startedAt)) / 1000);
        if (diff < 60) return `${diff}s`;
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}m ${secs}s`;
    };

    const getStatusBadge = (status) => {
        const colors = {
            success: '#4CAF50',
            failed: '#EF5350',
            running: '#FFA726',
            pending: '#42A5F5',
            online: '#4CAF50',
            offline: '#EF5350'
        };
        return (
            <span style={{
                background: colors[status] || '#666',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600
            }}>
                {status?.toUpperCase()}
            </span>
        );
    };

    const styles = {
        tabs: {
            display: 'flex',
            gap: '10px',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(130, 141, 153, 0.3)'
        },
        tab: (isActive) => ({
            padding: '10px 20px',
            cursor: 'pointer',
            borderBottom: isActive ? '2px solid #4545E6' : '2px solid transparent',
            color: isActive ? '#4545E6' : '#9fb0c6',
            fontWeight: isActive ? 600 : 400,
            transition: 'all 0.2s'
        }),
        section: {
            marginBottom: '20px'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '10px',
            borderBottom: '1px solid rgba(130, 141, 153, 0.2)',
            paddingBottom: '8px'
        },
        infoRow: {
            display: 'flex',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid rgba(130, 141, 153, 0.1)'
        },
        label: {
            color: '#9fb0c6',
            fontSize: '12px'
        },
        value: {
            color: '#fff',
            fontSize: '12px',
            fontWeight: 500
        },
        historyTable: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        tableHeader: {
            background: 'rgba(69, 69, 230, 0.1)',
            color: '#9fb0c6',
            fontSize: '11px',
            textAlign: 'left',
            padding: '8px',
            fontWeight: 600
        },
        tableCell: {
            padding: '10px 8px',
            fontSize: '12px',
            borderBottom: '1px solid rgba(130, 141, 153, 0.1)'
        },
        projectCard: {
            background: 'rgba(69, 69, 230, 0.05)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '10px',
            border: '1px solid rgba(130, 141, 153, 0.2)'
        },
        statBox: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            background: 'rgba(69, 69, 230, 0.05)',
            borderRadius: '6px',
            flex: 1
        },
        statValue: {
            fontSize: '28px',
            fontWeight: 600,
            color: '#4545E6'
        },
        statLabel: {
            fontSize: '11px',
            color: '#9fb0c6',
            marginTop: '6px'
        }
    };

    if (!visible) return null;

    return (
        <CustomModal
            modalVisible={visible}
            setModalVisible={onClose}
            width="900px"
            height="80vh"
        >
            <CustomModalBody>
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                        <Loader />
                    </div>
                ) : data ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ fontSize: '18px', fontWeight: 600 }}>
                                {data.agent?.name}
                            </div>
                            {getStatusBadge(data.agent?.status)}
                        </div>

                        <div style={styles.tabs}>
                            <div style={styles.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
                                Overview
                            </div>
                            <div style={styles.tab(activeTab === 'projects')} onClick={() => setActiveTab('projects')}>
                                Assigned Projects
                            </div>
                            <div style={styles.tab(activeTab === 'jobs')} onClick={() => setActiveTab('jobs')}>
                                Recent Jobs
                            </div>
                            <div style={styles.tab(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>
                                Statistics
                            </div>
                        </div>

                        {activeTab === 'overview' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Agent Information</div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Agent ID</span>
                                        <span style={styles.value}>{data.agent?._id?.slice(-12)}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Host Type</span>
                                        <span style={styles.value}>{data.agent?.hostType}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Status</span>
                                        <span style={styles.value}>{getStatusBadge(data.agent?.status)}</span>
                                    </div>
                                    {data.agent?.description && (
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Description</span>
                                            <span style={styles.value}>{data.agent?.description}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>System Information</div>
                                    {data.agent?.hostname && (
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Hostname</span>
                                            <span style={styles.value}>{data.agent?.hostname}</span>
                                        </div>
                                    )}
                                    {data.agent?.platform && (
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Platform</span>
                                            <span style={styles.value}>{data.agent?.platform}</span>
                                        </div>
                                    )}
                                    {data.agent?.arch && (
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Architecture</span>
                                            <span style={styles.value}>{data.agent?.arch}</span>
                                        </div>
                                    )}
                                    {data.agent?.nodeVersion && (
                                        <div style={styles.infoRow}>
                                            <span style={styles.label}>Node Version</span>
                                            <span style={styles.value}>{data.agent?.nodeVersion}</span>
                                        </div>
                                    )}
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Activity</div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Last Seen</span>
                                        <span style={styles.value}>{formatDate(data.agent?.lastSeenAt)}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Registered</span>
                                        <span style={styles.value}>{formatDate(data.agent?.createdAt)}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Assigned Projects</span>
                                        <span style={styles.value}>{data.assignedProjects?.length || 0}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {data.assignedProjects?.length > 0 ? (
                                    data.assignedProjects.map((project, idx) => (
                                        <div key={idx} style={styles.projectCard}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                                                {project.name}
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Repository</span>
                                                <span style={styles.value}>{project.repoUrl}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Branch</span>
                                                <span style={styles.value}>{project.branch}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Environments</span>
                                                <span style={styles.value}>
                                                    {project.environments?.map(e => e.toUpperCase()).join(', ')}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#9fb0c6' }}>
                                        No projects assigned to this agent
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {data.recentJobs?.length > 0 ? (
                                    <table style={styles.historyTable}>
                                        <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>Project</th>
                                                <th style={styles.tableHeader}>Environment</th>
                                                <th style={styles.tableHeader}>Type</th>
                                                <th style={styles.tableHeader}>Status</th>
                                                <th style={styles.tableHeader}>Started</th>
                                                <th style={styles.tableHeader}>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.recentJobs.map((job, idx) => (
                                                <tr key={idx}>
                                                    <td style={styles.tableCell}>{job.projectId?.name || 'N/A'}</td>
                                                    <td style={styles.tableCell}>{job.environment?.toUpperCase()}</td>
                                                    <td style={styles.tableCell}>{job.type}</td>
                                                    <td style={styles.tableCell}>{getStatusBadge(job.status)}</td>
                                                    <td style={styles.tableCell}>{formatDate(job.createdAt)}</td>
                                                    <td style={styles.tableCell}>
                                                        {formatDuration(job.startedAt, job.finishedAt)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#9fb0c6' }}>
                                        No recent jobs
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Overall Statistics</div>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                                        <div style={styles.statBox}>
                                            <div style={styles.statValue}>{data.statistics?.totalJobs || 0}</div>
                                            <div style={styles.statLabel}>Total Jobs</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={{ ...styles.statValue, color: '#4CAF50' }}>
                                                {data.statistics?.successfulJobs || 0}
                                            </div>
                                            <div style={styles.statLabel}>Successful</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={{ ...styles.statValue, color: '#EF5350' }}>
                                                {data.statistics?.failedJobs || 0}
                                            </div>
                                            <div style={styles.statLabel}>Failed</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={{ ...styles.statValue, color: '#FFA726' }}>
                                                {data.statistics?.runningJobs || 0}
                                            </div>
                                            <div style={styles.statLabel}>Running</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={styles.statValue}>{data.statistics?.successRate || 0}%</div>
                                            <div style={styles.statLabel}>Success Rate</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Jobs by Type (Last 30 Days)</div>
                                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                        <div style={styles.statBox}>
                                            <div style={styles.statValue}>{data.statistics?.jobsByType?.deploy || 0}</div>
                                            <div style={styles.statLabel}>Deploys</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={styles.statValue}>{data.statistics?.jobsByType?.start || 0}</div>
                                            <div style={styles.statLabel}>Starts</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={styles.statValue}>{data.statistics?.jobsByType?.stop || 0}</div>
                                            <div style={styles.statLabel}>Stops</div>
                                        </div>
                                        <div style={styles.statBox}>
                                            <div style={styles.statValue}>{data.statistics?.jobsByType?.restart || 0}</div>
                                            <div style={styles.statLabel}>Restarts</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9fb0c6' }}>
                        Failed to load agent details
                    </div>
                )}
            </CustomModalBody>
        </CustomModal>
    );
};

export default AgentDetailsModal;
