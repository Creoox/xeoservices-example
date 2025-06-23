import path from 'path';

export const LOGS_PATH = path.join(__dirname, '..', 'logs');
export const HEALTH_LOG_FILE = path.join(LOGS_PATH, 'health.log.json');
