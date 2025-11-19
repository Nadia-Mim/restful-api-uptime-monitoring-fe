import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { getAllChecks } from '../../api/apiChecks/GET';
import getHealthLogs from '../../api/health/GET';
import { getSSLDetails, updateSSLRenewalAlert } from '../../api/sslDetails/GET';
import Loader from '../common/loader/Loader';
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
    // Router helpers
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // State
    // Timeframe in minutes for chart/log filtering (default: 60m)
    const [minutes, setMinutes] = useState(60);
    // Toggle for showing the recent status badge list
    const [showStatus, setShowStatus] = useState(false);
    // SSL details state
    const [sslDetails, setSSLDetails] = useState(null);
    const [loadingSSL, setLoadingSSL] = useState(false);
    const [expandedSSL, setExpandedSSL] = useState(false);

    // Data loading (react-query) and loader mapping
    const stateCheck = location?.state?.check || null; // If navigated from Dashboard, we may already have the check

    // Query: fetch all checks for this user IF we don't already have the check from router state
    const userId = (() => {
        try { return JSON.parse(localStorage.getItem('authData') || '{}')?.userId; } catch (_) { return undefined; }
    })();

    const { data: checksResponse, isLoading: isLoadingChecks } = useQuery(
        ['checks', userId],
        () => getAllChecks(userId),
        { enabled: !!userId }
    );

    // Derive target check: prefer router state, otherwise locate by id from fetched list
    const check = useMemo(() => {
        const checks = checksResponse?.[0] || [];
        const fetched = checks.find((chk) => chk?._id === id);
        if (fetched && stateCheck) return { ...stateCheck, ...fetched };
        return fetched || stateCheck;
    }, [stateCheck, checksResponse, id]);

    // Query: fetch health logs for this check id
    const { data: healthLogs, isLoading: isLoadingLogs } = useQuery(
        ['health', id],
        () => getHealthLogs({ checkId: id, limit: 500 }),
        { enabled: !!id }
    );

    // Global loader for this screen
    const showLoader = isLoadingChecks || isLoadingLogs;

    // Helpers
    const toEpochMs = (value) => {
        if (!value && value !== 0) return 0;
        if (typeof value === 'number') return value;
        const t = Date.parse(value);
        return Number.isNaN(t) ? 0 : t;
    };

    // Derived data from logs
    const filteredLogs = useMemo(() => {
        if (!healthLogs?.length) return [];
        const cutoff = Date.now() - minutes * 60 * 1000;
        return healthLogs.filter((log) => toEpochMs(log.timestamp) >= cutoff);
    }, [healthLogs, minutes]);

    const points = useMemo(() => {
        if (!filteredLogs?.length) return [];
        const sorted = [...filteredLogs].sort((a, b) => toEpochMs(a.timestamp) - toEpochMs(b.timestamp));
        return sorted.map((log) => [toEpochMs(log.timestamp), Number(log.responseTime || 0)]);
    }, [filteredLogs]);

    const latestLog = healthLogs?.[0] || null;
    const latestIsUp = latestLog ? latestLog.state === 'UP' : (check?.state === 'UP');

    const upCount = filteredLogs.filter((log) => log.state === 'UP').length;
    const downCount = filteredLogs.length - upCount;

    // SSL helpers
    const sslEnabled = !!check?.sslExpiryAlerts;
    const sslExpiryAtMs = Number(check?.sslLastCertExpiryAt) || 0;
    const sslLastCheckedAtMs = Number(check?.sslLastCheckedAt) || 0;
    const daysLeft = useMemo(() => {
        if (!sslExpiryAtMs) return null;
        const ms = sslExpiryAtMs - Date.now();
        return Math.floor(ms / (1000 * 60 * 60 * 24));
    }, [sslExpiryAtMs]);
    const sslThresholds = Array.isArray(check?.sslAlertThresholdsSent) ? [...check.sslAlertThresholdsSent].sort((a, b) => a - b) : [];

    // Fetch detailed SSL information for HTTPS checks
    useEffect(() => {
        // First, populate from the check object if we don't have sslDetails yet
        if (check?.protocol === 'https' && check?._id && expandedSSL && !sslDetails) {
            // If check already has SSL data, use it directly
            if (check.sslCertDetails) {
                setSSLDetails({
                    sslExpiryAlerts: check.sslExpiryAlerts,
                    sslLastCertExpiryAt: check.sslLastCertExpiryAt,
                    sslLastCheckedAt: check.sslLastCheckedAt,
                    sslCertDetails: check.sslCertDetails,
                    sslChainValid: check.sslChainValid,
                    sslChainLength: check.sslChainLength,
                    sslAutoRenewalEnabled: check.sslAutoRenewalEnabled,
                    sslLastRenewalDetectedAt: check.sslLastRenewalDetectedAt,
                    sslAlertThresholdsSent: check.sslAlertThresholdsSent
                });
            } else {
                // Otherwise fetch from API
                setLoadingSSL(true);
                getSSLDetails(check._id).then(response => {
                    setLoadingSSL(false);
                    if (response[0]) {
                        setSSLDetails(response[1]);
                    } else {
                        // Set empty object to prevent infinite loop
                        setSSLDetails({});
                    }
                }).catch(error => {
                    setLoadingSSL(false);
                    setSSLDetails({});
                });
            }
        }
    }, [check, expandedSSL, sslDetails]);

    const handleSSLRenewalToggle = async (enabled) => {
        if (!check?._id) return;
        const response = await updateSSLRenewalAlert(check._id, enabled);
        if (response[0]) {
            // Refresh SSL details
            setSSLDetails(prev => ({...prev, sslAutoRenewalEnabled: enabled}));
        } else {
            alert('Failed to update SSL renewal alert: ' + response[1]);
        }
    };

    // Render
    return (
        <div>
            {/* Page-level loader */}
            {showLoader && <Loader />}
            {/* Header / Toolbar */}
            <div className="glass-toolbar" style={{ marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{check?.serviceName || check?.url || 'API Details'}</div>
                {latestIsUp !== undefined && <Badge ok={latestIsUp}>{latestIsUp ? 'UP' : 'DOWN'}</Badge>}
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

            {/* Check properties */}
            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '180px 1fr', gap: 12 }}>
                <div style={{ opacity: 0.8 }}>ID</div>
                <div style={{ fontWeight: 600 }}>{check?._id || id}</div>

                <div style={{ opacity: 0.8 }}>URL</div>
                <div>{check?.url}</div>

                <div style={{ opacity: 0.8 }}>Protocol</div>
                <div>{check?.protocol}</div>

                {(check?.protocol === 'http' || check?.protocol === 'https') && <>
                    <div style={{ opacity: 0.8 }}>Method</div>
                    <div>{check?.method}</div>

                    <div style={{ opacity: 0.8 }}>Success Codes</div>
                    <div>{Array.isArray(check?.successCodes) ? check.successCodes.join(', ') : 'N/A'}</div>
                </>}

                {check?.protocol === 'tcp' && <>
                    <div style={{ opacity: 0.8 }}>TCP Port</div>
                    <div>{check?.port || '—'}</div>
                </>}

                {check?.protocol === 'dns' && <>
                    <div style={{ opacity: 0.8 }}>DNS Type</div>
                    <div>{check?.dnsRecordType || '—'}</div>
                    <div style={{ opacity: 0.8 }}>Expected Value</div>
                    <div>{check?.expectedDnsValue || '—'}</div>
                </>}

                <div style={{ opacity: 0.8 }}>Timeout (sec)</div>
                <div>{check?.timeoutSeconds}</div>

                <div style={{ opacity: 0.8 }}>Group</div>
                <div>{check?.group || 'N/A'}</div>

                <div style={{ opacity: 0.8 }}>Active</div>
                <div>{check?.isActive ? 'Yes' : 'No'}</div>
            </div>

            {/* Health tracking chart */}
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

            {/* SSL/TLS Certificate (HTTPS only) */}
            {check?.protocol === 'https' && (
                <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontWeight: 600 }}>SSL/TLS Certificate</div>
                        <button 
                            onClick={() => setExpandedSSL(!expandedSSL)}
                            style={{ 
                                background: '#4545E6', 
                                border: 'none', 
                                color: 'white', 
                                padding: '4px 12px', 
                                borderRadius: '5px', 
                                cursor: 'pointer',
                                fontSize: '12px'
                            }}
                        >
                            {expandedSSL ? 'Hide Details' : 'Show Details'}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 12 }}>
                        <div style={{ opacity: 0.8 }}>Expiry alerts</div>
                        <div>{sslEnabled ? 'Enabled (per Settings)' : 'Disabled'}</div>

                        <div style={{ opacity: 0.8 }}>Cert expiry</div>
                        <div>
                            {sslExpiryAtMs ? new Date(sslExpiryAtMs).toLocaleString() : '—'}
                            {typeof daysLeft === 'number' && (
                                <span className="stat-chip" style={{ marginLeft: 8 }}>
                                    <span className={`dot ${daysLeft <= 7 ? 'bad' : daysLeft <= 30 ? 'warn' : 'good'}`}></span>
                                    {daysLeft} day{Math.abs(daysLeft) === 1 ? '' : 's'} left
                                </span>
                            )}
                        </div>

                        <div style={{ opacity: 0.8 }}>Last SSL check</div>
                        <div>{sslLastCheckedAtMs ? new Date(sslLastCheckedAtMs).toLocaleString() : '—'}</div>

                        <div style={{ opacity: 0.8 }}>Alerts sent for thresholds</div>
                        <div>
                            {sslThresholds.length ? (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    {sslThresholds.map((d) => (
                                        <span key={d} className="glass-badge" style={{ padding: '3px 8px', borderRadius: 8 }}>{d}d</span>
                                    ))}
                                </div>
                            ) : '—'}
                        </div>

                        {/* Expanded SSL Details */}
                        {expandedSSL && (
                            <>
                                {loadingSSL && (
                                    <div style={{ gridColumn: '1 / span 2', textAlign: 'center', padding: '20px', opacity: 0.7 }}>
                                        Loading SSL details...
                                    </div>
                                )}
                                
                                {!loadingSSL && sslDetails && (
                                    <>
                                        {/* Chain Validation Status */}
                                        {typeof sslDetails.sslChainValid === 'boolean' && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Chain validation</div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <span className={`dot ${sslDetails.sslChainValid ? 'good' : 'bad'}`}></span>
                                                    {sslDetails.sslChainValid ? 'Valid' : 'Invalid'}
                                                    {sslDetails.sslChainLength && (
                                                        <span style={{ opacity: 0.7 }}>({sslDetails.sslChainLength} certificates)</span>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* Certificate Issuer */}
                                        {sslDetails.sslCertDetails?.issuer && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Issued by</div>
                                                <div>
                                                    <div>{sslDetails.sslCertDetails.issuer.CN || sslDetails.sslCertDetails.issuer.O || 'Unknown'}</div>
                                                    {sslDetails.sslCertDetails.issuer.O && sslDetails.sslCertDetails.issuer.O !== sslDetails.sslCertDetails.issuer.CN && (
                                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>{sslDetails.sslCertDetails.issuer.O}</div>
                                                    )}
                                                    {sslDetails.sslCertDetails.issuer.C && (
                                                        <div style={{ fontSize: '11px', opacity: 0.7 }}>Country: {sslDetails.sslCertDetails.issuer.C}</div>
                                                    )}
                                                </div>
                                            </>
                                        )}

                                        {/* Certificate Subject */}
                                        {sslDetails.sslCertDetails?.subject && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Issued to</div>
                                                <div>
                                                    {sslDetails.sslCertDetails.subject.CN || sslDetails.sslCertDetails.subject.O || 'Unknown'}
                                                </div>
                                            </>
                                        )}

                                        {/* Subject Alternative Names */}
                                        {sslDetails.sslCertDetails?.subjectaltname && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>SANs</div>
                                                <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                                    {sslDetails.sslCertDetails.subjectaltname}
                                                </div>
                                            </>
                                        )}

                                        {/* Valid From/To */}
                                        {sslDetails.sslCertDetails?.validFrom && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Valid from</div>
                                                <div>{new Date(sslDetails.sslCertDetails.validFrom).toLocaleString()}</div>
                                            </>
                                        )}

                                        {/* Certificate Fingerprints */}
                                        {(sslDetails.sslCertDetails?.fingerprint256 || sslDetails.sslCertDetails?.fingerprint) && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Fingerprint (SHA256)</div>
                                                <div style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.8, wordBreak: 'break-all' }}>
                                                    {sslDetails.sslCertDetails.fingerprint256 || sslDetails.sslCertDetails.fingerprint || '—'}
                                                </div>
                                            </>
                                        )}

                                        {/* Certificate Chain */}
                                        {sslDetails.sslCertDetails?.chain && sslDetails.sslCertDetails.chain.length > 0 && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Certificate chain</div>
                                                <div>
                                                    {sslDetails.sslCertDetails.chain.map((cert, idx) => (
                                                        <div key={idx} style={{ 
                                                            padding: '6px 10px', 
                                                            marginBottom: '4px', 
                                                            background: 'rgba(255,255,255,0.03)', 
                                                            borderRadius: '5px',
                                                            borderLeft: cert.isSelfSigned ? '3px solid #33DB29' : '3px solid #4545E6'
                                                        }}>
                                                            <div style={{ fontSize: '12px', fontWeight: 500 }}>
                                                                {idx === 0 ? '🔐 ' : idx === sslDetails.sslCertDetails.chain.length - 1 ? '🏛️ ' : '📜 '}
                                                                {cert.subject}
                                                            </div>
                                                            <div style={{ fontSize: '10px', opacity: 0.7 }}>
                                                                Issued by: {cert.issuer}
                                                                {cert.isSelfSigned && <span style={{ marginLeft: 8, color: '#33DB29' }}>(Root CA)</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}

                                        {/* Auto-Renewal Alerts */}
                                        <div style={{ opacity: 0.8 }}>Auto-renewal alerts</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                                <input 
                                                    type="checkbox"
                                                    checked={sslDetails.sslAutoRenewalEnabled || false}
                                                    onChange={(e) => handleSSLRenewalToggle(e.target.checked)}
                                                    style={{ cursor: 'pointer' }}
                                                />
                                                <span>{sslDetails.sslAutoRenewalEnabled ? 'Enabled' : 'Disabled'}</span>
                                            </label>
                                            {sslDetails.sslLastRenewalDetectedAt && (
                                                <span style={{ fontSize: '11px', opacity: 0.7 }}>
                                                    (Last renewal: {new Date(sslDetails.sslLastRenewalDetectedAt).toLocaleDateString()})
                                                </span>
                                            )}
                                        </div>

                                        {/* Serial Number */}
                                        {sslDetails.sslCertDetails?.serialNumber && (
                                            <>
                                                <div style={{ opacity: 0.8 }}>Serial number</div>
                                                <div style={{ fontSize: '11px', fontFamily: 'monospace', opacity: 0.8 }}>
                                                    {sslDetails.sslCertDetails.serialNumber}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Latest response summary (statusCode, responseTime, alert, error) */}
            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>Latest Response</div>
                    {latestLog && (
                        <>
                            <div className="stat-chip"><span className="dot accent"></span>{new Date(toEpochMs(latestLog.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                            {'statusCode' in latestLog && (
                                <div className="stat-chip"><span className="dot good"></span>Status {latestLog.statusCode ?? '\u2014'}</div>
                            )}
                            {'responseTime' in latestLog && (
                                <div className="stat-chip"><span className="dot warn"></span>{Number(latestLog.responseTime || 0)}ms</div>
                            )}
                            {'isAlertTriggered' in latestLog && (
                                <div className="stat-chip"><span className={`dot ${latestLog.isAlertTriggered ? 'bad' : 'good'}`}></span>{latestLog.isAlertTriggered ? 'Alert fired' : 'No alert'}</div>
                            )}
                        </>
                    )}
                </div>
                {latestLog?.error && (
                    <div className="glass-badge danger" style={{ display: 'inline-block', padding: '6px 10px', borderRadius: 10 }}>
                        Error: {String(latestLog.error)}
                    </div>
                )}
                {!latestLog && <div style={{ opacity: 0.7 }}>No recent data</div>}
            </div>

            {/* Recent status badge list */}
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
                        {(filteredLogs || []).slice(0, 24).map((log) => (
                            <span
                                key={String(log._id) + String(log.timestamp)}
                                className={`glass-badge ${log.state === 'UP' ? 'success' : 'danger'}`}
                                data-tooltip-id="status-detail"
                                data-tooltip-content={`Time: ${new Date(toEpochMs(log.timestamp)).toLocaleString()}\nStatus: ${log.statusCode ?? '\u2014'}\nResp: ${Number(log.responseTime || 0)}ms${log.isAlertTriggered ? '\nAlert: triggered' : ''}${log.error ? `\nError: ${String(log.error)}` : ''}`}
                                style={{ whiteSpace: 'pre' }}
                            >
                                {log.state} \u00b7 {new Date(toEpochMs(log.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
