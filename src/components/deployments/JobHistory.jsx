import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { listJobs } from '../../api/jobs/GET';
import Loader from '../common/loader/Loader';

/**
 * JobHistory - View and filter deployment job history
 * @param {Array} projects - List of projects for filtering
 * @param {Array} agents - List of agents for filtering
 * @param {function} onViewLogs - Callback when user clicks to view logs
 * @param {object} selectStyle - Shared select dropdown styles
 */
const JobHistory = ({ projects = [], agents = [], onViewLogs, selectStyle }) => {
    const [jobs, setJobs] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        projectId: '',
        environment: '',
        status: '',
        agentId: '',
        type: ''
    });
    const [page, setPage] = useState(0);
    const limit = 20;

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'QUEUED', label: 'Queued' },
        { value: 'DISPATCHED', label: 'Dispatched' },
        { value: 'RUNNING', label: 'Running' },
        { value: 'SUCCESS', label: 'Success' },
        { value: 'FAILED', label: 'Failed' }
    ];

    const envOptions = [
        { value: '', label: 'All Environments' },
        { value: 'dev', label: 'Dev' },
        { value: 'staging', label: 'Staging' },
        { value: 'production', label: 'Production' }
    ];

    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'deploy', label: 'Deploy' },
        { value: 'start', label: 'Start' },
        { value: 'stop', label: 'Stop' },
        { value: 'restart', label: 'Restart' }
    ];

    const projectOptions = [
        { value: '', label: 'All Projects' },
        ...projects.map(p => ({ value: p._id, label: p.name }))
    ];

    const agentOptions = [
        { value: '', label: 'All Agents' },
        ...agents.map(a => ({ value: a._id, label: a.name }))
    ];

    const loadJobs = async () => {
        setLoading(true);
        const filterPayload = {
            ...filters,
            limit,
            skip: page * limit
        };
        // Remove empty filters
        Object.keys(filterPayload).forEach(key => {
            if (filterPayload[key] === '') delete filterPayload[key];
        });

        const [ok, result] = await listJobs(filterPayload);
        if (ok) {
            setJobs(result.data);
            setTotal(result.total);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadJobs();
    }, [filters, page]);

    const getStatusBadge = (status) => {
        const colors = {
            QUEUED: 'secondary',
            DISPATCHED: 'secondary',
            RUNNING: 'info',
            SUCCESS: 'success',
            FAILED: 'danger'
        };
        return <span className={`glass-badge ${colors[status] || 'secondary'}`}>{status}</span>;
    };

    const formatDuration = (startedAt, finishedAt) => {
        if (!startedAt) return '—';
        const start = new Date(startedAt);
        const end = finishedAt ? new Date(finishedAt) : new Date();
        const diff = Math.floor((end - start) / 1000); // seconds
        if (diff < 60) return `${diff}s`;
        if (diff < 3600) return `${Math.floor(diff / 60)}m ${diff % 60}s`;
        return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div>
            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 20 }}>
                <div>
                    <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Project</div>
                    <Select
                        value={projectOptions.find(o => o.value === filters.projectId)}
                        onChange={(e) => setFilters({ ...filters, projectId: e?.value || '' })}
                        options={projectOptions}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        styles={{ ...selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Environment</div>
                    <Select
                        value={envOptions.find(o => o.value === filters.environment)}
                        onChange={(e) => setFilters({ ...filters, environment: e?.value || '' })}
                        options={envOptions}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        styles={{ ...selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Status</div>
                    <Select
                        value={statusOptions.find(o => o.value === filters.status)}
                        onChange={(e) => setFilters({ ...filters, status: e?.value || '' })}
                        options={statusOptions}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        styles={{ ...selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Agent</div>
                    <Select
                        value={agentOptions.find(o => o.value === filters.agentId)}
                        onChange={(e) => setFilters({ ...filters, agentId: e?.value || '' })}
                        options={agentOptions}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        styles={{ ...selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
                <div>
                    <div style={{ fontSize: 11, color: '#9fb0c6', marginBottom: 4 }}>Type</div>
                    <Select
                        value={typeOptions.find(o => o.value === filters.type)}
                        onChange={(e) => setFilters({ ...filters, type: e?.value || '' })}
                        options={typeOptions}
                        menuPortalTarget={document.body}
                        menuPlacement="auto"
                        styles={{ ...selectStyle, menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                </div>
            </div>

            {/* Job Table */}
            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                    <Loader />
                </div>
            ) : jobs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#9fb0c6' }}>
                    No jobs found matching the filters
                </div>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="glass-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Job ID</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Project</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Environment</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Type</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Status</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Duration</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Started At</th>
                                    <th style={{ padding: '12px 8px', textAlign: 'left', color: '#9fb0c6', fontSize: 12, fontWeight: 600 }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => {
                                    const project = projects.find(p => p._id === job.projectId);
                                    const agent = agents.find(a => String(a._id) === String(job.agentId));
                                    return (
                                        <tr key={job.jobId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '12px 8px', fontSize: 12, color: '#DCE4F0', fontFamily: 'monospace' }}>
                                                {job.jobId.substring(job.jobId.length - 12)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 13, color: '#DCE4F0' }}>
                                                {project?.name || job.projectId || '—'}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 12, color: '#DCE4F0', textTransform: 'uppercase' }}>
                                                {job.payload?.environment || '—'}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 12, color: '#DCE4F0', textTransform: 'uppercase' }}>
                                                {job.type}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                {getStatusBadge(job.status)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 12, color: '#9fb0c6' }}>
                                                {formatDuration(job.startedAt, job.finishedAt)}
                                            </td>
                                            <td style={{ padding: '12px 8px', fontSize: 12, color: '#9fb0c6' }}>
                                                {job.startedAt ? new Date(job.startedAt).toLocaleString() : '—'}
                                            </td>
                                            <td style={{ padding: '12px 8px' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    style={{ fontSize: 11, padding: '4px 8px' }}
                                                    onClick={() => onViewLogs && onViewLogs(job, project, agent)}
                                                >
                                                    View Logs
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, padding: '12px 0' }}>
                            <div style={{ fontSize: 13, color: '#9fb0c6' }}>
                                Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total} jobs
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setPage(Math.max(0, page - 1))}
                                    disabled={page === 0}
                                    style={{ opacity: page === 0 ? 0.4 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                                >
                                    Previous
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', color: '#DCE4F0', fontSize: 13 }}>
                                    Page {page + 1} of {totalPages}
                                </div>
                                <button
                                    className="btn btn-secondary"
                                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                    disabled={page >= totalPages - 1}
                                    style={{ opacity: page >= totalPages - 1 ? 0.4 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default JobHistory;
