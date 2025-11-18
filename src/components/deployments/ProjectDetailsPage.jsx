import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectDetails } from '../../api/deploymentProjects/GET';
import Loader from '../common/loader/Loader';
import Select from 'react-select';
import RunIcon from '../../icons/RunIcon.svg';
import StopIcon from '../../icons/StopIcon.svg';
import RestartIcon from '../../icons/RestartIcon.svg';
import JobLogsModal from './JobLogsModal';
import ConfirmDialog from '../common/modals/ConfirmDialog';

const ProjectDetailsPage = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'history' | 'stats'
    const [selectedEnv, setSelectedEnv] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [jobLogsModal, setJobLogsModal] = useState({ visible: false, jobId: null, jobInfo: null });
    const [confirmDialog, setConfirmDialog] = useState({ visible: false });
    const [agentStatus, setAgentStatus] = useState({});

    useEffect(() => {
        if (projectId) {
            loadDetails();
        }
    }, [projectId]);

    useEffect(() => {
        // Set first environment as default when data loads
        if (data?.project?.deploymentTargets?.length > 0 && !selectedEnv) {
            setSelectedEnv(data.project.deploymentTargets[0].environment);
        }
    }, [data]);

    useEffect(() => {
        let eventSource;
        const connectSSE = async () => {
            try {
                const { getAgentStatusSSE } = await import('../../api/agents/GET');
                eventSource = getAgentStatusSSE((statuses) => {
                    setAgentStatus(statuses);
                });
            } catch (error) {
                console.error('Failed to connect to agent status SSE:', error);
            }
        };
        connectSSE();
        return () => {
            if (eventSource) {
                eventSource.close();
            }
        };
    }, []);

    const loadDetails = async () => {
        setLoading(true);
        const [ok, result] = await getProjectDetails(projectId);
        setLoading(false);
        if (ok) {
            setData(result); // Only update if successful
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

    const handleAction = async (type) => {
        if (!selectedEnv) return;

        const loadingKey = `${type}-${selectedEnv}`;

        // Get agent for selected environment
        const target = data.project?.deploymentTargets?.find(t => t.environment === selectedEnv);
        const agent = data.stats?.[selectedEnv]?.agent;

        // Check if agent exists
        if (!agent) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Agent Not Found',
                message: 'The assigned agent was not found. Please check agent configuration.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        // Check if agent is online (only if we have agent status data)
        if (target?.agentId && agentStatus[target.agentId]) {
            const isOnline = agentStatus[target.agentId]?.status === 'online';
            if (!isOnline) {
                setConfirmDialog({
                    visible: true,
                    title: '⚠️ Agent Offline',
                    message: `Agent "${agent?.name || 'Unknown'}" is currently offline. ${type.charAt(0).toUpperCase() + type.slice(1)} cannot proceed. Please ensure the agent is running.`,
                    type: 'warning',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
                return;
            }
        }

        // For deploy action, check production and show warning
        if (type === 'deploy' && selectedEnv === 'production') {
            setConfirmDialog({
                visible: true,
                title: '🚀 Deploy to Production',
                message: `Are you sure you want to deploy "${data.project.name}" to PRODUCTION?\n\nThis will update the live production environment.`,
                type: 'warning',
                confirmText: 'Deploy',
                onConfirm: async () => {
                    setConfirmDialog({ ...confirmDialog, visible: false });
                    await executeAction(type, loadingKey, agent);
                },
                onCancel: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        await executeAction(type, loadingKey, agent);
    };

    const executeAction = async (type, loadingKey, agent) => {
        setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

        const { dispatchJob } = await import('../../api/jobs/POST');
        const [ok, result] = await dispatchJob({
            projectId: data.project._id,
            environment: selectedEnv,
            type
        });

        setActionLoading(prev => ({ ...prev, [loadingKey]: false }));

        if (ok && result?.jobId) {
            const modalData = {
                visible: true,
                jobId: result.jobId,
                jobInfo: {
                    projectName: data.project.name,
                    environment: selectedEnv,
                    type,
                    agentName: agent?.name
                }
            };
            setJobLogsModal(modalData);
        } else {
            setConfirmDialog({
                visible: true,
                title: '❌ Action Failed',
                message: result || `Failed to ${type}.`,
                type: 'danger',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
        }
    };

    const envOptions = data?.project?.deploymentTargets?.map(t => ({
        value: t.environment,
        label: t.environment.toUpperCase()
    })) || [];

    const selectedTarget = data?.project?.deploymentTargets?.find(t => t.environment === selectedEnv);
    const pipeline = data?.pipelineTemplate;

    const styles = {
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '25px',
            paddingBottom: '15px',
            borderBottom: '1px solid rgba(130, 141, 153, 0.3)',
            flexWrap: 'wrap'
        },
        backButton: {
            background: 'rgba(69, 69, 230, 0.1)',
            border: '1px solid rgba(69, 69, 230, 0.3)',
            color: '#4545E6',
            padding: '8px 16px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
        },
        actionButton: (color, isLoading) => ({
            background: 'transparent',
            border: `1px solid ${color}`,
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '20px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            opacity: isLoading ? 0.6 : 1,
            transition: 'all 0.2s ease'
        }),
        title: {
            fontSize: '24px',
            fontWeight: 600,
            color: '#fff',
            flex: 1
        },
        actionsContainer: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginLeft: 'auto'
        },
        deployButton: {
            background: 'rgba(69, 69, 230, 0.2)',
            border: '1px solid rgba(69, 69, 230, 0.5)',
            color: '#6B8AFF'
        },
        startButton: {
            background: 'rgba(76, 175, 80, 0.2)',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            color: '#4CAF50'
        },
        stopButton: {
            background: 'rgba(239, 83, 80, 0.2)',
            border: '1px solid rgba(239, 83, 80, 0.5)',
            color: '#EF5350'
        },
        restartButton: {
            background: 'rgba(255, 167, 38, 0.2)',
            border: '1px solid rgba(255, 167, 38, 0.5)',
            color: '#FFA726'
        },
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
            marginBottom: '20px',
            background: 'rgba(30, 31, 38, 0.5)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(130, 141, 153, 0.2)'
        },
        sectionTitle: {
            fontSize: '14px',
            fontWeight: 600,
            color: '#fff',
            marginBottom: '15px',
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
            fontSize: '13px'
        },
        value: {
            color: '#fff',
            fontSize: '13px',
            fontWeight: 500
        },
        historyTable: {
            width: '100%',
            borderCollapse: 'collapse'
        },
        tableHeader: {
            background: 'rgba(69, 69, 230, 0.1)',
            color: '#9fb0c6',
            fontSize: '12px',
            textAlign: 'left',
            padding: '10px',
            fontWeight: 600
        },
        tableCell: {
            padding: '12px 10px',
            fontSize: '13px',
            borderBottom: '1px solid rgba(130, 141, 153, 0.1)',
            color: '#DCE4F0'
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
            fontSize: '12px',
            color: '#9fb0c6',
            marginTop: '5px'
        }
    };

    return (
        <div>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                    <Loader />
                </div>
            ) : data ? (
                <>
                    {/* Header with glass-toolbar design matching ApiDetails */}
                    <div className="glass-toolbar" style={{ marginBottom: 16 }}>
                        <div style={{ fontWeight: 700, fontSize: 18 }}>{data.project?.name}</div>
                        {selectedEnv && data.stats?.[selectedEnv] && (() => {
                            const status = data.stats[selectedEnv].runtimeStatus || 'unknown';
                            const isRunning = status === 'running';
                            const isStopped = status === 'stopped';
                            return (
                                <span
                                    className={`glass-badge ${isRunning ? 'success' : isStopped ? 'danger' : 'secondary'}`}
                                    style={{ padding: '4px 10px', borderRadius: 10, fontSize: 12 }}
                                >
                                    {status.toUpperCase()}
                                </span>
                            );
                        })()}

                        {envOptions.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                                <button
                                    style={styles.actionButton('#4545E6', actionLoading[`deploy-${selectedEnv}`])}
                                    onClick={() => !actionLoading[`deploy-${selectedEnv}`] && handleAction('deploy')}
                                    onMouseEnter={(e) => {
                                        if (!actionLoading[`deploy-${selectedEnv}`]) e.target.style.background = '#4545E6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.background = 'transparent';
                                    }}
                                >
                                    {actionLoading[`deploy-${selectedEnv}`] ? 'Deploying...' : 'Deploy'}
                                </button>

                                {(pipeline?.useDocker || pipeline?.runCommands?.length > 0) && (
                                    <button
                                        style={styles.actionButton('#4CAF50', actionLoading[`start-${selectedEnv}`])}
                                        onClick={() => !actionLoading[`start-${selectedEnv}`] && handleAction('start')}
                                        onMouseEnter={(e) => {
                                            if (!actionLoading[`start-${selectedEnv}`]) e.target.style.background = '#4CAF50';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'transparent';
                                        }}
                                    >
                                        {actionLoading[`start-${selectedEnv}`] ? 'Starting...' : 'Start'}
                                    </button>
                                )}

                                {(pipeline?.useDocker || pipeline?.stopCommands?.length > 0) && (
                                    <button
                                        style={styles.actionButton('#EF5350', actionLoading[`stop-${selectedEnv}`])}
                                        onClick={() => !actionLoading[`stop-${selectedEnv}`] && handleAction('stop')}
                                        onMouseEnter={(e) => {
                                            if (!actionLoading[`stop-${selectedEnv}`]) e.target.style.background = '#EF5350';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'transparent';
                                        }}
                                    >
                                        {actionLoading[`stop-${selectedEnv}`] ? 'Stopping...' : 'Stop'}
                                    </button>
                                )}

                                {(pipeline?.useDocker || (pipeline?.runCommands?.length > 0 && pipeline?.stopCommands?.length > 0)) && (
                                    <button
                                        style={styles.actionButton('#FFA726', actionLoading[`restart-${selectedEnv}`])}
                                        onClick={() => !actionLoading[`restart-${selectedEnv}`] && handleAction('restart')}
                                        onMouseEnter={(e) => {
                                            if (!actionLoading[`restart-${selectedEnv}`]) e.target.style.background = '#FFA726';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'transparent';
                                        }}
                                    >
                                        {actionLoading[`restart-${selectedEnv}`] ? 'Restarting...' : 'Restart'}
                                    </button>
                                )}
                            </div>
                        )}

                        <div
                            className="glass-button-primary"
                            style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 10 }}
                            onClick={() => navigate('/deployments')}
                        >
                            Back
                        </div>
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
                        <div>
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
                                    <div style={{ color: '#9fb0c6', fontSize: '13px' }}>No pipeline template configured</div>
                                )}
                            </div>

                            <div style={styles.section}>
                                <div style={styles.sectionTitle}>Deployment Targets</div>
                                {data.project?.deploymentTargets?.map((target, idx) => {
                                    const runtimeStatus = data.stats?.[target.environment]?.runtimeStatus || 'unknown';
                                    const statusColor = runtimeStatus === 'running' ? '#4CAF50' : runtimeStatus === 'stopped' ? '#EF5350' : '#9fb0c6';
                                    return (
                                        <div key={idx} style={styles.envCard}>
                                            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px', textTransform: 'uppercase', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {target.environment}
                                                <span
                                                    className={`glass-badge ${runtimeStatus === 'running' ? 'success' : runtimeStatus === 'stopped' ? 'danger' : 'secondary'}`}
                                                    style={{ padding: '4px 10px', borderRadius: 10, fontSize: 12 }}
                                                >
                                                    {runtimeStatus.toUpperCase()}
                                                </span>
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
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div style={styles.section}>
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
                        <div>
                            {Object.keys(data.stats || {}).map((env) => {
                                const stat = data.stats[env];
                                return (
                                    <div key={env} style={styles.section}>
                                        <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', color: '#fff' }}>
                                            {env}
                                        </div>

                                        <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
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
                                            <div style={{ marginTop: '20px' }}>
                                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#9fb0c6', marginBottom: '10px' }}>
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
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px', color: '#9fb0c6', fontSize: '16px' }}>
                    Failed to load project details
                </div>
            )}

            {/* Job Logs Modal */}
            <JobLogsModal
                visible={jobLogsModal.visible}
                jobId={jobLogsModal.jobId}
                jobInfo={jobLogsModal.jobInfo}
                onClose={() => {
                    setJobLogsModal({ visible: false, jobId: null, jobInfo: null });
                    // Reload project details to sync with backend after modal closes
                    loadDetails();
                }}
            />

            {/* Confirm Dialog */}
            {confirmDialog.visible && (
                <ConfirmDialog
                    title={confirmDialog.title}
                    message={confirmDialog.message}
                    type={confirmDialog.type}
                    confirmText={confirmDialog.confirmText}
                    cancelText={confirmDialog.cancelText}
                    onConfirm={confirmDialog.onConfirm}
                    onCancel={() => setConfirmDialog({ ...confirmDialog, visible: false })}
                />
            )}
        </div>
    );
};

export default ProjectDetailsPage;
