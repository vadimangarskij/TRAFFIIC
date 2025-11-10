import React from 'react';
import ReactDOM from 'react-dom/client';
import { SDKProvider } from '@telegram-apps/sdk-react';
import App from './App';
import './index.css';

// NOTE: React.StrictMode has been removed.
// It can cause issues with the Telegram SDK's debug mode by running initialization effects twice,
// leading to the "Unable to retrieve launch parameters" error in a browser environment.
// This change ensures a stable development experience.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <SDKProvider acceptCustomStyles debug>
    <App />
  </SDKProvider>
);
