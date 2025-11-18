import React from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import EditIcon from '../../icons/EditIcon.svg';
import DetailsIcon from '../../icons/DetailsIcon.svg';
import DeleteIcon from '../../icons/DeleteIcon.svg';
import RunIcon from '../../icons/RunIcon.svg';
import StopIcon from '../../icons/StopIcon.svg';
import RestartIcon from '../../icons/RestartIcon.svg';
import EmptyScreen from '../common/emptyScreen/EmptyScreen';

const ProjectsTab = ({
    environment,
    setEnvironment,
    envOptions,
    openAddProject,
    loading,
    projects,
    templates,
    agents,
    agentStatus,
    actionLoading,
    styles,
    openEditProject,
    removeProject,
    setConfirmDialog,
    confirmDialog,
    setJobLogsModal,
    setActionLoading
}) => {
    const navigate = useNavigate();

    return (
        <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <div style={{ minWidth: 160, maxWidth: 200 }}>
                    <Select
                        value={envOptions.find(o => o.value === environment)}
                        onChange={(e) => setEnvironment(e.value)}
                        options={envOptions}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        placeholder="Select Environment"
                    />
                </div>
                <div style={styles.blueButton} onClick={openAddProject}>+ Add Project</div>
            </div>
            {loading ? null : (
                projects?.length ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
                        {projects.map((p) => (
                            <div key={p._id} className="api-details-card" style={{ padding: 12, background: '#1E1F2600', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4 }}>Project Name</div>
                                    <div style={{ fontSize: 14, color: '#DCE4F0' }}>{p.name}</div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4 }}>Project Repository</div>
                                    <div style={{ fontSize: 14, color: '#DCE4F0' }}>{`${p.branch} • ${p.repoUrl}`}</div>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4 }}>Pipeline</div>
                                    <div style={{ fontSize: 14, color: '#DCE4F0' }}>
                                        {templates.find(t => t._id === (p.pipelineTemplateId || p?.pipelineTemplate?._id))?.templateName || '—'}
                                    </div>
                                </div>
                                {/* Deployment Targets */}
                                {p.deploymentTargets && p.deploymentTargets.length > 0 && (
                                    <div style={{ marginBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4, marginBottom: 6 }}>Configured Environments</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {p.deploymentTargets.map((target, idx) => {
                                                const agent = agents.find(a => a._id === target.agentId);
                                                const agentOnline = agentStatus[target.agentId]?.status === 'online';
                                                const runtimeStatus = p.runtimeStatuses?.[target.environment] || 'unknown';
                                                const statusColor = runtimeStatus === 'running' ? '#4CAF50' : runtimeStatus === 'stopped' ? '#EF5350' : '#9fb0c6';
                                                return (
                                                    <span key={idx} className={`glass-badge ${agentOnline ? 'success' : 'secondary'}`} title={`Agent: ${agent?.name || 'Not assigned'} | Status: ${runtimeStatus}`}>
                                                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColor, display: 'inline-block', marginRight: 6 }}></span>
                                                        {target.environment.toUpperCase()} {agent?.name ? `(${agent.name})` : ''}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                {/* Deploy and Service Control Buttons */}
                                {p.deploymentTargets && p.deploymentTargets.length > 0 && (
                                    <div style={{ marginTop: 8, marginBottom: 8 }}>
                                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Actions</div>
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                            {p.deploymentTargets.map((target, idx) => {
                                                const agent = agents.find(a => a._id === target.agentId);
                                                if (!target.agentId) return null;
                                                const pipeline = templates.find(t => t._id === p.pipelineTemplateId);
                                                const deployKey = `deploy-${p._id}-${target.environment}`;
                                                const startKey = `start-${p._id}-${target.environment}`;
                                                const stopKey = `stop-${p._id}-${target.environment}`;
                                                const restartKey = `restart-${p._id}-${target.environment}`;

                                                const handleDeploy = async () => {
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

                                                    const isOnline = agentStatus[target.agentId]?.status === 'online';
                                                    if (!isOnline) {
                                                        setConfirmDialog({
                                                            visible: true,
                                                            title: '⚠️ Agent Offline',
                                                            message: `Agent "${agent.name}" is currently offline. Deployment cannot proceed. Please ensure the agent is running.`,
                                                            type: 'warning',
                                                            confirmText: 'OK',
                                                            onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                                                        });
                                                        return;
                                                    }

                                                    if (target.environment === 'production') {
                                                        setConfirmDialog({
                                                            visible: true,
                                                            title: '🚀 Deploy to Production',
                                                            message: `Are you sure you want to deploy "${p.name}" to PRODUCTION?\n\nThis will update the live production environment.`,
                                                            type: 'warning',
                                                            confirmText: 'Deploy',
                                                            onConfirm: async () => {
                                                                setConfirmDialog({ ...confirmDialog, visible: false });
                                                                await executeDeploy();
                                                            },
                                                            onCancel: () => setConfirmDialog({ ...confirmDialog, visible: false })
                                                        });
                                                    } else {
                                                        await executeDeploy();
                                                    }
                                                };

                                                const executeDeploy = async () => {
                                                    const key = deployKey;
                                                    setActionLoading(prev => ({ ...prev, [key]: true }));

                                                    try {
                                                        const { dispatchJob } = await import('../../api/jobs/POST');
                                                        const [ok, data] = await dispatchJob({
                                                            projectId: p._id,
                                                            environment: target.environment,
                                                            type: 'deploy'
                                                        });

                                                        if (ok && data?.jobId) {
                                                            setJobLogsModal({
                                                                visible: true,
                                                                jobId: data.jobId,
                                                                jobInfo: {
                                                                    projectName: p.name,
                                                                    environment: target.environment,
                                                                    type: 'deploy',
                                                                    agentName: agent?.name
                                                                }
                                                            });
                                                        } else {
                                                            setConfirmDialog({
                                                                visible: true,
                                                                title: '❌ Deployment Failed',
                                                                message: data || 'Failed to start deployment. Please check your configuration and try again.',
                                                                type: 'danger',
                                                                confirmText: 'OK',
                                                                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                                                            });
                                                        }
                                                    } catch (error) {
                                                        // Silently handle errors
                                                    } finally {
                                                        // Always clear loading state
                                                        setActionLoading(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[key];
                                                            return updated;
                                                        });
                                                    }
                                                }; const handleServiceAction = async (type, loadingKey) => {
                                                    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

                                                    try {
                                                        const { dispatchJob } = await import('../../api/jobs/POST');
                                                        const [ok, data] = await dispatchJob({
                                                            projectId: p._id,
                                                            environment: target.environment,
                                                            type
                                                        });

                                                        if (ok && data?.jobId) {
                                                            setJobLogsModal({
                                                                visible: true,
                                                                jobId: data.jobId,
                                                                jobInfo: {
                                                                    projectName: p.name,
                                                                    environment: target.environment,
                                                                    type: type,
                                                                    agentName: agent?.name
                                                                }
                                                            });
                                                        } else {
                                                            setConfirmDialog({
                                                                visible: true,
                                                                title: '❌ Action Failed',
                                                                message: data || `Failed to ${type} service.`,
                                                                type: 'danger',
                                                                confirmText: 'OK',
                                                                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                                                            });
                                                        }
                                                    } catch (error) {
                                                        // Silently handle errors
                                                    } finally {
                                                        // Always clear loading state
                                                        setActionLoading(prev => {
                                                            const updated = { ...prev };
                                                            delete updated[loadingKey];
                                                            return updated;
                                                        });
                                                    }
                                                };

                                                return (
                                                    <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                                        <div
                                                            className={`glass-badge ${target.environment === 'production' ? 'danger' : 'info'}`} style={{ fontSize: 11, padding: '4px 8px', gap: 8, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                                            title={`Deploy to ${target.environment}`}
                                                        >
                                                            <img
                                                                src={RunIcon}
                                                                alt="Deploy"
                                                                style={{
                                                                    width: 15,
                                                                    height: 15,
                                                                    cursor: actionLoading[deployKey] ? 'not-allowed' : 'pointer',
                                                                    opacity: actionLoading[deployKey] ? 0.4 : 0.9
                                                                }}
                                                                onClick={() => !actionLoading[deployKey] && handleDeploy()}
                                                            />
                                                            {target.environment.toUpperCase()}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            {/* Show controls for Docker OR traditional deployments */}
                                                            {(pipeline?.useDocker || pipeline?.runCommands?.length > 0) && (
                                                                <img
                                                                    src={RunIcon}
                                                                    alt="Start"
                                                                    style={{
                                                                        width: 22,
                                                                        height: 22,
                                                                        cursor: actionLoading[startKey] ? 'not-allowed' : 'pointer',
                                                                        opacity: actionLoading[startKey] ? 0.4 : 0.9
                                                                    }}
                                                                    onClick={() => !actionLoading[startKey] && handleServiceAction('start', startKey)}
                                                                    title={pipeline?.useDocker ? "Start Docker container" : "Start service"}
                                                                />
                                                            )}
                                                            {(pipeline?.useDocker || pipeline?.stopCommands?.length > 0) && (
                                                                <img
                                                                    src={StopIcon}
                                                                    alt="Stop"
                                                                    style={{
                                                                        width: 22,
                                                                        height: 22,
                                                                        cursor: actionLoading[stopKey] ? 'not-allowed' : 'pointer',
                                                                        opacity: actionLoading[stopKey] ? 0.4 : 0.9
                                                                    }}
                                                                    onClick={() => !actionLoading[stopKey] && handleServiceAction('stop', stopKey)}
                                                                    title={pipeline?.useDocker ? "Stop Docker container" : "Stop service"}
                                                                />
                                                            )}
                                                            {(pipeline?.useDocker || (pipeline?.runCommands?.length > 0 && pipeline?.stopCommands?.length > 0)) && (
                                                                <img
                                                                    src={RestartIcon}
                                                                    alt="Restart"
                                                                    style={{
                                                                        width: 22,
                                                                        height: 22,
                                                                        cursor: actionLoading[restartKey] ? 'not-allowed' : 'pointer',
                                                                        opacity: actionLoading[restartKey] ? 0.4 : 0.9
                                                                    }}
                                                                    onClick={() => !actionLoading[restartKey] && handleServiceAction('restart', restartKey)}
                                                                    title={pipeline?.useDocker ? "Restart Docker container" : "Restart service"}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginTop: 'auto', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <img
                                        src={EditIcon}
                                        style={{ cursor: 'pointer' }}
                                        alt='Edit'
                                        title='Edit Project'
                                        onClick={() => openEditProject(p)}
                                    />
                                    <img
                                        src={DetailsIcon}
                                        style={{ cursor: 'pointer', height: '18px', width: '18px' }}
                                        alt='Details'
                                        title='View Details'
                                        onClick={() => navigate(`/deployments/projects/${p._id}`)}
                                    />
                                    <img
                                        src={DeleteIcon}
                                        style={{ cursor: 'pointer' }}
                                        alt='Delete'
                                        title='Delete Project'
                                        onClick={() => removeProject(p)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                        <EmptyScreen title={'No Projects Found'} description={'Projects will appear here once you add them for this environment!'} />
                    </div>
                )
            )}
        </div>
    );
};

export default ProjectsTab;
