# Step 2: React Entry Points Analysis

> **Goal**: Trace how imports in our Counter demo connect to React's internal implementation
> 
> **Previous**: [Project Structure](./01-project-structure.md) - React monorepo organization
> 
> **Next Step**: [ReactDOM.createRoot](./03-createroot-analysis.md) - Root creation process

## Demo Import Chain Analysis

Let's trace each import in our Counter demo to understand the connection points:

### Import 1: React Core API

```javascript
import React, { Component } from "https://esm.sh/react@19";
```

**Import Chain Flow**:
```
Your Demo → react@19 → packages/react/index.js → packages/react/src/ReactClient.js
```

**Key Files**:
1. **Public Entry**: [`packages/react/index.js`](../packages/react/index.js#L77) - Re-exports from ReactClient
2. **Client Implementation**: [`packages/react/src/ReactClient.js`](../packages/react/src/ReactClient.js#L50) - Main API definitions
3. **Hook Definitions**: [`packages/react/src/ReactHooks.js`](../packages/react/src/ReactHooks.js#L57) - useState, useEffect, etc.

**What You Get**:
- `React.useState` → [`packages/react/src/ReactHooks.js#L57`](../packages/react/src/ReactHooks.js#L57)
- `Component` class → [`packages/react/src/ReactBaseClasses.js#L15`](../packages/react/src/ReactBaseClasses.js#L15)
- `React.createElement` → [`packages/react/src/jsx/ReactJSXElement.js`](../packages/react/src/jsx/ReactJSXElement.js)

### Import 2: ReactDOM Client

```javascript
import ReactDOM from "https://esm.sh/react-dom@19/client";
```

**Import Chain Flow**:
```
Your Demo → react-dom/client → packages/react-dom/client.js → packages/react-dom/src/client/ReactDOMClient.js
```

**Key Files**:
1. **Client Entry**: [`packages/react-dom/client.js`](../packages/react-dom/client.js#L10) - Exports createRoot and hydrateRoot
2. **DOM Client**: [`packages/react-dom/src/client/ReactDOMClient.js`](../packages/react-dom/src/client/ReactDOMClient.js#L10) - Main DOM functionality
3. **Root Implementation**: [`packages/react-dom/src/client/ReactDOMRoot.js`](../packages/react-dom/src/client/ReactDOMRoot.js#L160) - createRoot function

**What You Get**:
- `ReactDOM.createRoot` → [`packages/react-dom/src/client/ReactDOMRoot.js#L160`](../packages/react-dom/src/client/ReactDOMRoot.js#L160)
- `ReactDOM.hydrateRoot` → [`packages/react-dom/src/client/ReactDOMRoot.js#L296`](../packages/react-dom/src/client/ReactDOMRoot.js#L296)

## Deep Dive: Hook Resolution Chain

When you call `React.useState(0)` in your Counter component, here's the complete resolution path:

### 1. Public API Layer
```javascript
// packages/react/src/ReactHooks.js#L57-59
export function useState<S>(
  initialState: (() => S) | S,
): [S, Dispatch<BasicStateAction<S>>] {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
```

### 2. Dispatcher Resolution
```javascript
// packages/react/src/ReactHooks.js#L23-34
function resolveDispatcher() {
  const dispatcher = ReactSharedInternals.H;
  // H is the current hook dispatcher
  return dispatcher;
}
```

### 3. Actual Implementation
The dispatcher points to the real implementation in the reconciler:
- **Mount Phase**: [`packages/react-reconciler/src/ReactFiberHooks.js#L1920`](../packages/react-reconciler/src/ReactFiberHooks.js#L1920) - `mountState`
- **Update Phase**: [`packages/react-reconciler/src/ReactFiberHooks.js#L1926`](../packages/react-reconciler/src/ReactFiberHooks.js#L1926) - `updateState`

## Deep Dive: createRoot Resolution Chain

When you call `ReactDOM.createRoot(container)`, here's the flow:

### 1. Public Entry Point
```javascript
// packages/react-dom/src/client/ReactDOMRoot.js#L160-188
export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  // Validation and setup...
  const root = createContainer(/* ... */);
  return new ReactDOMRoot(root);
}
```

### 2. Container Creation
```javascript
// packages/react-reconciler/src/ReactFiberReconciler.js#L233-275
export function createContainer(
  containerInfo: Container,
  tag: RootTag,
  // ... other params
): OpaqueRoot {
  const root = createFiberRoot(/* ... */);
  return root;
}
```

### 3. Fiber Root Creation
```javascript
// packages/react-reconciler/src/ReactFiberRoot.js#L96-142
export function createFiberRoot(
  containerInfo: Container,
  tag: RootTag,
  // ... other params
): FiberRoot {
  const root: FiberRoot = new FiberRootNode(/* ... */);
  const uninitializedFiber = createHostRootFiber(tag, isStrictMode, identifierPrefix);
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;
  return root;
}
```

## Interactive Debugging Demo

Create a debugging version of your demo to trace these entry points:

```html
<!DOCTYPE html>
<html>
<head>
    <title>React Entry Points Debug</title>
</head>
<body>
    <div id="root"></div>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel" data-type="module">
        import React, { Component } from "https://esm.sh/react@19";
        import ReactDOM from "https://esm.sh/react-dom@19/client";

        // Debug: Log React internals
        console.log('React object:', React);
        console.log('ReactDOM object:', ReactDOM);
        console.log('useState function:', React.useState);
        console.log('createRoot function:', ReactDOM.createRoot);

        function Counter() {
            console.log('Counter component rendering...');
            
            // Set breakpoint here to see useState resolution
            debugger;
            const [count, setCount] = React.useState(0);
            
            console.log('useState returned:', { count, setCount });

            return (
                <button onClick={() => {
                    console.log('Button clicked, calling setCount...');
                    debugger; // Breakpoint for setState flow
                    setCount(count + 1);
                }}>
                    Count: {count}
                </button>
            );
        }

        class App extends Component {
            state = { time: new Date().toLocaleTimeString() };

            render() {
                console.log('App component rendering...');
                return (
                    <div>
                        <Counter /> {this.state.time}
                    </div>
                );
            }
        }

        console.log('Creating root...');
        debugger; // Breakpoint for createRoot flow
        const root = ReactDOM.createRoot(document.getElementById("root"));
        
        console.log('Root created:', root);
        console.log('Starting initial render...');
        debugger; // Breakpoint for initial render flow
        root.render(<App />);
    </script>
</body>
</html>
```

## Key Debugging Points

Set breakpoints at these critical junctions:

### 1. Hook Dispatcher Setup
- **File**: [`packages/react-reconciler/src/ReactFiberHooks.js#L485`](../packages/react-reconciler/src/ReactFiberHooks.js#L485)
- **Function**: `renderWithHooks`
- **Purpose**: See how hook context is established

### 2. useState Call
- **File**: [`packages/react-reconciler/src/ReactFiberHooks.js#L1920`](../packages/react-reconciler/src/ReactFiberHooks.js#L1920)
- **Function**: `mountState` (first render) or `updateState` (re-renders)
- **Purpose**: See hook state management

### 3. Container Creation
- **File**: [`packages/react-reconciler/src/ReactFiberReconciler.js#L233`](../packages/react-reconciler/src/ReactFiberReconciler.js#L233)
- **Function**: `createContainer`
- **Purpose**: See how React sets up the Fiber tree

## Shared Internals Deep Dive

React packages share internal state through `ReactSharedInternals`:

```javascript
// packages/shared/ReactSharedInternals.js
const ReactSharedInternals = {
  H: null, // Current hook dispatcher
  S: null, // Current batch config
  A: null, // Current cache dispatcher
  T: null, // Current transition
  // ... other internal state
};
```

This is how `react` and `react-reconciler` communicate without circular dependencies.

## Summary: Import Resolution

Your simple demo imports trigger a complex resolution chain:

1. **`React.useState`** → Public API → Dispatcher → Reconciler Implementation
2. **`ReactDOM.createRoot`** → Public API → Container Creation → Fiber Root Setup
3. **Shared State** → `ReactSharedInternals` bridges package boundaries

**Key Insight**: React's public API is a thin layer over the powerful reconciler engine. Every hook call, every render, flows through this carefully designed architecture.

## Debugging Challenge

Before moving to the next step, try this:

1. Run the debug demo above
2. Set breakpoints at the suggested locations
3. Step through each import resolution
4. Observe how the call stack moves between packages

**Questions to Answer**:
- How many stack frames separate your `useState` call from the actual implementation?
- What happens to the hook dispatcher between renders?
- How does React maintain component state between calls?

---

**Next**: [ReactDOM.createRoot Analysis](./03-createroot-analysis.md) - Deep dive into root creation process 