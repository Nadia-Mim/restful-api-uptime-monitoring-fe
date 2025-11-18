/**
 * Helper functions for project-related operations
 */

/**
 * Generate loading key for action buttons
 */
export const generateLoadingKey = (projectId, environment, action) => {
    return `${action}-${projectId}-${environment}`;
};

/**
 * Get runtime status color based on status string
 */
export const getRuntimeStatusColor = (status) => {
    switch (status) {
        case 'running':
            return '#4CAF50';
        case 'stopped':
            return '#EF5350';
        default:
            return '#9fb0c6';
    }
};

/**
 * Check if agent is online
 */
export const isAgentOnline = (agentId, agentStatus) => {
    return agentStatus[agentId]?.status === 'online';
};

/**
 * Find agent by ID
 */
export const findAgentById = (agents, agentId) => {
    return agents.find(a => a._id === agentId);
};

/**
 * Find pipeline template by ID
 */
export const findPipelineById = (templates, pipelineId) => {
    return templates.find(t => t._id === pipelineId);
};

/**
 * Check if pipeline has Docker configuration
 */
export const hasDockerConfig = (pipeline) => {
    return pipeline?.useDocker || false;
};

/**
 * Check if pipeline has run commands
 */
export const hasRunCommands = (pipeline) => {
    return pipeline?.runCommands?.length > 0;
};

/**
 * Check if pipeline has stop commands
 */
export const hasStopCommands = (pipeline) => {
    return pipeline?.stopCommands?.length > 0;
};

/**
 * Check if pipeline supports restart (has both run and stop)
 */
export const supportsRestart = (pipeline) => {
    return hasDockerConfig(pipeline) || (hasRunCommands(pipeline) && hasStopCommands(pipeline));
};
