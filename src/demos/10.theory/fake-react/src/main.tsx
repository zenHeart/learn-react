import { createRoot } from 'react-dom/client'
import App from './App.tsx'

performance.mark("Start rendering");

console.group('createRoot')
const root = createRoot(document.getElementById('root')!)
console.groupEnd() 

console.group('render')
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
console.groupEnd()

performance.mark("Finish rendering");
performance.measure("Rendering", "Start rendering", "Finish rendering");
// @ts-ignore
window.root = root;