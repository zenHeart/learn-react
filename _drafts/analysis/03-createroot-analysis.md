# Step 3: ReactDOM.createRoot Analysis

> **Goal**: Understand how React sets up its root container and initializes the Fiber architecture
> 
> **Previous**: [Entry Points](./02-entry-points.md) - How React packages connect
> 
> **Next Step**: [FiberRoot Creation](./04-fiberroot-creation.md) - Core data structure setup

## The createRoot Call in Our Demo

```javascript
const root = ReactDOM.createRoot(document.getElementById("root"));
```

This single line triggers a complex initialization process that sets up React's entire rendering infrastructure.

## Step-by-Step Analysis

### 1. Public API Entry Point

**File**: [`packages/react-dom/src/client/ReactDOMRoot.js#L160`](../packages/react-dom/src/client/ReactDOMRoot.js#L160)

```javascript
export function createRoot(
  container: Element | Document | DocumentFragment,
  options?: CreateRootOptions,
): RootType {
  if (!isValidContainer(container)) {
    throw new Error('Target container is not a DOM element.');
  }

  warnIfReactDOMContainerInDEV(container);

  // Parse options...
  const concurrentUpdatesByDefaultOverride = false;
  let isStrictMode = false;
  let identifierPrefix = '';
  let onUncaughtError = defaultOnUncaughtError;
  let onCaughtError = defaultOnCaughtError;
  let onRecoverableError = defaultOnRecoverableError;
  let transitionCallbacks = null;

  // Create the actual container
  const root = createContainer(
    container,
    ConcurrentRoot,
    null,
    isStrictMode,
    concurrentUpdatesByDefaultOverride,
    identifierPrefix,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    onDefaultTransitionIndicator,
    transitionCallbacks,
  );

  // Set up event delegation
  markContainerAsRoot(root.current, container);
  listenToAllSupportedEvents(rootContainerElement);

  // Return public API
  return new ReactDOMRoot(root);
}
```

### 2. Container Validation

**File**: [`packages/react-dom-bindings/src/client/ReactDOMContainer.js`](../packages/react-dom-bindings/src/client/ReactDOMContainer.js)

```javascript
export function isValidContainer(node: any): boolean {
  return !!(
    node &&
    (node.nodeType === ELEMENT_NODE ||
      node.nodeType === DOCUMENT_NODE ||
      node.nodeType === DOCUMENT_FRAGMENT_NODE ||
      (!disableCommentsAsDOMContainers && node.nodeType === COMMENT_NODE))
  );
}
```

**What this checks**:
- Element nodes (like `<div id="root">`)
- Document nodes
- Document fragments
- Comment nodes (in some cases)

### 3. Core Container Creation

**File**: [`packages/react-reconciler/src/ReactFiberReconciler.js#L233`](../packages/react-reconciler/src/ReactFiberReconciler.js#L233)

```javascript
export function createContainer(
  containerInfo: Container,
  tag: RootTag,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  concurrentUpdatesByDefaultOverride: null | boolean,
  identifierPrefix: string,
  onUncaughtError: (error: mixed, errorInfo: {+componentStack?: ?string}) => void,
  onCaughtError: (error: mixed, errorInfo: {+componentStack?: ?string, +errorBoundary?: ?React$Component<any, any>}) => void,
  onRecoverableError: (error: mixed, errorInfo: {+componentStack?: ?string}) => void,
  onDefaultTransitionIndicator: () => void | (() => void),
  transitionCallbacks: null | TransitionTracingCallbacks,
): OpaqueRoot {
  const hydrate = false;
  const initialChildren = null;
  
  // This is where the magic happens
  const root = createFiberRoot(
    containerInfo,
    tag,
    hydrate,
    initialChildren,
    hydrationCallbacks,
    isStrictMode,
    identifierPrefix,
    null,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    onDefaultTransitionIndicator,
    transitionCallbacks,
  );
  
  return root;
}
```

### 4. Fiber Root Creation

**File**: [`packages/react-reconciler/src/ReactFiberRoot.js#L96`](../packages/react-reconciler/src/ReactFiberRoot.js#L96)

```javascript
export function createFiberRoot(
  containerInfo: Container,
  tag: RootTag,
  hydrate: boolean,
  initialChildren: ReactNodeList,
  hydrationCallbacks: null | SuspenseHydrationCallbacks,
  isStrictMode: boolean,
  identifierPrefix: string,
  formState: ReactFormState<any, any> | null,
  onUncaughtError: null | ((error: mixed, errorInfo: {+componentStack?: ?string}) => void),
  onCaughtError: null | ((error: mixed, errorInfo: {+componentStack?: ?string, +errorBoundary?: ?React$Component<any, any>}) => void),
  onRecoverableError: null | ((error: mixed, errorInfo: {+componentStack?: ?string}) => void),
  onDefaultTransitionIndicator: null | (() => void | (() => void)),
  transitionCallbacks: null | TransitionTracingCallbacks,
): FiberRoot {
  // Create the FiberRoot node
  const root: FiberRoot = new FiberRootNode(
    containerInfo,
    tag,
    hydrate,
    identifierPrefix,
    onUncaughtError,
    onCaughtError,
    onRecoverableError,
    onDefaultTransitionIndicator,
    formState,
  );

  // Create the root Fiber node
  const uninitializedFiber = createHostRootFiber(tag, isStrictMode, identifierPrefix);

  // Connect FiberRoot and Fiber
  root.current = uninitializedFiber;
  uninitializedFiber.stateNode = root;

  // Initialize update queue
  const initialState: RootState = {
    element: initialChildren,
    isDehydrated: hydrate,
    cache: createCache(),
  };
  uninitializedFiber.memoizedState = initialState;
  initializeUpdateQueue(uninitializedFiber);

  return root;
}
```

## Key Data Structures Created

### 1. FiberRootNode

**File**: [`packages/react-reconciler/src/ReactFiberRoot.js#L96`](../packages/react-reconciler/src/ReactFiberRoot.js#L96)

```javascript
function FiberRootNode(
  containerInfo: Container,
  tag: RootTag,
  hydrate: boolean,
  identifierPrefix: string,
  onUncaughtError: null | ((error: mixed, errorInfo: {+componentStack?: ?string}) => void),
  onCaughtError: null | ((error: mixed, errorInfo: {+componentStack?: ?string, +errorBoundary?: ?React$Component<any, any>}) => void),
  onRecoverableError: null | ((error: mixed, errorInfo: {+componentStack?: ?string}) => void),
  onDefaultTransitionIndicator: null | (() => void | (() => void)),
  formState: ReactFormState<any, any> | null,
): FiberRoot {
  this.tag = tag;
  this.containerInfo = containerInfo;    // Your DOM element
  this.pendingChildren = null;
  this.current = null;                   // Will point to root Fiber
  this.pingCache = null;
  this.finishedWork = null;
  this.timeoutHandle = noTimeout;
  this.cancelPendingCommit = null;
  this.context = null;
  this.pendingContext = null;
  this.next = null;
  this.callbackNode = null;
  this.callbackPriority = NoLane;
  this.expirationTimes = createLaneMap(NoTimestamp);
  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.finishedLanes = NoLanes;
  this.errorRecoveryDisabledLanes = NoLanes;
  this.shellSuspendCounter = 0;
  this.entangledLanes = NoLanes;
  this.entanglements = createLaneMap(NoLanes);
  this.hiddenUpdates = createLaneMap(null);
  this.identifierPrefix = identifierPrefix;
  this.onRecoverableError = onRecoverableError;
  this.onUncaughtError = onUncaughtError;
  this.onCaughtError = onCaughtError;
  this.onDefaultTransitionIndicator = onDefaultTransitionIndicator;
  this.pooledCache = null;
  this.pooledCacheLanes = NoLanes;
  this.formState = formState;
  this.incompleteTransitions = new Map();
  this.passiveEffectDuration = 0;
  this.effectDuration = 0;
  this.memoizedUpdaters = new Set();
  this.pendingUpdatersLaneMap = createLaneMap(new Set());
}
```

### 2. Host Root Fiber

**File**: [`packages/react-reconciler/src/ReactFiber.js#L260`](../packages/react-reconciler/src/ReactFiber.js#L260)

```javascript
export function createHostRootFiber(
  tag: RootTag,
  isStrictMode: boolean,
  identifierPrefix: string,
): Fiber {
  let mode;
  if (tag === ConcurrentRoot) {
    mode = ConcurrentMode;
    if (isStrictMode === true) {
      mode |= StrictLegacyMode | StrictEffectsMode;
    }
  } else {
    mode = NoMode;
  }

  return createFiber(HostRoot, null, null, mode);
}
```

## Event System Setup

**File**: [`packages/react-dom-bindings/src/events/DOMPluginEventSystem.js`](../packages/react-dom-bindings/src/events/DOMPluginEventSystem.js)

```javascript
export function listenToAllSupportedEvents(rootContainerElement: EventTarget): void {
  if ((rootContainerElement: any)[listeningMarker]) {
    // Already listening.
    return;
  }
  (rootContainerElement: any)[listeningMarker] = true;
  
  allNativeEvents.forEach((domEventName) => {
    if (domEventName !== 'selectionchange') {
      if (!nonDelegatedEvents.has(domEventName)) {
        listenToNativeEvent(domEventName, false, rootContainerElement);
      }
      listenToNativeEvent(domEventName, true, rootContainerElement);
    }
  });
}
```

This sets up event delegation for all supported events on your root container.

## Interactive Demo: Observing createRoot

```html
<!DOCTYPE html>
<html>
<head>
    <title>createRoot Deep Dive</title>
</head>
<body>
    <div id="root"></div>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel" data-type="module">
        import React from "https://esm.sh/react@19";
        import ReactDOM from "https://esm.sh/react-dom@19/client";

        const container = document.getElementById("root");
        
        console.group("🔍 Before createRoot");
        console.log("Container element:", container);
        console.log("Container properties:", Object.getOwnPropertyNames(container));
        console.log("React-related properties:", Object.getOwnPropertyNames(container).filter(prop => prop.includes('react')));
        console.groupEnd();

        console.group("🚀 Creating root...");
        debugger; // Set breakpoint here
        const root = ReactDOM.createRoot(container);
        console.groupEnd();

        console.group("🔍 After createRoot");
        console.log("Root object:", root);
        console.log("Root properties:", Object.getOwnPropertyNames(root));
        console.log("Container after root creation:", container);
        console.log("New React-related properties:", Object.getOwnPropertyNames(container).filter(prop => prop.includes('react')));
        
        // Access internal root (development only)
        console.log("Internal root:", root._internalRoot);
        if (root._internalRoot) {
            console.log("FiberRoot.current:", root._internalRoot.current);
            console.log("FiberRoot.containerInfo:", root._internalRoot.containerInfo);
            console.log("Root Fiber tag:", root._internalRoot.current.tag);
            console.log("Root Fiber mode:", root._internalRoot.current.mode);
        }
        console.groupEnd();

        // Simple component to render
        function SimpleApp() {
            return React.createElement('h1', null, 'Root created successfully!');
        }

        console.group("🎯 Rendering to root...");
        debugger; // Another breakpoint for render
        root.render(React.createElement(SimpleApp));
        console.groupEnd();
    </script>
</body>
</html>
```

## What Happens Under the Hood

### 1. Validation Phase
- Checks if container is a valid DOM element
- Validates options (if provided)
- Sets up error boundaries

### 2. Configuration Phase
- Determines root tag (ConcurrentRoot vs LegacyRoot)
- Configures error handlers
- Sets up strict mode and other flags

### 3. Core Creation Phase
- Creates `FiberRootNode` (manages the container)
- Creates root `Fiber` node (represents the app)
- Connects them with circular references

### 4. Initialization Phase
- Sets up update queue on root Fiber
- Initializes state with empty element
- Prepares cache infrastructure

### 5. Event Setup Phase
- Marks container as React root
- Sets up event delegation
- Registers all supported event types

## Memory Structure After createRoot

```
┌─────────────────┐    ┌─────────────────┐
│   DOM Element   │    │   FiberRoot     │
│   #root         │◄───┤ containerInfo   │
│                 │    │                 │
│ __reactContainer│───►│                 │
└─────────────────┘    │   current       │───┐
                       └─────────────────┘   │
                                             │
                       ┌─────────────────┐   │
                       │  Root Fiber     │◄──┘
                       │  tag: HostRoot  │
                       │                 │
                       │  stateNode      │───┐
                       └─────────────────┘   │
                             ▲               │
                             └───────────────┘
```

## Performance Implications

1. **Event Delegation**: All events are delegated to the root, not individual elements
2. **Memory Setup**: Circular references are carefully managed
3. **Mode Configuration**: Concurrent vs Legacy affects scheduling behavior
4. **Cache Initialization**: Sets up React's internal cache system

## Debugging Tips

### Key Breakpoints:
1. **[`ReactDOMRoot.js#L160`](../packages/react-dom/src/client/ReactDOMRoot.js#L160)** - Entry point
2. **[`ReactFiberReconciler.js#L233`](../packages/react-reconciler/src/ReactFiberReconciler.js#L233)** - Core creation
3. **[`ReactFiberRoot.js#L96`](../packages/react-reconciler/src/ReactFiberRoot.js#L96)** - Fiber root setup

### Console Exploration:
```javascript
// After createRoot, inspect these:
root._internalRoot                    // FiberRoot
root._internalRoot.current           // Root Fiber
root._internalRoot.containerInfo     // Your DOM element
root._internalRoot.current.stateNode // Points back to FiberRoot
```

## Summary

`ReactDOM.createRoot()` is React's initialization ritual:

1. **Validates** your container
2. **Creates** the FiberRoot (React's control center)
3. **Connects** it to a root Fiber node
4. **Sets up** event delegation
5. **Returns** a public API object

This creates the foundation for React's Fiber architecture. The root is now ready to accept your first render call!

---

**Next**: [FiberRoot Creation](./04-fiberroot-creation.md) - Deep dive into the core data structure setup 