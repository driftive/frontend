export const API_URL = window.ENV?.API_URL || 'https://api.driftive.cloud/api';
export const APP_DEBUG = window.ENV?.APP_DEBUG || false;
export const GITHUB_APP_NAME = window.ENV?.GITHUB_APP_NAME || 'driftive';
export const GITHUB_INSTALLATION_URL = `https://github.com/apps/${GITHUB_APP_NAME}/installations/new`;

export const POSTHOG_API_KEY = window.ENV?.POSTHOG_API_KEY;
export const POSTHOG_API_HOST = window.ENV?.POSTHOG_API_HOST || 'https://us.i.posthog.com';
