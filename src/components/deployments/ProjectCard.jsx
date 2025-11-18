/**
 * ProjectCard Component
 * Displays a single project card with deployment actions
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import EditIcon from '../../icons/EditIcon.svg';
import DetailsIcon from '../../icons/DetailsIcon.svg';
import DeleteIcon from '../../icons/DeleteIcon.svg';
import ProjectCardActions from './ProjectCardActions';
import { findPipelineById, getRuntimeStatusColor, isAgentOnline } from './utils/projectHelpers';

const ProjectCard = ({
    project,
    templates,
    agents,
    agentStatus,
    actionLoading,
    openEditProject,
    removeProject,
    onDeploy,
    onServiceAction
}) => {
    const navigate = useNavigate();
    const pipeline = findPipelineById(templates, project.pipelineTemplateId || project?.pipelineTemplate?._id);

    return (
        <div className="api-details-card" style={{ padding: 12, background: '#1E1F2600', display: 'flex', flexDirection: 'column' }}>
            {/* Project Info */}
            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4 }}>Project Name</div>
                <div style={{ fontSize: 14, color: '#DCE4F0' }}>{project.name}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4 }}>Project Repository</div>
                <div style={{ fontSize: 14, color: '#DCE4F0' }}>{`${project.branch} • ${project.repoUrl}`}</div>
            </div>

            <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4 }}>Pipeline</div>
                <div style={{ fontSize: 14, color: '#DCE4F0' }}>
                    {pipeline?.templateName || '—'}
                </div>
            </div>

            {/* Deployment Targets */}
            {project.deploymentTargets?.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 4, marginBottom: 6 }}>
                        Configured Environments
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {project.deploymentTargets.map((target, idx) => {
                            const agent = agents.find(a => a._id === target.agentId);
                            const agentOnline = isAgentOnline(target.agentId, agentStatus);
                            const runtimeStatus = project.runtimeStatuses?.[target.environment] || 'unknown';
                            const statusColor = getRuntimeStatusColor(runtimeStatus);

                            return (
                                <span
                                    key={idx}
                                    className={`glass-badge ${agentOnline ? 'success' : 'secondary'}`}
                                    title={`Agent: ${agent?.name || 'Not assigned'} | Status: ${runtimeStatus}`}
                                >
                                    <span style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: statusColor,
                                        display: 'inline-block',
                                        marginRight: 6
                                    }} />
                                    {target.environment.toUpperCase()} {agent?.name ? `(${agent.name})` : ''}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions */}
            {project.deploymentTargets?.length > 0 && (
                <ProjectCardActions
                    project={project}
                    agents={agents}
                    agentStatus={agentStatus}
                    pipeline={pipeline}
                    actionLoading={actionLoading}
                    onDeploy={onDeploy}
                    onServiceAction={onServiceAction}
                />
            )}

            {/* Footer Actions */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: 12,
                marginTop: 'auto',
                paddingTop: 8,
                borderTop: '1px solid rgba(255,255,255,0.1)'
            }}>
                <img
                    src={EditIcon}
                    style={{ cursor: 'pointer' }}
                    alt='Edit'
                    title='Edit Project'
                    onClick={() => openEditProject(project)}
                />
                <img
                    src={DetailsIcon}
                    style={{ cursor: 'pointer', height: '18px', width: '18px' }}
                    alt='Details'
                    title='View Details'
                    onClick={() => navigate(`/deployments/projects/${project._id}`)}
                />
                <img
                    src={DeleteIcon}
                    style={{ cursor: 'pointer' }}
                    alt='Delete'
                    title='Delete Project'
                    onClick={() => removeProject(project)}
                />
            </div>
        </div>
    );
};

export default ProjectCard;
