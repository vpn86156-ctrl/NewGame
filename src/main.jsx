import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/manrope/index.css';
import '@fontsource/russo-one/index.css';
import { GameProvider } from './context';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
);
