// Centralized API configuration for Web and Zalo Mini App

export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://chichill-app.onrender.com').replace(/\/$/, '');

export function getApiUrl(endpoint: string): string {
  // Normalize leading slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If in local development
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return path;
  }

  // If inside Zalo Mini App CDN runtime (h5.zdn.vn or zalo protocol)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('zdn.vn') || window.location.protocol === 'zalo:')
  ) {
    return `${BACKEND_URL}${path}`;
  }

  return path;
}
