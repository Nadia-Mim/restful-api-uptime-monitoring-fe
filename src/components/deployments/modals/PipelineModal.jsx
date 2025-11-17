import React, { useState } from 'react';
import Select from 'react-select';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../../common/modals/customModal/CustomModal';

const LANGUAGE_OPTIONS = [
    { value: 'nodejs', label: 'Node.js / JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' }
];

const FRAMEWORK_OPTIONS = {
    nodejs: [
        { value: 'express', label: 'Express.js' },
        { value: 'nextjs', label: 'Next.js' },
        { value: 'react', label: 'React (Vite)' },
        { value: 'angular', label: 'Angular' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'nestjs', label: 'NestJS' },
        { value: 'nodejs-vanilla', label: 'Plain Node.js' }
    ],
    python: [
        { value: 'django', label: 'Django' },
        { value: 'flask', label: 'Flask' },
        { value: 'python-vanilla', label: 'Plain Python' }
    ],
    java: [
        { value: 'springboot', label: 'Spring Boot' },
        { value: 'java-vanilla', label: 'Plain Java' }
    ]
};

const PipelineModal = ({
    visible,
    onClose,
    form,
    setForm,
    onSubmit,
    onDelete,
    isEditMode,
    styles
}) => {
    const [showDockerAdvanced, setShowDockerAdvanced] = useState(false);

    if (!visible) return null;

    const selectedLanguage = LANGUAGE_OPTIONS.find(opt => opt.value === form.language);
    const selectedFramework = form.language && FRAMEWORK_OPTIONS[form.language]
        ? FRAMEWORK_OPTIONS[form.language].find(opt => opt.value === form.framework)
        : null;
    const availableFrameworks = form.language && FRAMEWORK_OPTIONS[form.language]
        ? FRAMEWORK_OPTIONS[form.language]
        : [];

    const handleLanguageChange = (selected) => {
        setForm({ ...form, language: selected?.value || '', framework: '' });
    };

    const handleFrameworkChange = (selected) => {
        setForm({ ...form, framework: selected?.value || '' });
    };

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            background: 'rgba(255, 255, 255, 0.05)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            color: '#DCE4F0',
            minHeight: '38px',
            borderRadius: '6px',
            '&:hover': { borderColor: 'rgba(255, 255, 255, 0.2)' }
        }),
        menu: (base) => ({
            ...base,
            background: '#1e2936',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            zIndex: 999
        }),
        option: (base, state) => ({
            ...base,
            background: state.isFocused ? 'rgba(58, 134, 255, 0.2)' : 'transparent',
            color: '#DCE4F0',
            cursor: 'pointer',
            '&:hover': { background: 'rgba(58, 134, 255, 0.3)' }
        }),
        singleValue: (base) => ({
            ...base,
            color: '#DCE4F0'
        }),
        input: (base) => ({
            ...base,
            color: '#DCE4F0'
        }),
        placeholder: (base) => ({
            ...base,
            color: 'rgba(220, 228, 240, 0.4)'
        })
    };

    const addBuildArg = () => {
        const buildArgs = form.dockerBuildArgs || [];
        setForm({ ...form, dockerBuildArgs: [...buildArgs, { key: '', value: '' }] });
    };

    const removeBuildArg = (index) => {
        const buildArgs = [...(form.dockerBuildArgs || [])];
        buildArgs.splice(index, 1);
        setForm({ ...form, dockerBuildArgs: buildArgs });
    };

    const updateBuildArg = (index, field, value) => {
        const buildArgs = [...(form.dockerBuildArgs || [])];
        buildArgs[index] = { ...buildArgs[index], [field]: value };
        setForm({ ...form, dockerBuildArgs: buildArgs });
    };

    return (
        <CustomModal visible={visible} style={{ maxWidth: '700px', maxHeight: '90vh' }}>
            <CustomModalHeader onClose={onClose}>
                {isEditMode ? 'Edit Pipeline Template' : 'Add Pipeline Template'}
            </CustomModalHeader>
            <CustomModalBody style={{ padding: '15px 5%', maxHeight: 'calc(90vh - 60px)', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gap: 10 }}>
                    <input
                        className="glass-input"
                        placeholder="Template Name"
                        value={form.templateName}
                        onChange={(e) => setForm({ ...form, templateName: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Language *</div>
                        <Select
                            options={LANGUAGE_OPTIONS}
                            value={selectedLanguage}
                            onChange={handleLanguageChange}
                            placeholder="Select language..."
                            isClearable
                            styles={customSelectStyles}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Framework *</div>
                        <Select
                            options={availableFrameworks}
                            value={selectedFramework}
                            onChange={handleFrameworkChange}
                            placeholder={form.language ? 'Select framework...' : 'Select language first...'}
                            isClearable
                            isDisabled={!form.language}
                            styles={customSelectStyles}
                        />
                    </div>

                    {/* Docker Configuration Section */}
                    <div style={{ marginTop: 16, padding: '12px', background: 'rgba(58, 134, 255, 0.1)', borderRadius: '8px', border: '1px solid rgba(58, 134, 255, 0.3)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <input
                                type="checkbox"
                                id="useDocker"
                                checked={form.useDocker || false}
                                onChange={(e) => setForm({ ...form, useDocker: e.target.checked })}
                                style={{ cursor: 'pointer', width: 16, height: 16 }}
                            />
                            <label htmlFor="useDocker" style={{ fontSize: 14, color: '#DCE4F0', fontWeight: 600, cursor: 'pointer' }}>
                                🐳 Use Docker for Deployment
                            </label>
                        </div>

                        {form.useDocker && (
                            <div style={{ display: 'grid', gap: 10, marginLeft: 26 }}>
                                <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>
                                    Deploy this project in an isolated Docker container with automatic port management and dependency isolation.
                                </div>

                                <div>
                                    <input
                                        className="glass-input"
                                        placeholder="Docker Image (optional, e.g., my-app:latest)"
                                        value={form.dockerImage || ''}
                                        onChange={(e) => setForm({ ...form, dockerImage: e.target.value })}
                                        style={styles.inputFieldStyle}
                                    />
                                    <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                                        Leave empty to auto-generate image name from project name
                                    </div>
                                </div>

                                <div>
                                    <input
                                        className="glass-input"
                                        placeholder="Dockerfile Path (optional, e.g., ./Dockerfile)"
                                        value={form.dockerfile || ''}
                                        onChange={(e) => setForm({ ...form, dockerfile: e.target.value })}
                                        style={styles.inputFieldStyle}
                                    />
                                    <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                                        Path to your Dockerfile. Leave empty to use default "Dockerfile"
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        id="autoGenerateDockerfile"
                                        checked={form.autoGenerateDockerfile || false}
                                        onChange={(e) => setForm({ ...form, autoGenerateDockerfile: e.target.checked })}
                                        style={{ cursor: 'pointer', width: 14, height: 14 }}
                                    />
                                    <label htmlFor="autoGenerateDockerfile" style={{ fontSize: 11, color: '#9fb0c6', cursor: 'pointer' }}>
                                        Auto-generate Dockerfile if not found (detects language automatically)
                                    </label>
                                </div>

                                {/* Advanced Docker Options */}
                                <div style={{ marginTop: 8 }}>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowDockerAdvanced(!showDockerAdvanced)}
                                        style={{ fontSize: 11, padding: '4px 10px' }}
                                    >
                                        {showDockerAdvanced ? '▼' : '▶'} Advanced: Build Arguments
                                    </button>

                                    {showDockerAdvanced && (
                                        <div style={{ marginTop: 10, padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                            <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 8 }}>
                                                Docker Build Arguments (--build-arg key=value)
                                            </div>
                                            {(form.dockerBuildArgs || []).map((arg, idx) => (
                                                <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                                                    <input
                                                        className="glass-input"
                                                        placeholder="Key (e.g., NODE_ENV)"
                                                        value={arg.key}
                                                        onChange={(e) => updateBuildArg(idx, 'key', e.target.value)}
                                                        style={{ ...styles.inputFieldStyle, flex: 1 }}
                                                    />
                                                    <input
                                                        className="glass-input"
                                                        placeholder="Value (e.g., production)"
                                                        value={arg.value}
                                                        onChange={(e) => updateBuildArg(idx, 'value', e.target.value)}
                                                        style={{ ...styles.inputFieldStyle, flex: 1 }}
                                                    />
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => removeBuildArg(idx)}
                                                        style={{ fontSize: 11, padding: '4px 8px' }}
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                            <button
                                                className="btn btn-secondary"
                                                onClick={addBuildArg}
                                                style={{ fontSize: 11, padding: '4px 10px', marginTop: 6 }}
                                            >
                                                + Add Build Arg
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 4 }}>
                            {form.useDocker ? 'Pre-Build Commands (one per line)' : 'Build Commands (one per line) *'}
                        </div>
                        <textarea
                            className="glass-input"
                            placeholder="npm install&#10;npm run build"
                            value={form.buildCommands}
                            onChange={(e) => setForm({ ...form, buildCommands: e.target.value })}
                            style={{ ...styles.inputFieldStyle, minHeight: '80px', resize: 'vertical' }}
                        />
                        <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                            {form.useDocker
                                ? 'Commands to run before Docker build (e.g., install dependencies, compile assets)'
                                : 'Commands to build the project. These run in sequence.'}
                        </div>
                    </div>

                    {!form.useDocker && (
                        <>
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 4 }}>Run Commands (one per line)</div>
                                <textarea
                                    className="glass-input"
                                    placeholder="npm start&#10;or: node server.js"
                                    value={form.runCommands}
                                    onChange={(e) => setForm({ ...form, runCommands: e.target.value })}
                                    style={{ ...styles.inputFieldStyle, minHeight: '60px', resize: 'vertical' }}
                                />
                                <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                                    Commands to start the service after deployment.
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 4 }}>Stop Commands (one per line)</div>
                                <textarea
                                    className="glass-input"
                                    placeholder="pkill -f 'node server.js'&#10;or: pm2 stop my-app"
                                    value={form.stopCommands}
                                    onChange={(e) => setForm({ ...form, stopCommands: e.target.value })}
                                    style={{ ...styles.inputFieldStyle, minHeight: '60px', resize: 'vertical' }}
                                />
                                <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                                    Commands to stop the service.
                                </div>
                            </div>
                        </>
                    )}

                    {form.useDocker && (
                        <div style={{ fontSize: 11, color: '#58a6ff', padding: '8px', background: 'rgba(88, 166, 255, 0.1)', borderRadius: '6px' }}>
                            ℹ️ Docker mode: Start/stop commands are handled automatically by Docker container lifecycle
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14, paddingBottom: 20 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <div style={styles.blueButton} onClick={onSubmit}>
                        {isEditMode ? 'Update' : 'Create'}
                    </div>
                </div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default PipelineModal;
