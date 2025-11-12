import React from 'react';
import Select from 'react-select';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../../common/modals/customModal/CustomModal';

const AgentModal = ({
    visible,
    onClose,
    form,
    setForm,
    onSubmit,
    isEditMode,
    styles
}) => {
    if (!visible) return null;

    const hostTypeOptions = [
        { value: 'Linux', label: 'Linux' },
        { value: 'macOS', label: 'macOS' },
        { value: 'Windows', label: 'Windows' },
    ];

    return (
        <CustomModal visible={visible} style={{ maxWidth: '600px' }}>
            <CustomModalHeader onClose={onClose}>
                {isEditMode ? 'Edit Agent' : 'Register New Agent'}
            </CustomModalHeader>
            <CustomModalBody style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Agent Name *</div>
                        <input
                            className="glass-input"
                            placeholder="e.g., Production Server 1"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            style={styles.inputFieldStyle}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Host Type *</div>
                        <Select
                            value={hostTypeOptions.find(o => o.value === form.hostType)}
                            onChange={(e) => setForm({ ...form, hostType: e?.value || 'Linux' })}
                            options={hostTypeOptions}
                            menuPortalTarget={document.body}
                            menuPlacement="auto"
                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                            placeholder="Select Host Type"
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Description (optional)</div>
                        <textarea
                            className="glass-input"
                            placeholder="e.g., Main production server in AWS"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            style={{ ...styles.inputFieldStyle, minHeight: '80px', resize: 'vertical' }}
                        />
                    </div>
                    <div style={{ fontSize: 12, color: '#9fb0c6', marginTop: 8 }}>
                        After registration, you'll receive a token and installation instructions to set up the agent on your server.
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <div style={styles.blueButton} onClick={onSubmit}>
                        {isEditMode ? 'Update' : 'Register'}
                    </div>
                </div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default AgentModal;
