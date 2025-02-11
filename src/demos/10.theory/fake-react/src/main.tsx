import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import React from "react";


const root = createRoot(document.getElementById('root')!)

root.render(
    new Proxy(<App />, {
      get(target, prop) {
        console.log('App element property accessed:', prop);
        return Reflect.get(target, prop);
      },
      set(target, prop, value) {
        console.log('App element property set:', prop, value);
        return Reflect.set(target, prop, value);
      }
    })
  // </React.StrictMode>
)
performance.mark("Start rendering");
performance.mark("Finish rendering");
performance.measure("Rendering", "Start rendering", "Finish rendering");
// @ts-ignore
window.root = root;