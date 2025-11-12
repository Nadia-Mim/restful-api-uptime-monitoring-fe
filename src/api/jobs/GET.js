import Server from '../../Server';

/**
 * Fetch job history with optional filters
 * @param {object} filters - { projectId?, environment?, status?, agentId?, type?, limit?, skip? }
 * @returns {Promise<[boolean, { data: Array, total: number }]>}
 */
export const listJobs = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.projectId) params.set('projectId', filters.projectId);
        if (filters.environment) params.set('environment', filters.environment);
        if (filters.status) params.set('status', filters.status);
        if (filters.agentId) params.set('agentId', filters.agentId);
        if (filters.type) params.set('type', filters.type);
        if (filters.limit) params.set('limit', String(filters.limit));
        if (filters.skip) params.set('skip', String(filters.skip));

        const queryString = params.toString();
        const url = `/jobs${queryString ? `?${queryString}` : ''}`;

        const res = await Server.get(url);
        return [true, { data: res?.data?.data || [], total: res?.data?.total || 0 }];
    } catch (e) {
        console.error('[listJobs] error', e);
        return [false, { data: [], total: 0 }];
    }
};

/**
 * Get a specific job by ID
 * @param {string} jobId
 * @returns {Promise<[boolean, object]>}
 */
export const getJob = async (jobId) => {
    try {
        const res = await Server.get(`/jobs?jobId=${encodeURIComponent(jobId)}&limit=1`);
        const jobs = res?.data?.data || [];
        return [true, jobs[0] || null];
    } catch (e) {
        console.error('[getJob] error', e);
        return [false, null];
    }
};
