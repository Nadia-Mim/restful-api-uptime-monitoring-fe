import React from 'react';
import Select from 'react-select';
import EmptyScreen from '../common/emptyScreen/EmptyScreen';
import ProjectCard from './ProjectCard';
import { useJobActions } from './hooks/useJobActions';

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
    const { actionLoading: hookActionLoading, dispatchJobAndShowLogs, validateAgent, showProductionConfirmation } = useJobActions(setJobLogsModal, setConfirmDialog);

    // Use hook's action loading if parent doesn't provide it
    const effectiveActionLoading = actionLoading || hookActionLoading;

    const handleDeploy = async (project, target, agent, deployKey) => {
        if (!validateAgent(agent, target.agentId, agentStatus, setConfirmDialog)) {
            return;
        }

        if (target.environment === 'production') {
            showProductionConfirmation(
                project.name,
                () => dispatchJobAndShowLogs(project, target, agent, 'deploy', deployKey),
                setConfirmDialog
            );
        } else {
            await dispatchJobAndShowLogs(project, target, agent, 'deploy', deployKey);
        }
    };

    const handleServiceAction = async (project, target, agent, type, loadingKey) => {
        await dispatchJobAndShowLogs(project, target, agent, type, loadingKey);
    };

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
                            <ProjectCard
                                key={p._id}
                                project={p}
                                templates={templates}
                                agents={agents}
                                agentStatus={agentStatus}
                                actionLoading={effectiveActionLoading}
                                openEditProject={openEditProject}
                                removeProject={removeProject}
                                onDeploy={handleDeploy}
                                onServiceAction={handleServiceAction}
                            />
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
