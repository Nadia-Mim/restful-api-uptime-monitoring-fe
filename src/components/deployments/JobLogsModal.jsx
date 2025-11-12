import React, { useEffect, useRef, useState } from 'react';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../common/modals/customModal/CustomModal';
import Loader from '../common/loader/Loader';

/**
 * JobLogsModal - Real-time job log streaming via SSE
 * @param {string} jobId - The job ID to stream logs for
 * @param {boolean} visible - Modal visibility
 * @param {function} onClose - Close handler
 * @param {object} jobInfo - Optional job metadata { projectName, environment, type }
 */
const JobLogsModal = ({ jobId, visible, onClose, jobInfo = {} }) => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('CONNECTING'); // CONNECTING | RUNNING | SUCCESS | FAILED | DISCONNECTED
    const [error, setError] = useState(null);
    const logsEndRef = useRef(null);
    const eventSourceRef = useRef(null);

    // Auto-scroll to bottom when new logs arrive
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    // Connect to SSE stream
    useEffect(() => {
        if (!visible || !jobId) return;

        const apiBase = import.meta?.env?.VITE_API_BASE || 'http://localhost:5000';
        const url = `${apiBase}/jobs/stream?jobId=${encodeURIComponent(jobId)}`;

        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('ready', (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.ok) {
                    setStatus('RUNNING');
                    setLogs(prev => [...prev, {
                        type: 'info',
                        message: `🔗 Connected to job stream (Job ID: ${jobId})`,
                        timestamp: new Date().toISOString()
                    }]);
                }
            } catch (err) {
                console.error('Error parsing ready event:', err);
            }
        });

        eventSource.addEventListener('log', (e) => {
            try {
                const logEntry = JSON.parse(e.data);
                setLogs(prev => [...prev, logEntry]);
            } catch (err) {
                console.error('Error parsing log event:', err);
            }
        });

        eventSource.addEventListener('complete', (e) => {
            try {
                const data = JSON.parse(e.data);
                setStatus(data.status || 'SUCCESS');
                setLogs(prev => [...prev, {
                    type: 'info',
                    message: `✅ Job completed with status: ${data.status}`,
                    timestamp: new Date().toISOString()
                }]);
            } catch (err) {
                console.error('Error parsing complete event:', err);
            }
        });

        eventSource.addEventListener('error', (e) => {
            setStatus('DISCONNECTED');
            setError('Connection lost or error occurred');
            setLogs(prev => [...prev, {
                type: 'error',
                message: '❌ Stream connection error',
                timestamp: new Date().toISOString()
            }]);
        });

        eventSource.onerror = () => {
            setStatus('DISCONNECTED');
            setError('Failed to connect to log stream');
        };

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
                eventSourceRef.current = null;
            }
        };
    }, [visible, jobId]);

    const getStatusColor = () => {
        switch (status) {
            case 'CONNECTING': return '#FFA726';
            case 'RUNNING': return '#42A5F5';
            case 'SUCCESS': return '#66BB6A';
            case 'FAILED': return '#EF5350';
            case 'DISCONNECTED': return '#9E9E9E';
            default: return '#9E9E9E';
        }
    };

    const getLogColor = (type) => {
        switch (type) {
            case 'stdout': return '#DCE4F0';
            case 'stderr': return '#EF5350';
            case 'error': return '#EF5350';
            case 'warn': return '#FFA726';
            case 'info': return '#42A5F5';
            case 'success': return '#66BB6A';
            default: return '#DCE4F0';
        }
    };

    const handleClose = () => {
        if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
        }
        setLogs([]);
        setStatus('CONNECTING');
        setError(null);
        onClose();
    };

    return (
        <CustomModal visible={visible} style={{ maxWidth: '900px', maxHeight: '90vh' }}>
            <CustomModalHeader onClose={handleClose}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>Deployment Logs</span>
                    <span
                        style={{
                            padding: '2px 8px',
                            background: getStatusColor(),
                            borderRadius: '4px',
                            fontSize: 11,
                            fontWeight: 600,
                            color: '#fff'
                        }}
                    >
                        {status}
                    </span>
                </div>
            </CustomModalHeader>
            <CustomModalBody style={{ padding: 0, maxHeight: 'calc(90vh - 60px)', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Job Info Header */}
                {jobInfo && (
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9fb0c6' }}>
                            {jobInfo.projectName && (
                                <div>
                                    <span style={{ color: '#7a8fa5' }}>Project:</span>{' '}
                                    <span style={{ color: '#DCE4F0' }}>{jobInfo.projectName}</span>
                                </div>
                            )}
                            {jobInfo.environment && (
                                <div>
                                    <span style={{ color: '#7a8fa5' }}>Environment:</span>{' '}
                                    <span style={{ color: '#DCE4F0', textTransform: 'uppercase' }}>{jobInfo.environment}</span>
                                </div>
                            )}
                            {jobInfo.type && (
                                <div>
                                    <span style={{ color: '#7a8fa5' }}>Type:</span>{' '}
                                    <span style={{ color: '#DCE4F0', textTransform: 'uppercase' }}>{jobInfo.type}</span>
                                </div>
                            )}
                            {jobInfo.agentName && (
                                <div>
                                    <span style={{ color: '#7a8fa5' }}>Agent:</span>{' '}
                                    <span style={{ color: '#DCE4F0' }}>{jobInfo.agentName}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Logs Container */}
                <div
                    style={{
                        flex: 1,
                        padding: '16px',
                        overflowY: 'auto',
                        background: '#0a0b0e',
                        fontFamily: 'monospace',
                        fontSize: 13,
                        lineHeight: 1.6
                    }}
                >
                    {status === 'CONNECTING' && logs.length === 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#9fb0c6' }}>
                            <Loader />
                            <span>Connecting to log stream...</span>
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '8px 12px', background: 'rgba(239, 83, 80, 0.1)', border: '1px solid #EF5350', borderRadius: '4px', color: '#EF5350', marginBottom: 12 }}>
                            ⚠️ {error}
                        </div>
                    )}

                    {logs.map((log, idx) => (
                        <div key={idx} style={{ marginBottom: 4 }}>
                            <span style={{ color: '#7a8fa5', marginRight: 8 }}>
                                {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : ''}
                            </span>
                            <span style={{ color: getLogColor(log.type) }}>
                                {log.message}
                            </span>
                        </div>
                    ))}

                    {/* Auto-scroll anchor */}
                    <div ref={logsEndRef} />
                </div>

                {/* Footer Actions */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: '#9fb0c6' }}>
                        {logs.length} log {logs.length === 1 ? 'entry' : 'entries'}
                    </div>
                    <button className="btn btn-secondary" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default JobLogsModal;
