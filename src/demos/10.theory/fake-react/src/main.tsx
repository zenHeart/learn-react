import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import React from "react";


const root = createRoot(document.getElementById('root')!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
performance.mark("Start rendering");
performance.mark("Finish rendering");
performance.measure("Rendering", "Start rendering", "Finish rendering");