import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import getSettings from '../../api/settings/GET';
import putSettings from '../../api/settings/PUT';
import SuccessModal from '../common/modals/successModal/SuccessModal';
import Loader from '../common/loader/Loader';

const Settings = () => {
    const queryClient = useQueryClient();
    const userId = (() => {
        try {
            return JSON.parse(localStorage.getItem('authData') || '{}')?.userId;
        } catch (e) {
            return undefined;
        }
    })();

    // Load user settings; expose loader via isLoading
    const { data, isLoading } = useQuery(['settings', userId], () => getSettings({ userId }), { enabled: !!userId });
    const [ttl, setTtl] = useState(24);
    const [sslThresholdDays, setSslThresholdDays] = useState([30, 14, 7, 3, 1]);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        if (data?.ttlHours) setTtl(Number(data.ttlHours));
        if (Array.isArray(data?.sslThresholdDays)) setSslThresholdDays(data.sslThresholdDays);
    }, [data]);

    const mutation = useMutation((payload) => putSettings(payload), {
        onSuccess: () => {
            queryClient.invalidateQueries(['settings', userId]);
            setMessage('Settings saved successfully.');
            setSuccessModalVisible(true);
        }
    });

    const actionOnSuccessModal = () => {
        setSuccessModalVisible(false);
    };

    return (
        <div>
            {/* Page-level loader */}
            {isLoading && <Loader />}
            {successModalVisible && (
                <SuccessModal
                    modalVisible={successModalVisible}
                    actionOnSuccessModal={actionOnSuccessModal}
                    message={message || 'Settings saved successfully.'}
                />
            )}
            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Health Log Retention (TTL):</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap' }}>
                        {[{ label: '24H', val: 24 }, { label: '7D', val: 24 * 7 }, { label: '1M', val: 24 * 30 }].map(opt => (
                            <div key={opt.val} className={`pill ${ttl === opt.val ? 'active' : ''}`} onClick={() => setTtl(opt.val)}>
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="api-details-card" style={{ background: '#1E1F2600', padding: '15px 20px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>SSL Expiry Alert Thresholds (Days):</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {[
                            { label: '1D', val: 1 },
                            { label: '3D', val: 3 },
                            { label: '7D', val: 7 },
                            { label: '1 M', val: 30 }
                        ].map((opt) => {
                            const on = sslThresholdDays.includes(opt.val);
                            return (
                                <div key={opt.val} className={`pill ${on ? 'active' : ''}`} onClick={() => setSslThresholdDays(prev => on ? prev.filter(x => x !== opt.val) : [...prev, opt.val].sort((a, b) => a - b))}>
                                    {opt.label}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <div className="glass-button-primary" style={{ padding: '8px 40px', borderRadius: 10, cursor: 'pointer' }} onClick={() => userId && mutation.mutate({ userId, ttlHours: ttl, sslThresholdDays })}>Save</div>
            </div>
        </div>
    );
};

export default Settings;
