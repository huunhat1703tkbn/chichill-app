// Centralized API configuration for Web and Zalo Mini App

export const BACKEND_URL = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  'https://chichill-app-701475997592.asia-southeast1.run.app'
).replace(/\/$/, '');

export function getApiUrl(endpoint: string): string {
  // Normalize leading slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // If running directly in any browser (Localhost, Cloud Run, Render, custom domains)
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.includes('run.app') ||
      host.includes('onrender.com')
    ) {
      return path;
    }
  }

  // Inside Zalo Mini App (zapps.vn, zdn.vn, zalo: protocol, webview, mobile), always route to backend URL
  return `${BACKEND_URL}${path}`;
}
