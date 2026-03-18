import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import '@google/model-viewer';
import App from './App.jsx';
import EmergencyErrorBoundary from './components/EmergencyErrorBoundary.jsx';
import './index.css';
import { trackPageView } from './utils/analytics.js';

// Initialize performance tracking timestamp
window.modelLoadStartTime = performance.now();

// Track initial page view
document.addEventListener('DOMContentLoaded', () => {
  trackPageView(window.location.pathname, document.title);
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EmergencyErrorBoundary>
      <App />
      <Analytics />
      <SpeedInsights />
    </EmergencyErrorBoundary>
  </StrictMode>
);