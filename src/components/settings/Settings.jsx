import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import getSettings from '../../api/settings/GET';
import putSettings from '../../api/settings/PUT';
import SuccessModal from '../common/modals/successModal/SuccessModal';

const Settings = () => {
    const queryClient = useQueryClient();
    const authData = localStorage.authData ? JSON.parse(localStorage.authData) : {};
    const userId = authData?.userId;

    const { data } = useQuery(['settings', userId], () => getSettings({ userId }), { enabled: !!userId });
    const [ttl, setTtl] = useState(24);
    const [successModalVisible, setSuccessModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    useEffect(() => {
        if (data?.ttlHours) setTtl(Number(data.ttlHours));
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <div className="glass-button-primary" style={{ padding: '8px 40px', borderRadius: 10, cursor: 'pointer' }} onClick={() => userId && mutation.mutate({ userId, ttlHours: ttl })}>Save</div>
            </div>
        </div>
    );
};

export default Settings;
