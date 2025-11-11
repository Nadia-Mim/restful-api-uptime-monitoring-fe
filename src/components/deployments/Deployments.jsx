import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../common/modals/customModal/CustomModal';
import Loader from '../common/loader/Loader';
import { listDeploymentProjects } from '../../api/deploymentProjects/GET';
import { listPipelineTemplates } from '../../api/pipelines/GET';
import { createPipelineTemplate } from '../../api/pipelines/POST';
import { updatePipelineTemplate } from '../../api/pipelines/PUT';
import { deletePipelineTemplate } from '../../api/pipelines/DELETE';
import { createDeploymentProject } from '../../api/deploymentProjects/POST';
import { updateDeploymentProject } from '../../api/deploymentProjects/PUT';
import { deleteDeploymentProject } from '../../api/deploymentProjects/DELETE';
import { triggerDeploymentRun } from '../../api/deploymentRuns/POST';
import { getDeploymentLogs } from '../../api/deploymentLogs/GET';
import DeleteIcon from '../../icons/DeleteIcon.svg'
import EditIcon from '../../icons/EditIcon.svg'
import RunIcon from '../../icons/RunIcon.svg'

const envOptions = [
    { value: 'dev', label: 'Dev' },
    { value: 'staging', label: 'Staging' },
    { value: 'production', label: 'Production' },
];

