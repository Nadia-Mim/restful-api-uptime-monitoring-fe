import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import ConfirmDialog from '../common/modals/ConfirmDialog';
import JobLogsModal from './JobLogsModal';
import JobHistory from './JobHistory';
import Loader from '../common/loader/Loader';
import ProjectsTab from './ProjectsTab';
import PipelinesTab from './PipelinesTab';
import AgentsTab from './AgentsTab';
import ProjectModal from './modals/ProjectModal';
import PipelineModal from './modals/PipelineModal';
import AgentModal from './modals/AgentModal';
import AgentDownloadModal from './modals/AgentDownloadModal';
import { listDeploymentProjects } from '../../api/deploymentProjects/GET';
import { listPipelineTemplates } from '../../api/pipelines/GET';
import { createPipelineTemplate } from '../../api/pipelines/POST';
import { updatePipelineTemplate } from '../../api/pipelines/PUT';
import { deletePipelineTemplate } from '../../api/pipelines/DELETE';
import { createDeploymentProject } from '../../api/deploymentProjects/POST';
import { updateDeploymentProject } from '../../api/deploymentProjects/PUT';
import { deleteDeploymentProject } from '../../api/deploymentProjects/DELETE';

const envOptions = [
    { value: 'dev', label: 'Dev' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
];

// Unified styling
const styles = {
    inputFieldStyle: {
        width: '97%',
        border: "1px solid rgba(130, 141, 153, 0.5)",
        borderRadius: "5px",
        background: '#1E1F26',
        padding: "8px",
        fontSize: '17px',
        fontWeight: 300,
        color: '#fff'
    },
    blueButton: {
        background: '#4545E6',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    redButton: {
        background: '#F52D2D',
        width: '55px',
        padding: '10px',
        cursor: 'pointer',
        borderRadius: '5px'
    },
    smallText: {
        fontSize: '12px',
        fontWeight: 300,
    },
    selectStyle: {
        control: (styles) => ({
            ...styles,
            backgroundColor: '#1E1F26',
            borderColor: 'rgba(255, 255, 255, 0.14)',
            color: '#FFFFFF',
        }),
        option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isSelected ? '#4545E6' : '#1E1F26',
            color: '#FFFFFF',
            ':hover': {
                backgroundColor: isFocused ? '#45464D' : '#1E1F26',
            },
        }),
        singleValue: (provided) => ({
            ...provided,
            color: 'white',
            fontWeight: 300,
        }),
    }
};

