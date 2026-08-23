import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Hỗ trợ cả môi trường Web thông thường (id="root") và Zalo Mini App (id="app")
let container = document.getElementById('root') || document.getElementById('app');

if (!container) {
  container = document.createElement('div');
  container.id = 'root';
  document.body.appendChild(container);
}

const root = createRoot(container);
root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
