/**
 * Constants for the xeoservices-example application.
 * This module defines paths for logs and health check files.
 * It is used to centralize the configuration of file paths used throughout the application.
 */

import path from 'path';

export const LOGS_PATH = path.join(__dirname, '..', 'logs');
export const HEALTH_LOG_FILE = path.join(LOGS_PATH, 'health.log.json');
