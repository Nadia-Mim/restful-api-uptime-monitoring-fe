import React, { useEffect, useState } from 'react';
import { CustomModal, CustomModalBody } from '../common/modals/customModal/CustomModal';
import { getProjectDetails } from '../../api/deploymentProjects/GET';
import Loader from '../common/loader/Loader';

const ProjectDetailsModal = ({ visible, projectId, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history' | 'stats'

    useEffect(() => {
        if (visible && projectId) {
            loadDetails();
        }
    }, [visible, projectId]);

    const loadDetails = async () => {
        setLoading(true);
        const [ok, result] = await getProjectDetails(projectId);
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
            pending: '#42A5F5'
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
        envCard: {
            background: 'rgba(69, 69, 230, 0.05)',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '15px',
            border: '1px solid rgba(130, 141, 153, 0.2)'
        },
        statBox: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px',
            background: 'rgba(69, 69, 230, 0.05)',
            borderRadius: '6px',
            flex: 1
        },
        statValue: {
            fontSize: '24px',
            fontWeight: 600,
            color: '#4545E6'
        },
        statLabel: {
            fontSize: '11px',
            color: '#9fb0c6',
            marginTop: '4px'
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
                        <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>
                            {data.project?.name}
                        </div>

                        <div style={styles.tabs}>
                            <div style={styles.tab(activeTab === 'overview')} onClick={() => setActiveTab('overview')}>
                                Overview
                            </div>
                            <div style={styles.tab(activeTab === 'history')} onClick={() => setActiveTab('history')}>
                                Deployment History
                            </div>
                            <div style={styles.tab(activeTab === 'stats')} onClick={() => setActiveTab('stats')}>
                                Environment Stats
                            </div>
                        </div>

                        {activeTab === 'overview' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Repository Information</div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Repository URL</span>
                                        <span style={styles.value}>{data.project?.repoUrl || 'N/A'}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Branch</span>
                                        <span style={styles.value}>{data.project?.branch || 'N/A'}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Created At</span>
                                        <span style={styles.value}>{formatDate(data.project?.createdAt)}</span>
                                    </div>
                                    <div style={styles.infoRow}>
                                        <span style={styles.label}>Last Updated</span>
                                        <span style={styles.value}>{formatDate(data.project?.updatedAt)}</span>
                                    </div>
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Pipeline Template</div>
                                    {data.pipelineTemplate ? (
                                        <>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Template Name</span>
                                                <span style={styles.value}>{data.pipelineTemplate?.templateName}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Language</span>
                                                <span style={styles.value}>{data.pipelineTemplate?.language || 'N/A'}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Framework</span>
                                                <span style={styles.value}>{data.pipelineTemplate?.framework || 'N/A'}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <div style={{ color: '#9fb0c6', fontSize: '12px' }}>No pipeline template configured</div>
                                    )}
                                </div>

                                <div style={styles.section}>
                                    <div style={styles.sectionTitle}>Deployment Targets</div>
                                    {data.project?.deploymentTargets?.map((target, idx) => (
                                        <div key={idx} style={styles.envCard}>
                                            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase' }}>
                                                {target.environment}
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Deploy Path</span>
                                                <span style={styles.value}>{target.deployPath}</span>
                                            </div>
                                            <div style={styles.infoRow}>
                                                <span style={styles.label}>Auto Start</span>
                                                <span style={styles.value}>{target.autoStart ? 'Yes' : 'No'}</span>
                                            </div>
                                            {target.artifacts?.length > 0 && (
                                                <div style={styles.infoRow}>
                                                    <span style={styles.label}>Artifacts</span>
                                                    <span style={styles.value}>{target.artifacts.join(', ')}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {data.deploymentHistory?.length > 0 ? (
                                    <table style={styles.historyTable}>
                                        <thead>
                                            <tr>
                                                <th style={styles.tableHeader}>Environment</th>
                                                <th style={styles.tableHeader}>Type</th>
                                                <th style={styles.tableHeader}>Status</th>
                                                <th style={styles.tableHeader}>Started</th>
                                                <th style={styles.tableHeader}>Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.deploymentHistory.map((job, idx) => (
                                                <tr key={idx}>
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
                                        No deployment history yet
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                {Object.keys(data.stats || {}).map((env) => {
                                    const stat = data.stats[env];
                                    return (
                                        <div key={env} style={styles.envCard}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '15px', textTransform: 'uppercase' }}>
                                                {env}
                                            </div>

                                            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                                                <div style={styles.statBox}>
                                                    <div style={styles.statValue}>{stat.totalDeployments}</div>
                                                    <div style={styles.statLabel}>Total</div>
                                                </div>
                                                <div style={styles.statBox}>
                                                    <div style={{ ...styles.statValue, color: '#4CAF50' }}>{stat.successfulDeployments}</div>
                                                    <div style={styles.statLabel}>Success</div>
                                                </div>
                                                <div style={styles.statBox}>
                                                    <div style={{ ...styles.statValue, color: '#EF5350' }}>{stat.failedDeployments}</div>
                                                    <div style={styles.statLabel}>Failed</div>
                                                </div>
                                                <div style={styles.statBox}>
                                                    <div style={styles.statValue}>{stat.successRate}%</div>
                                                    <div style={styles.statLabel}>Success Rate</div>
                                                </div>
                                            </div>

                                            {stat.agent && (
                                                <div style={styles.infoRow}>
                                                    <span style={styles.label}>Agent</span>
                                                    <span style={styles.value}>
                                                        {stat.agent.name} ({stat.agent.hostType})
                                                    </span>
                                                </div>
                                            )}

                                            {stat.lastDeployment && (
                                                <>
                                                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#9fb0c6', marginTop: '15px', marginBottom: '8px' }}>
                                                        Last Deployment
                                                    </div>
                                                    <div style={styles.infoRow}>
                                                        <span style={styles.label}>Status</span>
                                                        <span style={styles.value}>{getStatusBadge(stat.lastDeployment.status)}</span>
                                                    </div>
                                                    <div style={styles.infoRow}>
                                                        <span style={styles.label}>Time</span>
                                                        <span style={styles.value}>{formatDate(stat.lastDeployment.createdAt)}</span>
                                                    </div>
                                                    {stat.lastDeployment.duration && (
                                                        <div style={styles.infoRow}>
                                                            <span style={styles.label}>Duration</span>
                                                            <span style={styles.value}>{stat.lastDeployment.duration}s</span>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#9fb0c6' }}>
                        Failed to load project details
                    </div>
                )}
            </CustomModalBody>
        </CustomModal>
    );
};

export default ProjectDetailsModal;
