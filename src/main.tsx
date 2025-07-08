import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './polyfill'
import { HashRouter } from "react-router";


const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