// Unified styling to match API modal inputs (single styles object per component)
const styles = {
    inputFieldStyle: {
        width: '97%',
        border: '1px solid rgba(130, 141, 153, 0.5)',
        borderRadius: '5px',
        background: '#1E1F26',
        padding: '8px',
        fontSize: '17px',
        fontWeight: 300,
        color: '#fff',
    },
    blueButton: {
        background: '#4545E6',
        height: '22px',
        width: '120px',
        padding: '9px 14px',
        cursor: 'pointer',
        borderRadius: '5px'
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
    const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'pipelines' | 'agents'
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [agents, setAgents] = useState([]);
    const [showAddAgent, setShowAddAgent] = useState(false);
    const [agentForm, setAgentForm] = useState({ name: '', hostType: 'Linux', description: '' });
    const [agentStatus, setAgentStatus] = useState({}); // { [agentId]: { status, lastCheckIn } }
    const [showDownloadAgent, setShowDownloadAgent] = useState(null); // holds agent object
    const [downloadOs, setDownloadOs] = useState('linux');
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ name: '', repoUrl: '', branch: '', pipelineTemplateId: '', environment: 'dev' });
    const [logView, setLogView] = useState({ open: false, runId: null, items: [], lastTs: null });
    const [showAddPipeline, setShowAddPipeline] = useState(false);
    const [showEditPipeline, setShowEditPipeline] = useState(null); // holds template object or null
    const [showEditProject, setShowEditProject] = useState(null); // holds project object or null
    const [pipelineForm, setPipelineForm] = useState({
        templateName: '',
        language: '',
        framework: '',
        defaultBranch: 'main',
        buildCommands: '',
        runCommands: '',
        stopCommands: '',
    });
    const [editProjectForm, setEditProjectForm] = useState({ name: '', repoUrl: '', branch: '', pipelineTemplateId: '' });

    const reload = async () => {
        setLoading(true);
        const [okP, dataP] = await listDeploymentProjects(environment);
        const [okT, dataT] = await listPipelineTemplates();
        if (okP) setProjects(dataP);
        if (okT) setTemplates(dataT);
        // Load agents only when needed, but cheap to fetch alongside
        try {
            const { listAgents } = await import('../../api/agents/GET');
            const [okA, dataA] = await listAgents();
            if (okA) setAgents(dataA);
        } catch { }
        setLoading(false);
    };
    // Periodically validate agent status when Agents tab is active
    useEffect(() => {
        let timer;
        const run = async () => {
            if (activeTab !== 'agents' || !agents?.length) return;
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
        if (activeTab === 'agents') {
            timer = setInterval(run, 30000); // 30s
        }
        return () => timer && clearInterval(timer);
    }, [activeTab, agents]);

    useEffect(() => { reload(); }, [environment, activeTab]);

    const addProject = async () => {
        const payload = { ...form, environment };
        const [ok] = await createDeploymentProject(payload);
        if (ok) {
            setShowAdd(false);
            setForm({ name: '', repoUrl: '', branch: '', pipelineTemplateId: '', environment });
            reload();
        }
    };

    const runNow = async (p) => {
        const [ok, run] = await triggerDeploymentRun({ deploymentId: p._id, environment });
        if (ok) {
            setLogView({ open: true, runId: run.runId, items: [], lastTs: null });
            pollLogs(run.runId, null);
        }
    };

    const pollLogs = async (runId, since) => {
        let currentSince = since;
        const [ok, logs] = await getDeploymentLogs(runId, currentSince);
        if (ok && logs.length) {
            const lastTs = new Date(logs[logs.length - 1].timestamp).getTime();
            setLogView((lv) => ({ open: true, runId, items: [...lv.items, ...logs], lastTs }));
            currentSince = lastTs;
        }
        // keep polling while modal open
        setTimeout(() => {
            setLogView((lv) => {
                if (!lv.open || lv.runId !== runId) return lv;
                pollLogs(runId, lv.lastTs);
                return lv;
            });
        }, 2000);
    };

    const removeProject = async (id) => {
        const [ok] = await deleteDeploymentProject(id);
        if (ok) reload();
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

    const openAddPipeline = () => {
        setPipelineForm({ templateName: '', language: '', framework: '', defaultBranch: 'main', buildCommands: '', runCommands: '', stopCommands: '' });
        setShowAddPipeline(true);
    };

    const openEditProject = (proj) => {
        setShowEditProject(proj);
        setEditProjectForm({
            name: proj?.name || '',
            repoUrl: proj?.repoUrl || '',
            branch: proj?.branch || '',
            pipelineTemplateId: proj?.pipelineTemplateId || ''
        });
    };

    const saveEditedProject = async () => {
        const payload = {
            _id: showEditProject._id,
            name: editProjectForm.name,
            repoUrl: editProjectForm.repoUrl,
            branch: editProjectForm.branch,
            pipelineTemplateId: editProjectForm.pipelineTemplateId || ''
        };
        const [ok] = await updateDeploymentProject(payload);
        if (ok) {
            setShowEditProject(null);
            reload();
        }
    };

    const saveNewPipeline = async () => {
        const payload = {
            templateName: pipelineForm.templateName,
            language: pipelineForm.language,
            framework: pipelineForm.framework,
            defaultBranch: pipelineForm.defaultBranch || 'main',
            buildCommands: pipelineForm.buildCommands.split('\n').map(s => s.trim()).filter(Boolean),
            runCommands: pipelineForm.runCommands.split('\n').map(s => s.trim()).filter(Boolean),
            stopCommands: pipelineForm.stopCommands.split('\n').map(s => s.trim()).filter(Boolean),
        };
        const [ok] = await createPipelineTemplate(payload);
        if (ok) {
            setShowAddPipeline(false);
            reload();
        }
    };

    const openEditPipeline = (tpl) => {
        setShowEditPipeline(tpl);
        setPipelineForm({
            templateName: tpl.templateName || '',
            language: tpl.language || '',
            framework: tpl.framework || '',
            defaultBranch: tpl.defaultBranch || 'main',
            buildCommands: (tpl.buildCommands || []).join('\n'),
            runCommands: (tpl.runCommands || []).join('\n'),
            stopCommands: (tpl.stopCommands || []).join('\n'),
        });
    };

    const saveEditedPipeline = async () => {
        const payload = {
            _id: showEditPipeline._id,
            templateName: pipelineForm.templateName,
            language: pipelineForm.language,
            framework: pipelineForm.framework,
            defaultBranch: pipelineForm.defaultBranch || 'main',
            buildCommands: pipelineForm.buildCommands.split('\n').map(s => s.trim()).filter(Boolean),
            runCommands: pipelineForm.runCommands.split('\n').map(s => s.trim()).filter(Boolean),
            stopCommands: pipelineForm.stopCommands.split('\n').map(s => s.trim()).filter(Boolean),
        };
        const [ok] = await updatePipelineTemplate(payload);
        if (ok) {
            setShowEditPipeline(null);
            reload();
        }
    };

    const removePipeline = async (id) => {
        const [ok] = await deletePipelineTemplate(id);
        if (ok) reload();
    };

    return (
        <div style={{ padding: '20px' }}>
            {loading && <Loader />}
            {/* Left-aligned tabs with underline indicator */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'projects' ? 'active' : ''}`}
                    aria-selected={activeTab === 'projects'}
                    onClick={() => setActiveTab('projects')}
                >
                    Projects
                </button>
                <button
                    className={`tab ${activeTab === 'pipelines' ? 'active' : ''}`}
                    aria-selected={activeTab === 'pipelines'}
                    onClick={() => setActiveTab('pipelines')}
                >
                    Pipelines
                </button>
                <button
                    className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
                    aria-selected={activeTab === 'agents'}
                    onClick={() => setActiveTab('agents')}
                >
                    Agents
                </button>
            </div>

            {/* Projects tab */}
            {activeTab === 'projects' && (
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
                        <div style={styles.blueButton} onClick={() => setShowAdd(true)}>+ Add Project</div>
                    </div>
                    {loading ? null : (
                        projects?.length ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
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
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                            <img
                                                src={RunIcon}
                                                style={{ cursor: 'pointer' }}
                                                alt='Run'
                                                title='Run'
                                                onClick={() => runNow(p)}
                                            />
                                            <img
                                                src={EditIcon}
                                                style={{ cursor: 'pointer' }}
                                                alt='Edit'
                                                title='Edit'
                                                onClick={() => openEditProject(p)}
                                            />
                                            <img
                                                src={DeleteIcon}
                                                style={{ cursor: 'pointer' }}
                                                alt='Delete'
                                                title='Delete'
                                                onClick={() => removeProject(p._id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No projects yet for this environment.</div>
                        )
                    )}
                </div>
            )}

            {/* Pipelines tab */}
            {activeTab === 'pipelines' && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        <div style={styles.blueButton} onClick={openAddPipeline}>+ Add Pipeline</div>
                        {templates.length === 0 && (
                            <button className="btn btn-secondary" onClick={createSampleTemplate}>Create sample React template</button>
                        )}
                    </div>
                    {loading ? null : (
                        templates?.length ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
                                {templates.map((t) => (
                                    <div key={t._id} className="api-details-card" style={{ padding: 12, background: '#1E1F2600', display: 'flex', flexDirection: 'column' }}>
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ fontSize: 12, color: '#8aa0bc' }}>Template Name</div>
                                                <div style={{ fontSize: 14, color: '#DCE4F0' }}>{t.templateName}</div>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ fontSize: 12, color: '#8aa0bc' }}>Template Language</div>
                                                <div style={{ fontSize: 14, color: '#DCE4F0' }}>{t.language || '-'}</div>
                                            </div>
                                            <div style={{ marginBottom: 8 }}>
                                                <div style={{ fontSize: 12, color: '#8aa0bc' }}>Template Framework</div>
                                                <div style={{ fontSize: 14, color: '#DCE4F0' }}>{t.framework || '-'}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                            <img src={EditIcon}
                                                style={{ cursor: 'pointer' }}
                                                alt='Edit'
                                                title='Edit'
                                                onClick={() => openEditPipeline(t)}
                                            />
                                            <img src={DeleteIcon}
                                                style={{ cursor: 'pointer' }}
                                                alt='Delete'
                                                title='Delete'
                                                onClick={() => removePipeline(t._id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No pipelines yet.</div>
                        )
                    )}
                </div>
            )
            }

            {/* Agents tab */}
            {activeTab === 'agents' && (
                <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                        <div style={{ ...styles.blueButton, width: '140px' }} onClick={() => setShowAddAgent(true)}>+ Register Agent</div>
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
                                            <div style={{ fontSize: 12, color: '#DCE4F0' }}>{(agentStatus[a._id]?.lastCheckIn || a.lastSeenAt) ? new Date(agentStatus[a._id]?.lastCheckIn || a.lastSeenAt).toLocaleString() : '—'}</div>
                                        </div>
                                        <div style={{ fontSize: 12, color: '#9fb0c6' }}>Token</div>
                                        <div style={{ fontSize: 12, color: '#c9d6e6', wordBreak: 'break-all' }}>{a.token}</div>
                                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                                            <button className="btn btn-secondary" onClick={async () => {
                                                const { validateAgent } = await import('../../api/agents/VALIDATE');
                                                const [ok, data] = await validateAgent(a._id);
                                                setAgentStatus(s => ({ ...s, [a._id]: ok && data ? data : { status: 'offline', lastCheckIn: null } }));
                                            }}>Validate Agent</button>
                                            <button className="btn btn-secondary" onClick={() => setShowDownloadAgent(a)}>Download</button>
                                        </div>
                                        <div style={{ marginTop: 6, fontSize: 12, color: '#9fb0c6' }}>
                                            Download will install and configure this agent to connect securely to the control server. You can also run the script via curl.
                                        </div>
                                        {/* Status message */}
                                        {agentStatus[a._id]?.status === 'online' && (
                                            <div className="glass-badge success" style={{ marginTop: 6 }}>✅ Agent is running and connected.</div>
                                        )}
                                        {agentStatus[a._id]?.status === 'offline' && (
                                            <div className="glass-badge danger" style={{ marginTop: 6 }}>⚠️ Agent not responding.</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No agents registered yet.</div>
                        )
                    )}
                </div>
            )}

            {/* Add Project Modal (simple inline) */}
            {
                showAdd && (
                    <CustomModal visible={showAdd} style={{ maxWidth: '600px' }}>
                        <CustomModalHeader onClose={() => setShowAdd(false)}>
                            Add Project
                        </CustomModalHeader>
                        <CustomModalBody style={{ padding: '15px 5%' }}>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <input className="glass-input" placeholder="Project Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={styles.inputFieldStyle} />
                                <input className="glass-input" placeholder="Git Repository URL" value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })} style={styles.inputFieldStyle} />
                                <input className="glass-input" placeholder="Branch (default from template)" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} style={styles.inputFieldStyle} />
                                <div>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Pipeline Template</div>
                                    <Select
                                        value={templates.map(t => ({ value: t._id, label: t.templateName })).find(o => o.value === form.pipelineTemplateId) || null}
                                        onChange={(e) => setForm({ ...form, pipelineTemplateId: e?.value || '' })}
                                        options={templates.map(t => ({ value: t._id, label: t.templateName }))}
                                        menuPortalTarget={document.body}
                                        menuPlacement="auto"
                                        styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        placeholder={'Select Pipeline Template'}
                                    />
                                </div>
                                {templates.length === 0 && (
                                    <div style={{ fontSize: 12, color: '#9fb0c6' }}>
                                        No templates yet. <button className="btn btn-secondary" onClick={createSampleTemplate}>Create sample React template</button>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                                <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
                                <div style={styles.blueButton} onClick={addProject}>Create</div>
                            </div>
                        </CustomModalBody>
                    </CustomModal>
                )
            }

            {/* Add Pipeline Modal */}
            {
                showAddPipeline && (
                    <CustomModal visible={showAddPipeline} style={{ maxWidth: '680px' }}>
                        <CustomModalHeader onClose={() => setShowAddPipeline(false)}>
                            Add Pipeline
                        </CustomModalHeader>
                        <CustomModalBody style={{ padding: '15px 5%' }}>
                            <div style={{ display: 'grid', gap: 10 }}>
                                <input className="glass-input" placeholder="Template Name" value={pipelineForm.templateName} onChange={(e) => setPipelineForm({ ...pipelineForm, templateName: e.target.value })} style={styles.inputFieldStyle} />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <input className="glass-input" placeholder="Language (e.g., JavaScript)" value={pipelineForm.language} onChange={(e) => setPipelineForm({ ...pipelineForm, language: e.target.value })} style={styles.inputFieldStyle} />
                                    <input className="glass-input" placeholder="Framework (e.g., React)" value={pipelineForm.framework} onChange={(e) => setPipelineForm({ ...pipelineForm, framework: e.target.value })} style={styles.inputFieldStyle} />
                                </div>
                                <input className="glass-input" placeholder="Default Branch (e.g., main)" value={pipelineForm.defaultBranch} onChange={(e) => setPipelineForm({ ...pipelineForm, defaultBranch: e.target.value })} style={styles.inputFieldStyle} />
                                <div>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Build Commands (one per line)</div>
                                    <textarea className="glass-input" rows={4} value={pipelineForm.buildCommands} onChange={(e) => setPipelineForm({ ...pipelineForm, buildCommands: e.target.value })} style={styles.inputFieldStyle} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Run Commands (one per line)</div>
                                    <textarea className="glass-input" rows={3} value={pipelineForm.runCommands} onChange={(e) => setPipelineForm({ ...pipelineForm, runCommands: e.target.value })} style={styles.inputFieldStyle} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Stop Commands (one per line)</div>
                                    <textarea className="glass-input" rows={3} value={pipelineForm.stopCommands} onChange={(e) => setPipelineForm({ ...pipelineForm, stopCommands: e.target.value })} style={styles.inputFieldStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                                <button className="btn btn-secondary" onClick={() => setShowAddPipeline(false)}>Cancel</button>
                                <div style={styles.blueButton} onClick={saveNewPipeline}>Save Pipeline</div>
                            </div>
                        </CustomModalBody>
                    </CustomModal>
                )
            }

            {/* Edit Pipeline Modal (using CustomModal) */}
            {showEditPipeline && (
                <CustomModal visible={!!showEditPipeline} style={{ maxWidth: '680px' }}>
                    <CustomModalHeader onClose={() => setShowEditPipeline(null)}>
                        Edit Pipeline
                    </CustomModalHeader>
                    <CustomModalBody style={{ padding: '15px 5%' }}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <input className="glass-input" placeholder="Template Name" value={pipelineForm.templateName} onChange={(e) => setPipelineForm({ ...pipelineForm, templateName: e.target.value })} style={styles.inputFieldStyle} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <input className="glass-input" placeholder="Language (e.g., JavaScript)" value={pipelineForm.language} onChange={(e) => setPipelineForm({ ...pipelineForm, language: e.target.value })} style={styles.inputFieldStyle} />
                                <input className="glass-input" placeholder="Framework (e.g., React)" value={pipelineForm.framework} onChange={(e) => setPipelineForm({ ...pipelineForm, framework: e.target.value })} style={styles.inputFieldStyle} />
                            </div>
                            <input className="glass-input" placeholder="Default Branch (e.g., main)" value={pipelineForm.defaultBranch} onChange={(e) => setPipelineForm({ ...pipelineForm, defaultBranch: e.target.value })} style={styles.inputFieldStyle} />
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Build Commands (one per line)</div>
                                <textarea className="glass-input" rows={4} value={pipelineForm.buildCommands} onChange={(e) => setPipelineForm({ ...pipelineForm, buildCommands: e.target.value })} style={styles.inputFieldStyle} />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Run Commands (one per line)</div>
                                <textarea className="glass-input" rows={3} value={pipelineForm.runCommands} onChange={(e) => setPipelineForm({ ...pipelineForm, runCommands: e.target.value })} style={styles.inputFieldStyle} />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Stop Commands (one per line)</div>
                                <textarea className="glass-input" rows={3} value={pipelineForm.stopCommands} onChange={(e) => setPipelineForm({ ...pipelineForm, stopCommands: e.target.value })} style={styles.inputFieldStyle} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: 14 }}>
                            <button className="btn btn-secondary" onClick={() => setShowEditPipeline(null)}>Cancel</button>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-secondary" onClick={() => removePipeline(showEditPipeline._id)}>Delete</button>
                                <div style={styles.blueButton} onClick={saveEditedPipeline}>Save</div>
                            </div>
                        </div>
                    </CustomModalBody>
                </CustomModal>
            )}

            {/* Download Agent Modal */}
            {showDownloadAgent && (
                <CustomModal visible={!!showDownloadAgent} style={{ maxWidth: '760px' }}>
                    <CustomModalHeader onClose={() => setShowDownloadAgent(null)}>
                        Download Agent
                    </CustomModalHeader>
                    <CustomModalBody style={{ padding: '15px 5%' }}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <div style={{ color: '#DCE4F0' }}>
                                Once an agent is registered, you can download its setup script to install it on your target system. This script will:
                                <ul style={{ marginTop: 8 }}>
                                    <li>Automatically register your agent with the control plane using a unique token.</li>
                                    <li>Configure it to run in the background on macOS or Linux.</li>
                                    <li>Establish a secure outbound connection to the control server for receiving tasks and sending logs.</li>
                                </ul>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Target OS</div>
                                <Select
                                    value={[{ value: 'linux', label: 'Linux' }, { value: 'mac', label: 'macOS' }].find(o => o.value === downloadOs)}
                                    onChange={(e) => setDownloadOs(e?.value || 'linux')}
                                    options={[{ value: 'linux', label: 'Linux' }, { value: 'mac', label: 'macOS' }]}
                                    menuPortalTarget={document.body}
                                    menuPlacement="auto"
                                    styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                />
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>How to use</div>
                                <div className="glass-card" style={{ padding: 10, fontFamily: 'monospace', fontSize: 13, color: '#DCE4F0' }}>
                                    {`curl -fsSL ${import.meta?.env?.VITE_API_BASE || 'http://localhost:5050'}/deploymentAgents?action=download&id=${showDownloadAgent?._id}&os=${downloadOs} | bash`}
                                </div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 6 }}>
                                    You can also open the link directly: <a href={`${import.meta?.env?.VITE_API_BASE || 'http://localhost:5050'}/deploymentAgents?action=download&id=${showDownloadAgent?._id}&os=${downloadOs}`} target="_blank" rel="noreferrer">download script</a>
                                </div>
                            </div>
                            <div style={{ fontSize: 12, color: '#9fb0c6' }}>
                                Make sure your system allows outbound HTTPS connections to the control server. No inbound ports are required.
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                <button className="btn btn-secondary" onClick={() => setShowDownloadAgent(null)}>Close</button>
                            </div>
                        </div>
                    </CustomModalBody>
                </CustomModal>
            )}

            {/* Edit Project Modal */}
            {showEditProject && (
                <CustomModal visible={!!showEditProject} style={{ maxWidth: '600px' }}>
                    <CustomModalHeader onClose={() => setShowEditProject(null)}>
                        Edit Project
                    </CustomModalHeader>
                    <CustomModalBody style={{ padding: '15px 5%' }}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <input className="glass-input" placeholder="Project Name" value={editProjectForm.name} onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })} style={styles.inputFieldStyle} />
                            <input className="glass-input" placeholder="Git Repository URL" value={editProjectForm.repoUrl} onChange={(e) => setEditProjectForm({ ...editProjectForm, repoUrl: e.target.value })} style={styles.inputFieldStyle} />
                            <input className="glass-input" placeholder="Branch (default from template)" value={editProjectForm.branch} onChange={(e) => setEditProjectForm({ ...editProjectForm, branch: e.target.value })} style={styles.inputFieldStyle} />
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Pipeline Template</div>
                                <Select
                                    value={templates.map(t => ({ value: t._id, label: t.templateName })).find(o => o.value === editProjectForm.pipelineTemplateId) || null}
                                    onChange={(e) => setEditProjectForm({ ...editProjectForm, pipelineTemplateId: e?.value || '' })}
                                    options={templates.map(t => ({ value: t._id, label: t.templateName }))}
                                    menuPortalTarget={document.body}
                                    menuPlacement="auto"
                                    styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    placeholder={'Select Pipeline Template'}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                            <button className="btn btn-secondary" onClick={() => setShowEditProject(null)}>Cancel</button>
                            <div style={styles.blueButton} onClick={saveEditedProject}>Save</div>
                        </div>
                    </CustomModalBody>
                </CustomModal>
            )}

            {/* Register Agent Modal */}
            {showAddAgent && (
                <CustomModal visible={showAddAgent} style={{ maxWidth: '520px' }}>
                    <CustomModalHeader onClose={() => setShowAddAgent(false)}>
                        Register New Agent
                    </CustomModalHeader>
                    <CustomModalBody style={{ padding: '15px 5%' }}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            <input className="glass-input" placeholder="Agent Name" value={agentForm.name} onChange={(e) => setAgentForm({ ...agentForm, name: e.target.value })} style={styles.inputFieldStyle} />
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Host Type</div>
                                <Select
                                    value={[{ value: 'Linux', label: 'Linux' }, { value: 'macOS', label: 'macOS' }, { value: 'Windows', label: 'Windows' }].find(o => o.value === agentForm.hostType)}
                                    onChange={(e) => setAgentForm({ ...agentForm, hostType: e?.value })}
                                    options={[{ value: 'Linux', label: 'Linux' }, { value: 'macOS', label: 'macOS' }, { value: 'Windows', label: 'Windows' }]}
                                    menuPortalTarget={document.body}
                                    menuPlacement="auto"
                                    styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    placeholder={'Select Host Type'}
                                />
                            </div>
                            <textarea className="glass-input" placeholder="Description (optional)" rows={3} value={agentForm.description} onChange={(e) => setAgentForm({ ...agentForm, description: e.target.value })} style={styles.inputFieldStyle} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
                            <button className="btn btn-secondary" onClick={() => setShowAddAgent(false)}>Cancel</button>
                            <div style={styles.blueButton} onClick={async () => {
                                const { registerAgent } = await import('../../api/agents/POST');
                                const [ok] = await registerAgent(agentForm);
                                if (ok) { setShowAddAgent(false); setAgentForm({ name: '', hostType: 'Linux', description: '' }); reload(); }
                            }}>Register</div>
                        </div>
                    </CustomModalBody>
                </CustomModal>
            )}

            {/* Logs Modal */}
            {
                logView.open && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={() => setLogView({ open: false, runId: null, items: [], lastTs: null })}>
                        <div className="glass-card" style={{ width: 800, maxWidth: '95vw', height: 520, padding: 0, display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ padding: 12, borderBottom: '1px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center' }}>
                                <div style={{ fontWeight: 700, color: '#DCE4F0' }}>Run Logs — {logView.runId}</div>
                                <button className="btn btn-secondary" style={{ marginLeft: 'auto' }} onClick={() => setLogView({ open: false, runId: null, items: [], lastTs: null })}>Close</button>
                            </div>
                            <div style={{ padding: 12, overflow: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12, flex: 1 }}>
                                {logView.items.map((l, i) => (
                                    <div key={i} style={{ color: l.streamType === 'stderr' ? '#FF7A7A' : '#DCE4F0' }}>{l.content}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Deployments;
