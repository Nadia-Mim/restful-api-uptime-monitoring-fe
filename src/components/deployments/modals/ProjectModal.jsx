import React from 'react';
import Select from 'react-select';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../../common/modals/customModal/CustomModal';

const ProjectModal = ({
    visible,
    onClose,
    form,
    setForm,
    templates,
    agents,
    onSubmit,
    isEditMode,
    styles,
    createSampleTemplate
}) => {
    if (!visible) return null;

    return (
        <CustomModal visible={visible} style={{ maxWidth: '800px', maxHeight: '90vh' }}>
            <CustomModalHeader onClose={onClose}>
                {isEditMode ? 'Edit Project' : 'Add Project'}
            </CustomModalHeader>
            <CustomModalBody style={{ padding: '15px 5%', maxHeight: 'calc(90vh - 60px)', overflowY: 'auto', overflowX: 'hidden' }}>
                <div style={{ display: 'grid', gap: 10 }}>
                    <input
                        className="glass-input"
                        placeholder="Project Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
                    <input
                        className="glass-input"
                        placeholder="Git Repository URL"
                        value={form.repoUrl}
                        onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
                    <input
                        className="glass-input"
                        placeholder="Default Branch (e.g., main)"
                        value={form.branch}
                        onChange={(e) => setForm({ ...form, branch: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
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

                    {/* Deployment Targets Section */}
                    <div style={{ marginTop: 16, padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                        <div style={{ fontSize: 14, color: '#DCE4F0', marginBottom: 12, fontWeight: 600 }}>
                            🎯 Deployment Targets
                        </div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 12 }}>
                            Configure which agents (servers) to deploy to for each environment
                        </div>

                        {form.deploymentTargets.map((target, idx) => (
                            <div key={target.environment} style={{ marginBottom: 16, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={target.enabled}
                                        onChange={(e) => {
                                            const newTargets = [...form.deploymentTargets];
                                            newTargets[idx].enabled = e.target.checked;
                                            setForm({ ...form, deploymentTargets: newTargets });
                                        }}
                                        style={{ cursor: 'pointer', width: 16, height: 16 }}
                                    />
                                    <label style={{ fontSize: 13, color: '#DCE4F0', fontWeight: 600, cursor: 'pointer' }}>
                                        {target.environment.toUpperCase()} Environment
                                    </label>
                                </div>

                                {target.enabled && (
                                    <div style={{ display: 'grid', gap: 8, marginLeft: 24 }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Select Agent (Server) *</div>
                                            <Select
                                                value={agents.map(a => ({ value: a._id, label: `${a.name} (${a.hostType})` })).find(o => o.value === target.agentId) || null}
                                                onChange={(e) => {
                                                    const newTargets = [...form.deploymentTargets];
                                                    newTargets[idx].agentId = e?.value || '';
                                                    setForm({ ...form, deploymentTargets: newTargets });
                                                }}
                                                options={agents.map(a => ({ value: a._id, label: `${a.name} (${a.hostType})` }))}
                                                menuPortalTarget={document.body}
                                                menuPlacement="auto"
                                                styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                placeholder="Select Agent"
                                            />
                                        </div>

                                        {/* Docker Port Configuration */}
                                        <div style={{ padding: '10px', background: 'rgba(58, 134, 255, 0.1)', borderRadius: '6px', border: '1px solid rgba(58, 134, 255, 0.2)' }}>
                                            <div style={{ fontSize: 11, color: '#58a6ff', marginBottom: 8, fontWeight: 600 }}>
                                                🐳 Docker Port Configuration
                                            </div>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                                <div>
                                                    <div style={{ fontSize: 10, color: '#9fb0c6', marginBottom: 4 }}>Host Port *</div>
                                                    <input
                                                        className="glass-input"
                                                        type="number"
                                                        placeholder="e.g., 8001"
                                                        value={target.port || ''}
                                                        onChange={(e) => {
                                                            const newTargets = [...form.deploymentTargets];
                                                            newTargets[idx].port = e.target.value ? parseInt(e.target.value) : '';
                                                            setForm({ ...form, deploymentTargets: newTargets });
                                                        }}
                                                        style={{ ...styles.inputFieldStyle, fontSize: 12 }}
                                                    />
                                                    <div style={{ fontSize: 9, color: '#7a8fa5', marginTop: 2 }}>
                                                        External port to access app
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 10, color: '#9fb0c6', marginBottom: 4 }}>Container Port</div>
                                                    <input
                                                        className="glass-input"
                                                        type="number"
                                                        placeholder="3000 (default)"
                                                        value={target.containerPort || ''}
                                                        onChange={(e) => {
                                                            const newTargets = [...form.deploymentTargets];
                                                            newTargets[idx].containerPort = e.target.value ? parseInt(e.target.value) : '';
                                                            setForm({ ...form, deploymentTargets: newTargets });
                                                        }}
                                                        style={{ ...styles.inputFieldStyle, fontSize: 12 }}
                                                    />
                                                    <div style={{ fontSize: 9, color: '#7a8fa5', marginTop: 2 }}>
                                                        Internal app port
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Docker Environment Variables */}
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ fontSize: 10, color: '#9fb0c6', marginBottom: 6 }}>
                                                    Environment Variables (for Docker container)
                                                </div>
                                                {(target.dockerEnvVars || []).map((env, envIdx) => (
                                                    <div key={envIdx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                                        <input
                                                            className="glass-input"
                                                            placeholder="Key"
                                                            value={env.key || ''}
                                                            onChange={(e) => {
                                                                const newTargets = [...form.deploymentTargets];
                                                                const envVars = [...(newTargets[idx].dockerEnvVars || [])];
                                                                envVars[envIdx] = { ...envVars[envIdx], key: e.target.value };
                                                                newTargets[idx].dockerEnvVars = envVars;
                                                                setForm({ ...form, deploymentTargets: newTargets });
                                                            }}
                                                            style={{ ...styles.inputFieldStyle, flex: 1, fontSize: 11 }}
                                                        />
                                                        <input
                                                            className="glass-input"
                                                            placeholder="Value"
                                                            value={env.value || ''}
                                                            onChange={(e) => {
                                                                const newTargets = [...form.deploymentTargets];
                                                                const envVars = [...(newTargets[idx].dockerEnvVars || [])];
                                                                envVars[envIdx] = { ...envVars[envIdx], value: e.target.value };
                                                                newTargets[idx].dockerEnvVars = envVars;
                                                                setForm({ ...form, deploymentTargets: newTargets });
                                                            }}
                                                            style={{ ...styles.inputFieldStyle, flex: 1, fontSize: 11 }}
                                                        />
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => {
                                                                const newTargets = [...form.deploymentTargets];
                                                                const envVars = [...(newTargets[idx].dockerEnvVars || [])];
                                                                envVars.splice(envIdx, 1);
                                                                newTargets[idx].dockerEnvVars = envVars;
                                                                setForm({ ...form, deploymentTargets: newTargets });
                                                            }}
                                                            style={{ fontSize: 10, padding: '2px 6px' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        const newTargets = [...form.deploymentTargets];
                                                        newTargets[idx].dockerEnvVars = [...(newTargets[idx].dockerEnvVars || []), { key: '', value: '' }];
                                                        setForm({ ...form, deploymentTargets: newTargets });
                                                    }}
                                                    style={{ fontSize: 10, padding: '4px 8px', marginTop: 4 }}
                                                >
                                                    + Add Env Var
                                                </button>
                                            </div>

                                            {/* Docker Volumes */}
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ fontSize: 10, color: '#9fb0c6', marginBottom: 6 }}>
                                                    Volume Mounts (optional)
                                                </div>
                                                {(target.dockerVolumes || []).map((vol, volIdx) => (
                                                    <div key={volIdx} style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                                        <input
                                                            className="glass-input"
                                                            placeholder="Host Path"
                                                            value={vol.host || ''}
                                                            onChange={(e) => {
                                                                const newTargets = [...form.deploymentTargets];
                                                                const volumes = [...(newTargets[idx].dockerVolumes || [])];
                                                                volumes[volIdx] = { ...volumes[volIdx], host: e.target.value };
                                                                newTargets[idx].dockerVolumes = volumes;
                                                                setForm({ ...form, deploymentTargets: newTargets });
                                                            }}
                                                            style={{ ...styles.inputFieldStyle, flex: 1, fontSize: 11 }}
                                                        />
                                                        <input
                                                            className="glass-input"
                                                            placeholder="Container Path"
                                                            value={vol.container || ''}
                                                            onChange={(e) => {
                                                                const newTargets = [...form.deploymentTargets];
                                                                const volumes = [...(newTargets[idx].dockerVolumes || [])];
                                                                volumes[volIdx] = { ...volumes[volIdx], container: e.target.value };
                                                                newTargets[idx].dockerVolumes = volumes;
                                                                setForm({ ...form, deploymentTargets: newTargets });
                                                            }}
                                                            style={{ ...styles.inputFieldStyle, flex: 1, fontSize: 11 }}
                                                        />
                                                        <button
                                                            className="btn btn-secondary"
                                                            onClick={() => {
                                                                const newTargets = [...form.deploymentTargets];
                                                                const volumes = [...(newTargets[idx].dockerVolumes || [])];
                                                                volumes.splice(volIdx, 1);
                                                                newTargets[idx].dockerVolumes = volumes;
                                                                setForm({ ...form, deploymentTargets: newTargets });
                                                            }}
                                                            style={{ fontSize: 10, padding: '2px 6px' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ))}
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        const newTargets = [...form.deploymentTargets];
                                                        newTargets[idx].dockerVolumes = [...(newTargets[idx].dockerVolumes || []), { host: '', container: '' }];
                                                        setForm({ ...form, deploymentTargets: newTargets });
                                                    }}
                                                    style={{ fontSize: 10, padding: '4px 8px', marginTop: 4 }}
                                                >
                                                    + Add Volume
                                                </button>
                                            </div>

                                            {/* Docker Network */}
                                            <div style={{ marginTop: 10 }}>
                                                <div style={{ fontSize: 10, color: '#9fb0c6', marginBottom: 4 }}>Network Mode</div>
                                                <select
                                                    className="glass-input"
                                                    value={target.dockerNetwork || 'bridge'}
                                                    onChange={(e) => {
                                                        const newTargets = [...form.deploymentTargets];
                                                        newTargets[idx].dockerNetwork = e.target.value;
                                                        setForm({ ...form, deploymentTargets: newTargets });
                                                    }}
                                                    style={{ ...styles.inputFieldStyle, fontSize: 11 }}
                                                >
                                                    <option value="bridge">bridge (default)</option>
                                                    <option value="host">host</option>
                                                    <option value="none">none</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Deploy Path on Agent Server *</div>
                                            <input
                                                className="glass-input"
                                                placeholder="e.g., /var/www/staging/my-app"
                                                value={target.deployPath}
                                                onChange={(e) => {
                                                    const newTargets = [...form.deploymentTargets];
                                                    newTargets[idx].deployPath = e.target.value;
                                                    setForm({ ...form, deploymentTargets: newTargets });
                                                }}
                                                style={styles.inputFieldStyle}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Artifacts to Deploy (comma-separated patterns)</div>
                                            <input
                                                className="glass-input"
                                                placeholder="e.g., dist/**,package.json,node_modules/**"
                                                value={target.artifacts}
                                                onChange={(e) => {
                                                    const newTargets = [...form.deploymentTargets];
                                                    newTargets[idx].artifacts = e.target.value;
                                                    setForm({ ...form, deploymentTargets: newTargets });
                                                }}
                                                style={styles.inputFieldStyle}
                                            />
                                            <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                                                Files/folders to copy after build completes (not needed for Docker deployments)
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <input
                                                type="checkbox"
                                                checked={target.autoStart}
                                                onChange={(e) => {
                                                    const newTargets = [...form.deploymentTargets];
                                                    newTargets[idx].autoStart = e.target.checked;
                                                    setForm({ ...form, deploymentTargets: newTargets });
                                                }}
                                                style={{ cursor: 'pointer', width: 14, height: 14 }}
                                            />
                                            <label style={{ fontSize: 11, color: '#9fb0c6', cursor: 'pointer' }}>
                                                Auto-start service after deployment (uses pipeline's run command)
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {agents.length === 0 && (
                            <div style={{ fontSize: 12, color: '#f0ad4e', marginTop: 8 }}>
                                ⚠️ No agents registered yet. Go to the Agents tab to register agents first.
                            </div>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '25px 0' }}>
                    <div
                        style={{ ...styles.redButton, marginRight: '15px' }}
                        onClick={onClose}
                    >
                        Cancel
                    </div>
                    <div
                        style={{ ...styles.blueButton, width: isEditMode ? '70px' : '60px' }}
                        onClick={onSubmit}
                    >
                        {isEditMode ? 'Update' : 'Create'}
                    </div>
                </div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default ProjectModal;
