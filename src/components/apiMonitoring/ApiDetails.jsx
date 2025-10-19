import React, { useMemo, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getAllChecks } from '../../api/apiChecks/GET';
import getHealthLogs from '../../api/health/GET';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const Badge = ({ ok, children }) => (
    <span
        className={`glass-badge ${ok ? 'success' : 'danger'}`}
        style={{ padding: '4px 10px', borderRadius: 10, fontSize: 12 }}
    >
        {children}
    </span>
);

const AreaChart = ({ data, width = 700, height = 220, color = '#4545E6', ticks = 4 }) => {
    const padding = { l: 36, r: 12, t: 10, b: 24 };
    const innerW = width - padding.l - padding.r;
    const innerH = height - padding.t - padding.b;

    const { path, area, xTicks, yTicks } = useMemo(() => {
        if (!data?.length) return { path: '', area: '', xTicks: [], yTicks: [] };
        const xs = data.map((p) => p[0]);
        const ys = data.map((p) => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = 0; // baseline at 0ms
        const maxY = Math.max(10, Math.max(...ys));
        const dx = maxX - minX || 1;
        const dy = maxY - minY || 1;
        const toX = (x) => padding.l + ((x - minX) / dx) * innerW;
        const toY = (y) => padding.t + innerH - ((y - minY) / dy) * innerH;
        const line = data.map(([x, y], i) => `${i ? 'L' : 'M'} ${toX(x)} ${toY(y)}`).join(' ');
        const areaPath = `${line} L ${padding.l + innerW} ${padding.t + innerH} L ${padding.l} ${padding.t + innerH} Z`;
        const xTicksArr = Array.from({ length: ticks + 1 }, (_, i) => {
            const xv = minX + (dx * i) / ticks;
            return { x: toX(xv), v: xv };
        });
        const yTicksArr = Array.from({ length: ticks + 1 }, (_, i) => {
            const yv = minY + (dy * i) / ticks;
            return { y: toY(yv), v: yv };
        });
        return { path: line, area: areaPath, xTicks: xTicksArr, yTicks: yTicksArr };
    }, [data]);

    if (!data?.length) return <div style={{ opacity: 0.7 }}>No data</div>;

    return (
        <svg width={width} height={height} className="chart-container">
            <g className="chart-grid">
                {yTicks.map((t, i) => (
                    <line key={i} x1={padding.l} x2={padding.l + innerW} y1={t.y} y2={t.y} />
                ))}
            </g>
            <path d={area} fill={color} opacity="0.18" />
            <path d={path} fill="none" stroke={color} strokeWidth="2" />
            <g className="chart-axis">
                {xTicks.map((t, i) => (
                    <text key={i} x={t.x} y={height - 6} textAnchor="middle">
                        {new Date(t.v).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </text>
                ))}
                {yTicks.map((t, i) => (
                    <text key={i} x={6} y={t.y + 3}>{Math.round(t.v)}ms</text>
                ))}
            </g>
        </svg>
    );
};

const ApiDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    const stateCheck = location?.state?.check || null;

    const { data: checksResp } = useQuery(
        ['checks'],
        () => getAllChecks(JSON.parse(localStorage.authData || '{}')?.userId),
        { enabled: !stateCheck }
    );

    const check = useMemo(() => {
        if (stateCheck) return stateCheck;
        const checks = checksResp?.[0] || [];
        return checks.find((c) => c?._id === id);
    }, [stateCheck, checksResp, id]);

    // timeframe state in minutes
    const [minutes, setMinutes] = useState(60);

    const { data: logs } = useQuery(
        ['health', id],
        () => getHealthLogs({ checkId: id, limit: 500 }),
        { enabled: !!id }
    );

    const toTs = (v) => {
        if (!v && v !== 0) return 0;
        if (typeof v === 'number') return v;
        const t = Date.parse(v);
        return Number.isNaN(t) ? 0 : t;
    };

    const filteredLogs = useMemo(() => {
        if (!logs?.length) return [];
        const cutoff = Date.now() - minutes * 60 * 1000;
        return logs.filter((l) => toTs(l.timestamp) >= cutoff);
    }, [logs, minutes]);

    const points = useMemo(() => {
        if (!filteredLogs?.length) return [];
        const sorted = [...filteredLogs].sort((a, b) => toTs(a.timestamp) - toTs(b.timestamp));
        return sorted.map((l) => [toTs(l.timestamp), Number(l.responseTime || 0)]);
    }, [filteredLogs]);

    const latest = logs?.[0] || null;
    const latestOk = latest ? latest.state === 'UP' : (check?.state === 'UP');

    const [showStatus, setShowStatus] = useState(false);
    const upCount = filteredLogs.filter((l) => l.state === 'UP').length;
    const downCount = filteredLogs.length - upCount;

    return (
        <div>
            <div className="glass-toolbar" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{check?.serviceName || check?.url || 'API Details'}</div>
                {latestOk !== undefined && <Badge ok={latestOk}>{latestOk ? 'UP' : 'DOWN'}</Badge>}
                <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
                    {[15, 60, 180, 1440].map((m) => (
                        <div key={m} className={`pill ${minutes === m ? 'active' : ''}`} onClick={() => setMinutes(m)}>
                            {m >= 60 ? (m % 60 === 0 ? `${m / 60}h` : `${Math.floor(m / 60)}h`) : `${m}m`}
                        </div>
                    ))}
                </div>
                <div
                    className="glass-button-primary"
                    style={{ cursor: 'pointer', padding: '8px 12px', borderRadius: 10 }}
                    onClick={() => navigate(-1)}
                >
                    Back
                </div>
            </div>

            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12 }}>
                <div style={{ opacity: 0.8 }}>ID</div>
                <div style={{ fontWeight: 600 }}>{check?._id || id}</div>

                <div style={{ opacity: 0.8 }}>URL</div>
                <div>{check?.url}</div>

                <div style={{ opacity: 0.8 }}>Protocol</div>
                <div>{check?.protocol}</div>

                <div style={{ opacity: 0.8 }}>Method</div>
                <div>{check?.method}</div>

                <div style={{ opacity: 0.8 }}>Success Codes</div>
                <div>{Array.isArray(check?.successCodes) ? check.successCodes.join(', ') : 'N/A'}</div>

                <div style={{ opacity: 0.8 }}>Timeout (sec)</div>
                <div>{check?.timeoutSeconds}</div>

                <div style={{ opacity: 0.8 }}>Group</div>
                <div>{check?.group || 'N/A'}</div>

                <div style={{ opacity: 0.8 }}>Active</div>
                <div>{check?.isActive ? 'Yes' : 'No'}</div>
            </div>

            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Health Tracking (Response Time)</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div
                            className="stat-chip"
                            data-tooltip-id="pts-tip"
                            data-tooltip-content="Number of health log samples in the selected timeframe."
                            style={{ cursor: 'help' }}
                        >
                            <span className="dot accent"></span>Points {points.length}
                        </div>
                        <div
                            className="stat-chip"
                            data-tooltip-id="avg-tip"
                            data-tooltip-content="Average response time across samples in the selected timeframe."
                            style={{ cursor: 'help' }}
                        >
                            <span className="dot good"></span>
                            Avg {points.length ? Math.round(points.reduce((a, b) => a + b[1], 0) / points.length) : 0}ms
                        </div>
                        <div
                            className="stat-chip"
                            data-tooltip-id="p95-tip"
                            data-tooltip-content="95% of samples completed at or below this response time (95th percentile)."
                            style={{ cursor: 'help' }}
                        >
                            <span className="dot warn"></span>
                            p95 {points.length ? Math.round(points.map(p => p[1]).sort((a, b) => a - b)[Math.floor(points.length * 0.95)] || 0) : 0}ms
                        </div>
                    </div>
                </div>
                <AreaChart data={points} />
            </div>

            {/* Latest response summary, including statusCode, responseTime, alert and error if any */}
            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>Latest Response</div>
                    {latest && (
                        <>
                            <div className="stat-chip"><span className="dot accent"></span>{new Date(toTs(latest.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            {'statusCode' in latest && (
                                <div className="stat-chip"><span className="dot good"></span>Status {latest.statusCode ?? '—'}</div>
                            )}
                            {'responseTime' in latest && (
                                <div className="stat-chip"><span className="dot warn"></span>{Number(latest.responseTime || 0)}ms</div>
                            )}
                            {'isAlertTriggered' in latest && (
                                <div className="stat-chip"><span className={`dot ${latest.isAlertTriggered ? 'bad' : 'good'}`}></span>{latest.isAlertTriggered ? 'Alert fired' : 'No alert'}</div>
                            )}
                        </>
                    )}
                </div>
                {latest?.error && (
                    <div className="glass-badge danger" style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 10 }}>
                        Error: {String(latest.error)}
                    </div>
                )}
                {!latest && <div style={{ opacity: 0.7 }}>No recent data</div>}
            </div>

            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>Recent Status</div>
                    <div className="stat-chip"><span className="dot good"></span>UP {upCount}</div>
                    <div className="stat-chip"><span className="dot bad"></span>DOWN {downCount}</div>
                    <div style={{ marginLeft: 'auto' }} className={`pill ${showStatus ? 'active' : ''}`} onClick={() => setShowStatus(v => !v)}>
                        {showStatus ? 'Hide' : 'Show'}
                    </div>
                </div>
                {showStatus && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(filteredLogs || []).slice(0, 24).map((l) => (
                            <span
                                key={String(l._id) + String(l.timestamp)}
                                className={`glass-badge ${l.state === 'UP' ? 'success' : 'danger'}`}
                                data-tooltip-id="status-detail"
                                data-tooltip-content={`Time: ${new Date(toTs(l.timestamp)).toLocaleString()}\nStatus: ${l.statusCode ?? '—'}\nResp: ${Number(l.responseTime || 0)}ms${l.isAlertTriggered ? '\nAlert: triggered' : ''}${l.error ? `\nError: ${String(l.error)}` : ''}`}
                                style={{ whiteSpace: 'pre' }}
                            >
                                {l.state} · {new Date(toTs(l.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Tooltips for stat explanations */}
            <Tooltip id="pts-tip" place="top" />
            <Tooltip id="avg-tip" place="top" />
            <Tooltip id="p95-tip" place="top" />
            <Tooltip id="status-detail" place="top" />
        </div>
    );
};

export default ApiDetails;
