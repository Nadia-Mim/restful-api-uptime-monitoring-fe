import Server from '../../Server';

/**
 * Dispatch a job to an agent (smart dispatch via project+environment or direct agentId)
 * @param {object} payload - { projectId, environment, type?, version? } OR { agentId, type, projectId?, payload? }
 */
export const dispatchJob = async (payload) => {
    try {
        const res = await Server.post('/jobs', payload);
        return [true, res?.data?.data];
    } catch (e) {
        console.error('[dispatchJob] error', e);
        return [false, null];
    }
};

/**
 * Report job status
 * @param {string} jobId 
 * @param {string} status - 'RUNNING' | 'SUCCESS' | 'FAILED'
 */
export const reportJobStatus = async (jobId, status) => {
    try {
        const res = await Server.post('/jobs', { action: 'report', jobId, status, finishedAt: new Date().toISOString() });
        return [true, res?.data?.data];
    } catch (e) {
        console.error('[reportJobStatus] error', e);
        return [false, null];
    }
};

/**
 * Post a job log
 * @param {string} jobId 
 * @param {string} type - 'stdout' | 'stderr' | 'info' | 'warn'
 * @param {string} message 
 */
export const postJobLog = async (jobId, type, message) => {
    try {
        const res = await Server.post('/jobs', { action: 'log', jobId, type, message });
        return [true, res?.data?.data];
    } catch (e) {
        console.error('[postJobLog] error', e);
        return [false, null];
    }
};
