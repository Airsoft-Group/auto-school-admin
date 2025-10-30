

export interface EnvConfig {
  // App info
  APP_NAME: string;
  APP_VERSION: string;
  APP_DESCRIPTION: string;

  // API configuration
  API_URL: string;
  MEDIA_URL: string;

  // Feature flags
  ENABLE_LOGS: boolean;
  ENABLE_MOCK_API: boolean;

  // Environment info
  MODE: 'development' | 'production' | 'staging' | string;

  // Build configuration
  OUT_DIR?: string;

  // Analytics and monitoring
  SENTRY_DSN?: string;
  GOOGLE_ANALYTICS_ID?: string;
}

export type AppMode = 'development' | 'production' | 'staging';
