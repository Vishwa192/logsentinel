// Redis / error tracking
export const WINDOW_SECONDS = 60; // sliding/fixed window size in seconds
export const ERROR_THRESHOLD = 5; // errors within the window to count as a spike
export const MAX_RECENT_ERRORS = 10; // how many recent error messages to keep per service

// Kafka
export const LOG_TOPIC = 'app-logs';

// MongoDB
export const MONGO_URL = process.env.MONGO_URL ?? 'mongodb://localhost:27017';
export const DB_NAME = 'logsentinel';
export const LOGS_COLLECTION = 'logs';
export const INCIDENTS_COLLECTION = 'incidents';

// Services this system knows about
export const KNOWN_SERVICES = ['payment_service', 'auth_service', 'notification_service'];

// API server
export const PORT = 4000;