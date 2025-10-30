import type { EnvConfig } from '@/types/client';

export const env: EnvConfig = {
  // App info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Starter UI Templete',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  APP_DESCRIPTION: import.meta.env.VITE_APP_DESCRIPTION || "Starter UI Templete",

  // API configuration
  API_URL: import.meta.env.VITE_API_URL,
  MEDIA_URL: import.meta.env.VITE_MEDIA_URL,

  // Feature flags
  ENABLE_LOGS: parseBooleanEnv(import.meta.env.VITE_ENABLE_LOGS, true),
  ENABLE_MOCK_API: parseBooleanEnv(import.meta.env.VITE_ENABLE_MOCK_API, false),

  // Environment info
  MODE: parseMode(import.meta.env.VITE_APP_MODE),

  // Analytics and monitoring
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
};


function parseBooleanEnv(value: any, defaultValue: boolean): boolean {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    value = value.toLowerCase().trim();
    return value === 'true' || value === '1' || value === 'yes';
  }
  return Boolean(value);
}


function parseMode(value: any): EnvConfig['MODE'] {
  const validModes = ['development', 'production', 'staging', 'test'];
  if (typeof value === 'string' && validModes.includes(value)) {
    return value as EnvConfig['MODE'];
  }
  // Default to production for safety
  return process.env.NODE_ENV === 'development' ? 'development' : 'production';
}


export function isDevelopment(): boolean {
  return env.MODE === 'development';
}


export function isProduction(): boolean {
  return env.MODE === 'production';
}


export function isStaging(): boolean {
  return env.MODE === 'staging';
}


export function isTest(): boolean {
  return env.MODE === 'test';
}

export default env;