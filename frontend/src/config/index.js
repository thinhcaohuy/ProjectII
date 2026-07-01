export const APP_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api',
  STORAGE_KEYS: {
    USER: 'user',
    EMAIL: 'email',
  },
};

export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  DATE_FORMAT: 'DD/MM/YYYY',
};