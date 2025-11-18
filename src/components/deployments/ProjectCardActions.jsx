/**
 * ProjectCardActions Component
 * Renders deployment action buttons for a project card
 */
import React from 'react';
import RunIcon from '../../icons/RunIcon.svg';
import StopIcon from '../../icons/StopIcon.svg';
import RestartIcon from '../../icons/RestartIcon.svg';
import {
    generateLoadingKey,
    findAgentById,
    hasDockerConfig,
    hasRunCommands,
    hasStopCommands,
    supportsRestart
} from './utils/projectHelpers';

const ProjectCardActions = ({
    project,
    agents,
    agentStatus,
    pipeline,
    actionLoading,
    onDeploy,
    onServiceAction
}) => {
    return (
        <div style={{ marginTop: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Actions</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {project.deploymentTargets.map((target, idx) => {
                    const agent = findAgentById(agents, target.agentId);
                    if (!target.agentId) return null;

                    const deployKey = generateLoadingKey(project._id, target.environment, 'deploy');
                    const startKey = generateLoadingKey(project._id, target.environment, 'start');
                    const stopKey = generateLoadingKey(project._id, target.environment, 'stop');
                    const restartKey = generateLoadingKey(project._id, target.environment, 'restart');

                    return (
                        <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {/* Deploy Button */}
                            <div
                                className={`glass-badge ${target.environment === 'production' ? 'danger' : 'info'}`}
                                style={{
                                    fontSize: 11,
                                    padding: '4px 8px',
                                    gap: 8,
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
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
                                    onClick={() => !actionLoading[deployKey] && onDeploy(project, target, agent, deployKey)}
                                />
                                {target.environment.toUpperCase()}
                            </div>

                            {/* Service Control Buttons */}
                            <div style={{ display: 'flex', gap: 6 }}>
                                {/* Start Button */}
                                {(hasDockerConfig(pipeline) || hasRunCommands(pipeline)) && (
                                    <img
                                        src={RunIcon}
                                        alt="Start"
                                        style={{
                                            width: 22,
                                            height: 22,
                                            cursor: actionLoading[startKey] ? 'not-allowed' : 'pointer',
                                            opacity: actionLoading[startKey] ? 0.4 : 0.9
                                        }}
                                        onClick={() => !actionLoading[startKey] && onServiceAction(project, target, agent, 'start', startKey)}
                                        title={hasDockerConfig(pipeline) ? "Start Docker container" : "Start service"}
                                    />
                                )}

                                {/* Stop Button */}
                                {(hasDockerConfig(pipeline) || hasStopCommands(pipeline)) && (
                                    <img
                                        src={StopIcon}
                                        alt="Stop"
                                        style={{
                                            width: 22,
                                            height: 22,
                                            cursor: actionLoading[stopKey] ? 'not-allowed' : 'pointer',
                                            opacity: actionLoading[stopKey] ? 0.4 : 0.9
                                        }}
                                        onClick={() => !actionLoading[stopKey] && onServiceAction(project, target, agent, 'stop', stopKey)}
                                        title={hasDockerConfig(pipeline) ? "Stop Docker container" : "Stop service"}
                                    />
                                )}

                                {/* Restart Button */}
                                {supportsRestart(pipeline) && (
                                    <img
                                        src={RestartIcon}
                                        alt="Restart"
                                        style={{
                                            width: 22,
                                            height: 22,
                                            cursor: actionLoading[restartKey] ? 'not-allowed' : 'pointer',
                                            opacity: actionLoading[restartKey] ? 0.4 : 0.9
                                        }}
                                        onClick={() => !actionLoading[restartKey] && onServiceAction(project, target, agent, 'restart', restartKey)}
                                        title={hasDockerConfig(pipeline) ? "Restart Docker container" : "Restart service"}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ProjectCardActions;
