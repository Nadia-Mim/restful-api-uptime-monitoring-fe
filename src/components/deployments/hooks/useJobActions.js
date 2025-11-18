/**
 * Custom hook for handling deployment job actions
 * Manages job dispatching and modal state for deploy, start, stop, restart actions
 */
import { useState, useCallback } from 'react';

export const useJobActions = (setJobLogsModal, setConfirmDialog) => {
    const [actionLoading, setActionLoading] = useState({});

    /**
     * Dispatch a job and open the logs modal
     */
    const dispatchJobAndShowLogs = useCallback(async (project, target, agent, type, loadingKey) => {
        setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

        try {
            const { dispatchJob } = await import('../../../api/jobs/POST');
            const [ok, data] = await dispatchJob({
                projectId: project._id,
                environment: target.environment,
                type
            });

            if (ok && data?.jobId) {
                setJobLogsModal({
                    visible: true,
                    jobId: data.jobId,
                    jobInfo: {
                        projectName: project.name,
                        environment: target.environment,
                        type: type,
                        agentName: agent?.name
                    }
                });
                return { success: true };
            } else {
                setConfirmDialog({
                    visible: true,
                    title: '❌ Action Failed',
                    message: data || `Failed to ${type}. Please check your configuration and try again.`,
                    type: 'danger',
                    confirmText: 'OK',
                    onConfirm: () => setConfirmDialog(prev => ({ ...prev, visible: false }))
                });
                return { success: false, error: data };
            }
        } catch (error) {
            console.error(`Error dispatching ${type} job:`, error);
            return { success: false, error: error.message };
        } finally {
            setActionLoading(prev => {
                const updated = { ...prev };
                delete updated[loadingKey];
                return updated;
            });
        }
    }, [setJobLogsModal, setConfirmDialog]);

    /**
     * Check if agent is available and online before action
     */
    const validateAgent = useCallback((agent, agentId, agentStatus, setConfirmDialog) => {
        if (!agent) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Agent Not Found',
                message: 'The assigned agent was not found. Please check agent configuration.',
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog(prev => ({ ...prev, visible: false }))
            });
            return false;
        }

        const isOnline = agentStatus[agentId]?.status === 'online';
        if (!isOnline) {
            setConfirmDialog({
                visible: true,
                title: '⚠️ Agent Offline',
                message: `Agent "${agent.name}" is currently offline. Action cannot proceed. Please ensure the agent is running.`,
                type: 'warning',
                confirmText: 'OK',
                onConfirm: () => setConfirmDialog(prev => ({ ...prev, visible: false }))
            });
            return false;
        }

        return true;
    }, []);

    /**
     * Show production deployment confirmation
     */
    const showProductionConfirmation = useCallback((projectName, onConfirm, setConfirmDialog) => {
        setConfirmDialog({
            visible: true,
            title: '🚀 Deploy to Production',
            message: `Are you sure you want to deploy "${projectName}" to PRODUCTION?\n\nThis will update the live production environment.`,
            type: 'warning',
            confirmText: 'Deploy',
            onConfirm: async () => {
                setConfirmDialog(prev => ({ ...prev, visible: false }));
                await onConfirm();
            },
            onCancel: () => setConfirmDialog(prev => ({ ...prev, visible: false }))
        });
    }, []);

    return {
        actionLoading,
        dispatchJobAndShowLogs,
        validateAgent,
        showProductionConfirmation
    };
};
