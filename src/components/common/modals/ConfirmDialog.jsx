import React from 'react';
import { CustomModal, CustomModalBody, CustomModalHeader } from '../common/modals/customModal/CustomModal';

/**
 * ConfirmDialog - Reusable confirmation modal
 * @param {boolean} visible - Modal visibility
 * @param {string} title - Dialog title
 * @param {string} message - Confirmation message
 * @param {string} confirmText - Confirm button text (default: 'Confirm')
 * @param {string} cancelText - Cancel button text (default: 'Cancel')
 * @param {string} type - Dialog type: 'danger' | 'warning' | 'info' (default: 'warning')
 * @param {function} onConfirm - Confirm action handler
 * @param {function} onCancel - Cancel action handler
 * @param {boolean} loading - Show loading state on confirm button
 */
const ConfirmDialog = ({
    visible,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'warning',
    onConfirm,
    onCancel,
    loading = false
}) => {
    const getTypeColor = () => {
        switch (type) {
            case 'danger': return '#EF5350';
            case 'warning': return '#FFA726';
            case 'info': return '#42A5F5';
            default: return '#FFA726';
        }
    };

    const getTypeIcon = () => {
        switch (type) {
            case 'danger': return '⚠️';
            case 'warning': return '⚡';
            case 'info': return 'ℹ️';
            default: return '⚡';
        }
    };

    return (
        <CustomModal visible={visible} style={{ maxWidth: '480px' }}>
            <CustomModalHeader onClose={onCancel}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{getTypeIcon()}</span>
                    <span>{title}</span>
                </div>
            </CustomModalHeader>
            <CustomModalBody style={{ padding: '20px' }}>
                <div
                    style={{
                        padding: '16px',
                        background: `${getTypeColor()}15`,
                        border: `1px solid ${getTypeColor()}40`,
                        borderRadius: '6px',
                        color: '#DCE4F0',
                        fontSize: 14,
                        lineHeight: 1.6,
                        marginBottom: 20
                    }}
                >
                    {message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        style={{
                            background: getTypeColor(),
                            color: '#fff',
                            padding: '8px 16px',
                            borderRadius: '5px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1
                        }}
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </CustomModalBody>
        </CustomModal>
    );
};

export default ConfirmDialog;
