import React from 'react';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../../common/modals/customModal/CustomModal';

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
    if (!visible) return null;

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
                    <input
                        className="glass-input"
                        placeholder="Language (e.g., JavaScript, Python)"
                        value={form.language}
                        onChange={(e) => setForm({ ...form, language: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
                    <input
                        className="glass-input"
                        placeholder="Framework (e.g., React, Express, Django)"
                        value={form.framework}
                        onChange={(e) => setForm({ ...form, framework: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
                    <input
                        className="glass-input"
                        placeholder="Default Branch (e.g., main)"
                        value={form.defaultBranch}
                        onChange={(e) => setForm({ ...form, defaultBranch: e.target.value })}
                        style={styles.inputFieldStyle}
                    />
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 4 }}>Build Commands (one per line) *</div>
                        <textarea
                            className="glass-input"
                            placeholder="npm install&#10;npm run build"
                            value={form.buildCommands}
                            onChange={(e) => setForm({ ...form, buildCommands: e.target.value })}
                            style={{ ...styles.inputFieldStyle, minHeight: '80px', resize: 'vertical' }}
                        />
                        <div style={{ fontSize: 10, color: '#7a8fa5', marginTop: 4 }}>
                            Commands to build the project. These run in sequence.
                        </div>
                    </div>
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
