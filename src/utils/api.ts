// Centralized API configuration for Web and Zalo Mini App

export const BACKEND_URL = (import.meta.env.VITE_API_URL || 'https://chichill-app.onrender.com').replace(/\/$/, '');

export function getApiUrl(endpoint: string): string {
  // Normalize leading slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (typeof window !== 'undefined') {
    // If in local development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return path;
    }
    // If running directly on Render backend domain
    if (window.location.hostname.includes('onrender.com')) {
      return path;
    }
  }

  // Inside Zalo Mini App (zapps.vn, zdn.vn, zalo: protocol, webview, mobile), always route to full Render backend URL
  return `${BACKEND_URL}${path}`;
}
