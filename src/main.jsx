import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/manrope/index.css';
import '@fontsource/russo-one/index.css';
import { GameProvider } from './context';
import App from './App';
import './styles.css';
import './design.css';

if (import.meta.env.PROD && 'serviceWorker' in navigator && window.location.protocol.startsWith('http') && window.location.hostname !== 'htmlpreview.github.io') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // The downloadable offline build does not depend on service-worker support.
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
);
