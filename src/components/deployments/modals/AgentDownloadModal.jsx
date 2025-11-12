import React, { useState } from 'react';
import Select from 'react-select';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../../common/modals/customModal/CustomModal';

const AgentDownloadModal = ({
    visible,
    onClose,
    agent,
    styles
}) => {
    const [downloadOs, setDownloadOs] = useState('linux');

    if (!visible || !agent) return null;

    const osOptions = [
        { value: 'linux', label: 'Linux' },
        { value: 'macos', label: 'macOS' },
        { value: 'windows', label: 'Windows' },
    ];

    const getInstallCommand = () => {
        const token = agent.token;
        const baseUrl = window.location.origin;

        if (downloadOs === 'windows') {
            return `# PowerShell\nInvoke-WebRequest -Uri "${baseUrl}/agent/install.ps1" -OutFile install.ps1\n.\\install.ps1 -Token "${token}"`;
        } else {
            return `curl -fsSL ${baseUrl}/agent/install.sh | bash -s -- ${token}`;
        }
    };

    return (
        <CustomModal visible={visible} style={{ maxWidth: '700px' }}>
            <CustomModalHeader onClose={onClose}>
                Download & Install Agent: {agent.name}
            </CustomModalHeader>
            <CustomModalBody style={{ padding: '20px' }}>
                <div style={{ display: 'grid', gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Select Operating System</div>
                        <Select
                            value={osOptions.find(o => o.value === downloadOs)}
                            onChange={(e) => setDownloadOs(e?.value || 'linux')}
                            options={osOptions}
                            menuPortalTarget={document.body}
                            menuPlacement="auto"
                            styles={{ ...styles.selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                        />
                    </div>

                    <div>
                        <div style={{ fontSize: 14, color: '#DCE4F0', marginBottom: 8, fontWeight: 600 }}>
                            Installation Instructions
                        </div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 12 }}>
                            Run this command on your target server to install and configure the agent:
                        </div>
                        <div style={{
                            background: '#0d1117',
                            padding: '12px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#58a6ff',
                            overflowX: 'auto',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-all'
                        }}>
                            {getInstallCommand()}
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: 8 }}
                            onClick={() => {
                                navigator.clipboard.writeText(getInstallCommand());
                            }}
                        >
                            📋 Copy to Clipboard
                        </button>
                    </div>

                    <div style={{ background: 'rgba(255,193,7,0.1)', padding: '12px', borderRadius: '6px' }}>
                        <div style={{ fontSize: 13, color: '#ffc107', marginBottom: 6, fontWeight: 600 }}>
                            ⚠️ Important
                        </div>
                        <ul style={{ fontSize: 12, color: '#9fb0c6', margin: 0, paddingLeft: 20 }}>
                            <li>The installation script will download and configure the agent</li>
                            <li>The agent will connect to this control server automatically</li>
                            <li>Make sure the server has internet access and required permissions</li>
                            <li>The agent will run as a background service</li>
                        </ul>
                    </div>

                    <div>
                        <div style={{ fontSize: 12, color: '#9fb0c6', marginBottom: 6 }}>Agent Token</div>
                        <div style={{
                            background: '#0d1117',
                            padding: '10px',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: '#58a6ff',
                            wordBreak: 'break-all'
                        }}>
                            {agent.token}
                        </div>
                        <button
                            className="btn btn-secondary"
                            style={{ marginTop: 8 }}
                            onClick={() => {
                                navigator.clipboard.writeText(agent.token);
                            }}
                        >
                            📋 Copy Token
                        </button>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default AgentDownloadModal;