const Deployments = () => {
    const [environment, setEnvironment] = useState('dev');
    const [activeTab, setActiveTab] = useState('projects');
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [agents, setAgents] = useState([]);
    const [agentStatus, setAgentStatus] = useState({});

    // Unified modal states - Projects
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [isEditingProject, setIsEditingProject] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState(null);
    const [projectForm, setProjectForm] = useState({
        name: '',
        repoUrl: '',
        branch: '',
        pipelineTemplateId: '',
        deploymentTargets: [
            {
                environment: 'dev',
                enabled: false,
                agentId: '',
                artifacts: '',
                deployPath: '',
                autoStart: false,
                // Docker fields
                port: '',
                containerPort: 3000,
                dockerVolumes: [],
                dockerEnvVars: [],
                dockerNetwork: 'bridge'
            },
            {
                environment: 'staging',
                enabled: false,
                agentId: '',
                artifacts: '',
                deployPath: '',
                autoStart: false,
                // Docker fields
                port: '',
                containerPort: 3000,
                dockerVolumes: [],
                dockerEnvVars: [],
                dockerNetwork: 'bridge'
            },
            {
                environment: 'production',
                enabled: false,
                agentId: '',
                artifacts: '',
                deployPath: '',
                autoStart: false,
                // Docker fields
                port: '',
                containerPort: 3000,
                dockerVolumes: [],
                dockerEnvVars: [],
                dockerNetwork: 'bridge'
            },
        ]
    });

    // Unified modal states - Pipelines
    const [showPipelineModal, setShowPipelineModal] = useState(false);
    const [isEditingPipeline, setIsEditingPipeline] = useState(false);
    const [editingPipelineId, setEditingPipelineId] = useState(null);
    const [pipelineForm, setPipelineForm] = useState({
        templateName: '',
        language: '',
        framework: '',
        buildCommands: '',
        runCommands: '',
        stopCommands: '',
        // Docker fields
        useDocker: false,
        dockerImage: '',
        dockerfile: '',
        dockerBuildArgs: [],
        autoGenerateDockerfile: false,
    });

    // Unified modal states - Agents
    const [showAgentModal, setShowAgentModal] = useState(false);
    const [isEditingAgent, setIsEditingAgent] = useState(false);
    const [editingAgentId, setEditingAgentId] = useState(null);
    const [agentForm, setAgentForm] = useState({ name: '', hostType: 'Linux', description: '' });

    const [showDownloadAgent, setShowDownloadAgent] = useState(null);
    const [jobLogsModal, setJobLogsModal] = useState({ visible: false, jobId: null, jobInfo: {} });
    const [confirmDialog, setConfirmDialog] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'warning',
        onConfirm: null
    });
    const [actionLoading, setActionLoading] = useState({});

    /**
     * Reload all data: projects, templates, and agents
     * Each API returns [success, data] tuple
     */
    const reload = async () => {
        setLoading(true);
        await Promise.all([loadProjects(), loadTemplates(), loadAgents()]);
        setLoading(false);
    };

    // Load projects for current environment
    const loadProjects = async () => {
        const [projectsSuccess, projectsData] = await listDeploymentProjects(environment);
        if (projectsSuccess) {
            setProjects(projectsData);
        }
    };

    // Load pipeline templates
    const loadTemplates = async () => {
        const [templatesSuccess, templatesData] = await listPipelineTemplates();
        if (templatesSuccess) {
            setTemplates(templatesData);
        }
    };

    // Load agents
    const loadAgents = async () => {
        try {
            const { listAgents } = await import('../../api/agents/GET');
            const [agentsSuccess, agentsData] = await listAgents();
            if (agentsSuccess) {
                setAgents(agentsData);
            }
        } catch (error) {
            console.error('Failed to load agents:', error);
        }
    };

    useEffect(() => {
        let timer;
        const run = async () => {
            if (!agents?.length) return;
            try {
                const { validateAgent } = await import('../../api/agents/VALIDATE');
                const results = await Promise.all(agents.map(a => validateAgent(a._id)));
                const map = {};
                results.forEach((r, idx) => {
                    const [ok, data] = r;
                    const id = agents[idx]._id;
                    map[id] = ok && data ? data : { status: 'offline', lastCheckIn: null };
                });
                setAgentStatus(map);
            } catch { }
        };
        run();
        // Poll agent status every 30 seconds on all tabs
        timer = setInterval(run, 30000);
        return () => timer && clearInterval(timer);
    }, [agents]);

    // Load data based on active tab and dependencies
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            
            if (activeTab === 'projects') {
                // Projects tab needs: projects (env-specific), templates (for pipeline info), agents (for deployment)
                await Promise.all([loadProjects(), loadTemplates(), loadAgents()]);
            } else if (activeTab === 'pipelines') {
                // Pipelines tab only needs: templates
                await loadTemplates();
            } else if (activeTab === 'agents') {
                // Agents tab only needs: agents
                await loadAgents();
            }
            
            setLoading(false);
        };
        
        loadData();
    }, [activeTab, environment]);

    // Project handlers
    const openAddProject = () => {
        setIsEditingProject(false);
        setEditingProjectId(null);
        setProjectForm({
            name: '',
            repoUrl: '',
            branch: '',
            pipelineTemplateId: '',
            deploymentTargets: [
                {
                    environment: 'dev',
                    enabled: false,
                    agentId: '',
                    artifacts: '',
                    deployPath: '',
                    autoStart: false,
                    port: '',
                    containerPort: 3000,
                    dockerVolumes: [],
                    dockerEnvVars: [],
                    dockerNetwork: 'bridge'
                },
                {
                    environment: 'staging',
                    enabled: false,
                    agentId: '',
                    artifacts: '',
                    deployPath: '',
                    autoStart: false,
                    port: '',
                    containerPort: 3000,
                    dockerVolumes: [],
                    dockerEnvVars: [],
                    dockerNetwork: 'bridge'
                },
                {
                    environment: 'production',
                    enabled: false,
                    agentId: '',
                    artifacts: '',
                    deployPath: '',
                    autoStart: false,
                    port: '',
                    containerPort: 3000,
                    dockerVolumes: [],
                    dockerEnvVars: [],
                    dockerNetwork: 'bridge'
                },
            ]
        });
        setShowProjectModal(true);
    };

    const openEditProject = (proj) => {
        const existingTargets = proj?.deploymentTargets || [];
        const allEnvironments = ['dev', 'staging', 'production'];

        const deploymentTargets = allEnvironments.map(env => {
            const existing = existingTargets.find(t => t.environment === env);
            if (existing) {
                return {
                    environment: env,
                    enabled: true,
                    agentId: existing.agentId || '',
                    artifacts: Array.isArray(existing.artifacts) ? existing.artifacts.join(',') : '',
                    deployPath: existing.deployPath || '',
                    autoStart: existing.autoStart || false,
                    // Docker fields
                    port: existing.port || '',
                    containerPort: existing.containerPort || 3000,
                    dockerVolumes: existing.dockerVolumes || [],
                    dockerEnvVars: existing.dockerEnvVars || [],
                    dockerNetwork: existing.dockerNetwork || 'bridge'
                };
            } else {
                return {
                    environment: env,
                    enabled: false,
                    agentId: '',
                    artifacts: '',
                    deployPath: '',
                    autoStart: false,
                    port: '',
                    containerPort: 3000,
                    dockerVolumes: [],
                    dockerEnvVars: [],
                    dockerNetwork: 'bridge'
                };
            }
        });

        setIsEditingProject(true);
        setEditingProjectId(proj._id);
        setProjectForm({
            name: proj?.name || '',
            repoUrl: proj?.repoUrl || '',
            branch: proj?.branch || '',
            pipelineTemplateId: proj?.pipelineTemplateId || '',
            deploymentTargets: deploymentTargets
        });
        setShowProjectModal(true);
    };

    const handleProjectSubmit = async () => {
        // Validation
        if (!projectForm.name?.trim()) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'Project name is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }
        if (!projectForm.repoUrl?.trim()) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'Repository URL is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }
        if (!projectForm.pipelineTemplateId) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'Pipeline template is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        const enabledTargets = projectForm.deploymentTargets.filter(t => t.enabled);
        if (enabledTargets.length === 0) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'At least one deployment target must be enabled.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        for (const target of enabledTargets) {
            if (!target.agentId) {
                setConfirmDialog({
                    visible: true,
                    title: '⚠️ Validation Error',
                    message: `Agent is required for ${target.environment} environment.`,
                    type: 'warning',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
                return;
            }
            if (!target.deployPath?.trim()) {
                setConfirmDialog({
                    visible: true,
                    title: '⚠️ Validation Error',
                    message: `Deploy path is required for ${target.environment} environment.`,
                    type: 'warning',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
                return;
            }
        }

        const payload = {
            name: projectForm.name,
            repoUrl: projectForm.repoUrl,
            branch: projectForm.branch || 'main',
            pipelineTemplateId: projectForm.pipelineTemplateId || '',
            deploymentTargets: enabledTargets.map(t => ({
                agentId: t.agentId || '',
                environment: t.environment,
                artifacts: t.artifacts ? t.artifacts.split(',').map(s => s.trim()).filter(Boolean) : [],
                deployPath: t.deployPath || '',
                autoStart: t.autoStart || false,
                // Docker fields
                port: t.port ? parseInt(t.port) : undefined,
                containerPort: t.containerPort ? parseInt(t.containerPort) : 3000,
                dockerVolumes: Array.isArray(t.dockerVolumes) ? t.dockerVolumes : [],
                dockerEnvVars: Array.isArray(t.dockerEnvVars) ? t.dockerEnvVars : [],
                dockerNetwork: t.dockerNetwork || 'bridge',
            }))
        };

        if (isEditingProject) {
            payload._id = editingProjectId;
            const [ok, result] = await updateDeploymentProject(payload);
            if (ok) {
                setShowProjectModal(false);
                setIsEditingProject(false);
                setEditingProjectId(null);
                reload();
            } else {
                setConfirmDialog({
                    visible: true,
                    title: '❌ Error',
                    message: result || 'Failed to update project',
                    type: 'danger',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
            }
        } else {
            const [ok, result] = await createDeploymentProject(payload);
            if (ok) {
                setShowProjectModal(false);
                reload();
            } else {
                setConfirmDialog({
                    visible: true,
                    title: '❌ Error',
                    message: result || 'Failed to create project',
                    type: 'danger',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
            }
        }
    };

    const removeProject = (project) => {
        setConfirmDialog({
            visible: true,
            title: '🗑️ Delete Project',
            message: `Are you sure you want to delete "${project.name}"?\n\nThis action cannot be undone. All deployment configurations will be lost.`,
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, visible: false });
                const [ok, result] = await deleteDeploymentProject(project._id);
                if (ok) {
                    reload();
                } else {
                    setTimeout(() => {
                        setConfirmDialog({
                            visible: true,
                            title: '❌ Error',
                            message: result || 'Failed to delete project',
                            type: 'danger',
                            confirmText: 'OK',
                            onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                        });
                    }, 100);
                }
            }
        });
    };

    // Pipeline handlers
    const openAddPipeline = () => {
        setIsEditingPipeline(false);
        setEditingPipelineId(null);
        setPipelineForm({
            templateName: '',
            language: '',
            framework: '',
            buildCommands: '',
            runCommands: '',
            stopCommands: '',
            useDocker: false,
            dockerImage: '',
            dockerfile: '',
            dockerBuildArgs: [],
            autoGenerateDockerfile: false
        });
        setShowPipelineModal(true);
    };

    const openEditPipeline = (tpl) => {
        setIsEditingPipeline(true);
        setEditingPipelineId(tpl._id);
        setPipelineForm({
            templateName: tpl.templateName || '',
            language: tpl.language || '',
            framework: tpl.framework || '',
            buildCommands: (tpl.buildCommands || []).join('\n'),
            runCommands: (tpl.runCommands || []).join('\n'),
            stopCommands: (tpl.stopCommands || []).join('\n'),
            // Docker fields
            useDocker: tpl.useDocker || false,
            dockerImage: tpl.dockerImage || '',
            dockerfile: tpl.dockerfile || '',
            dockerBuildArgs: tpl.dockerBuildArgs || [],
            autoGenerateDockerfile: tpl.autoGenerateDockerfile || false,
        });
        setShowPipelineModal(true);
    };

    const handlePipelineSubmit = async () => {
        if (!pipelineForm.templateName?.trim()) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'Template name is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        const buildCommands = pipelineForm.buildCommands.split('\n').map(s => s.trim()).filter(Boolean);
        // Build commands only required when NOT using Docker
        if (!pipelineForm.useDocker && buildCommands.length === 0) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'At least one build command is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        const payload = {
            templateName: pipelineForm.templateName,
            language: pipelineForm.language,
            framework: pipelineForm.framework,
            buildCommands: buildCommands,
            runCommands: pipelineForm.runCommands.split('\n').map(s => s.trim()).filter(Boolean),
            stopCommands: pipelineForm.stopCommands.split('\n').map(s => s.trim()).filter(Boolean),
            // Docker fields
            useDocker: pipelineForm.useDocker || false,
            dockerImage: pipelineForm.dockerImage || '',
            dockerfile: pipelineForm.dockerfile || '',
            dockerBuildArgs: pipelineForm.dockerBuildArgs || [],
            autoGenerateDockerfile: pipelineForm.autoGenerateDockerfile || false,
        };

        if (isEditingPipeline) {
            payload._id = editingPipelineId;
            const [ok, result] = await updatePipelineTemplate(payload);
            if (ok) {
                setShowPipelineModal(false);
                setIsEditingPipeline(false);
                setEditingPipelineId(null);
                reload();
            } else {
                setConfirmDialog({
                    visible: true,
                    title: '❌ Error',
                    message: result || 'Failed to update pipeline',
                    type: 'danger',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
            }
        } else {
            const [ok, result] = await createPipelineTemplate(payload);
            if (ok) {
                setShowPipelineModal(false);
                reload();
            } else {
                setConfirmDialog({
                    visible: true,
                    title: '❌ Error',
                    message: result || 'Failed to create pipeline',
                    type: 'danger',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                });
            }
        }
    };

    const removePipeline = (template) => {
        setConfirmDialog({
            visible: true,
            title: '🗑️ Delete Pipeline',
            message: `Are you sure you want to delete pipeline "${template.templateName}"?\n\nProjects using this pipeline will need to be reconfigured.`,
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, visible: false });
                const [ok, result] = await deletePipelineTemplate(template._id);
                if (ok) {
                    reload();
                } else {
                    setTimeout(() => {
                        setConfirmDialog({
                            visible: true,
                            title: '❌ Error',
                            message: result || 'Failed to delete pipeline',
                            type: 'danger',
                            confirmText: 'OK',
                            onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                        });
                    }, 100);
                }
            }
        });
    };

    const removeAgent = (agent) => {
        setConfirmDialog({
            visible: true,
            title: '🗑️ Delete Agent',
            message: `Are you sure you want to delete agent "${agent.name}"?\n\nThis action cannot be undone. Projects using this agent will need to be reconfigured.`,
            type: 'danger',
            confirmText: 'Delete',
            onConfirm: async () => {
                setConfirmDialog({ ...confirmDialog, visible: false });
                const { deleteAgent } = await import('../../api/agents/DELETE');
                const [ok, result] = await deleteAgent(agent._id);
                if (ok) {
                    reload();
                } else {
                    setTimeout(() => {
                        setConfirmDialog({
                            visible: true,
                            title: '❌ Error',
                            message: result || 'Failed to delete agent',
                            type: 'danger',
                            confirmText: 'OK',
                            onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
                        });
                    }, 100);
                }
            }
        });
    };

    // Agent handlers
    const openAddAgent = () => {
        setIsEditingAgent(false);
        setEditingAgentId(null);
        setAgentForm({ name: '', hostType: 'Linux', description: '' });
        setShowAgentModal(true);
    };

    const handleAgentSubmit = async () => {
        if (!agentForm.name?.trim()) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'Agent name is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }
        if (!agentForm.hostType) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Validation Error',
                message: 'Host type is required.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
            return;
        }

        const { registerAgent } = await import('../../api/agents/POST');
        const [ok, result] = await registerAgent(agentForm);
        if (ok) {
            setShowAgentModal(false);
            reload();
        } else {
            setConfirmDialog({
                visible: true,
                title: '❌ Error',
                message: result || 'Failed to register agent',
                type: 'danger',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog({ ...confirmDialog, visible: false })
            });
        }
    };

    const createSampleTemplate = async () => {
        const sample = {
            templateName: 'React.js Template',
            buildCommands: ['npm install', 'npm run build'],
            runCommands: ['npm start'],
            stopCommands: [],
            defaultBranch: 'main',
            language: 'JavaScript',
            framework: 'React'
        };
        const [ok] = await createPipelineTemplate(sample);
        if (ok) reload();
    };

    return (
        <div style={{ paddingLeft: '15', paddingRight: '15' }}>
            {loading && <Loader />}

            {/* Tabs */}
            <div className="tabs">
                <button className={`tab ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>Projects</button>
                <button className={`tab ${activeTab === 'pipelines' ? 'active' : ''}`} onClick={() => setActiveTab('pipelines')}>Pipelines</button>
                <button className={`tab ${activeTab === 'agents' ? 'active' : ''}`} onClick={() => setActiveTab('agents')}>Agents</button>
                <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>Job History</button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'projects' && (
                <ProjectsTab
                    environment={environment}
                    envOptions={envOptions}
                    setEnvironment={setEnvironment}
                    templates={templates}
                    projects={projects}
                    agents={agents}
                    agentStatus={agentStatus}
                    loading={loading}
                    styles={styles}
                    openAddProject={openAddProject}
                    openEditProject={openEditProject}
                    removeProject={removeProject}
                    setConfirmDialog={setConfirmDialog}
                    confirmDialog={confirmDialog}
                    setJobLogsModal={setJobLogsModal}
                    actionLoading={actionLoading}
                    setActionLoading={setActionLoading}
                />
            )}

            {activeTab === 'pipelines' && (
                <PipelinesTab
                    templates={templates}
                    loading={loading}
                    styles={styles}
                    openAddPipeline={openAddPipeline}
                    openEditPipeline={openEditPipeline}
                    removePipeline={removePipeline}
                    createSampleTemplate={createSampleTemplate}
                />
            )}

            {activeTab === 'agents' && (
                <AgentsTab
                    agents={agents}
                    agentStatus={agentStatus}
                    loading={loading}
                    styles={styles}
                    openAddAgent={openAddAgent}
                    setShowDownloadAgent={setShowDownloadAgent}
                    setAgentStatus={setAgentStatus}
                    removeAgent={removeAgent}
                />
            )}

            {activeTab === 'history' && (
                <div style={{ marginBottom: '12px' }}>
                    <JobHistory
                        projects={projects}
                        agents={agents}
                        onViewLogs={(job, project, agent) => {
                            setJobLogsModal({
                                visible: true,
                                jobId: job.jobId,
                                jobInfo: {
                                    projectName: project?.name || job.projectId,
                                    environment: job.payload?.environment,
                                    type: job.type,
                                    agentName: agent?.name
                                }
                            });
                        }}
                        selectStyle={styles.selectStyle}
                    />
                </div>
            )}

            {/* Modals */}
            <ProjectModal
                visible={showProjectModal}
                onClose={() => setShowProjectModal(false)}
                form={projectForm}
                setForm={setProjectForm}
                templates={templates}
                agents={agents}
                onSubmit={handleProjectSubmit}
                isEditMode={isEditingProject}
                styles={styles}
                createSampleTemplate={createSampleTemplate}
            />

            <PipelineModal
                visible={showPipelineModal}
                onClose={() => setShowPipelineModal(false)}
                form={pipelineForm}
                setForm={setPipelineForm}
                onSubmit={handlePipelineSubmit}
                onDelete={() => {
                    const templateToDelete = templates.find(t => t._id === editingPipelineId);
                    if (templateToDelete) {
                        removePipeline(templateToDelete);
                        setShowPipelineModal(false);
                    }
                }}
                isEditMode={isEditingPipeline}
                styles={styles}
            />

            <AgentModal
                visible={showAgentModal}
                onClose={() => setShowAgentModal(false)}
                form={agentForm}
                setForm={setAgentForm}
                onSubmit={handleAgentSubmit}
                isEditMode={isEditingAgent}
                styles={styles}
            />

            <AgentDownloadModal
                visible={!!showDownloadAgent}
                onClose={() => setShowDownloadAgent(null)}
                agent={showDownloadAgent}
                styles={styles}
            />

            <JobLogsModal
                visible={jobLogsModal.visible}
                jobId={jobLogsModal.jobId}
                jobInfo={jobLogsModal.jobInfo}
                onClose={() => {
                    setJobLogsModal({ visible: false, jobId: null, jobInfo: {} });
                    // Reload data to sync with backend after modal closes
                    reload();
                }}
            />

            <ConfirmDialog
                visible={confirmDialog.visible}
                title={confirmDialog.title}
                message={confirmDialog.message}
                type={confirmDialog.type}
                confirmText={confirmDialog.confirmText}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({ ...confirmDialog, visible: false })}
            />
        </div>
    );
};

export default Deployments;
