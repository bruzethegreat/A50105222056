import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LoggingService } from './services/logger';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

LoggingService.logInfo('component', 'Application starting up');

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

window.addEventListener('error', (event) => {
  LoggingService.logError('component', `Unhandled error: ${event.error?.message || 'Unknown error'}`);
});

window.addEventListener('unhandledrejection', (event) => {
  LoggingService.logError('component', `Unhandled promise rejection: ${event.reason}`);
});

LoggingService.logInfo('component', 'Application initialized successfully');