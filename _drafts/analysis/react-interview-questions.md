# React Internals Interview Questions Bank

## 🎯 50+ Questions to Master React Interviews

**Organized by difficulty and topic to ensure complete coverage of React internals knowledge**

## 🌟 Fundamentals (Entry-Level)

### Q1: What happens when you call ReactDOM.createRoot()?
**Answer**: 
- Creates a `FiberRootNode` with tag `ConcurrentRoot`
- Creates a `HostRoot` fiber as the root of the fiber tree
- Initializes update queue on the HostRoot fiber
- Returns a `ReactDOMRoot` wrapper object with `render()` method
- Marks the DOM container as a React root

**Source**: `packages/react-dom/src/client/ReactDOMClient.js#L92`

### Q2: What's the difference between React elements and Fiber nodes?
**Answer**:
- **React Element**: Plain object `{type, key, props, _owner, _store}` - immutable description
- **Fiber Node**: Mutable object with work state, child/sibling pointers, effect flags
- Elements describe what you want, Fibers track the work to make it happen
- One element can create multiple fibers (current + work-in-progress)

### Q3: Explain React's two-phase rendering
**Answer**:
- **Render Phase**: Interruptible, builds fiber tree, calls components, runs hooks
- **Commit Phase**: Synchronous, applies DOM changes, runs effects
- Render phase can be paused/restarted, commit phase must complete atomically
- This enables time-slicing and concurrent features

### Q4: How does React handle event delegation?
**Answer**:
- Single event listener on document root for all events
- Events bubble up to React's listener
- React creates `SyntheticEvent` wrapper for cross-browser compatibility
- Event handlers found via fiber tree traversal
- Enables features like event pooling and consistent behavior

### Q5: What are React's priority lanes in React 19?
**Answer**:
- Bitwise priority system replacing expiration times
- `SyncLane` (1) = highest priority (user input)
- `DefaultLane` = normal updates
- `TransitionLane` = non-urgent updates
- `IdleLane` = lowest priority background work
- Enables better scheduling and interruption

## 🔥 Intermediate (Mid-Level)

### Q6: Walk through the complete useState execution flow
**Answer**:
```javascript
// Mount phase:
1. mountState() creates hook object with memoizedState
2. Hook added to fiber.memoizedState linked list
3. Returns [initialState, dispatchSetState]

// Update phase:
1. dispatchSetState() creates update object
2. enqueueUpdate() adds to hook's update queue
3. scheduleUpdateOnFiber() schedules re-render
4. updateState() processes update queue during re-render
5. Returns [newState, dispatchSetState]
```

### Q7: How does React's reconciliation algorithm work?
**Answer**:
- **Single elements**: Compare type and key, reuse if same
- **Arrays**: Use keys to match old/new elements efficiently
- **Different types**: Unmount old tree, mount new tree
- **Same type**: Update props and continue with children
- **Key heuristic**: Elements with same key assumed to be same component

### Q8: Explain React's double buffering technique
**Answer**:
- Two fiber trees: `current` (on screen) and `workInProgress` (being built)
- During render, work on workInProgress tree
- After commit, swap pointers: workInProgress becomes current
- Enables atomic updates and rollback capability
- `fiber.alternate` points between the two trees

### Q9: How do React hooks maintain state between renders?
**Answer**:
- Hooks stored as linked list on `fiber.memoizedState`
- Hook order must stay consistent (why no hooks in conditionals)
- Each hook has `memoizedState`, `next` pointer, and update queue
- Different dispatcher used for mount vs update phases
- Hook state persists on fiber between renders

### Q10: What happens during React's commit phase?
**Answer**:
```javascript
// Three sub-phases:
1. Before Mutation:
   - getSnapshotBeforeUpdate()
   - Schedule useEffect callbacks

2. Mutation:
   - DOM operations (appendChild, removeChild)
   - Update DOM properties
   - Set refs to null for deletions

3. Layout:
   - componentDidMount/Update
   - useLayoutEffect callbacks
   - Update refs with new values
```

## 🚀 Advanced (Senior-Level)

### Q11: How does React's scheduler implement time-slicing?
**Answer**:
- Uses `MessageChannel` for scheduling (or `setTimeout` fallback)
- Yields control every 5ms by default
- Checks `shouldYield()` between units of work
- Higher priority work can interrupt lower priority
- Implements cooperative multitasking without blocking main thread

### Q12: Explain React's lane-based priority system
**Answer**:
- 31-bit bitmask system for fine-grained priorities
- Multiple lanes can be batched together
- Lane entanglement for related updates
- `getHighestPriorityLane()` selects work to do next
- Enables sophisticated scheduling strategies

### Q13: How does React handle error boundaries internally?
**Answer**:
- `throwException()` catches errors during render
- Traverses fiber tree upward looking for error boundary
- Calls `getDerivedStateFromError()` and `componentDidCatch()`
- Creates error recovery fiber to re-render with error state
- Unwinds work stack and restarts from error boundary

### Q14: What's the difference between useEffect and useLayoutEffect?
**Answer**:
```javascript
// useLayoutEffect:
- Runs synchronously after DOM mutations
- Blocks browser paint
- Use for DOM measurements/synchronous updates

// useEffect:
- Runs asynchronously after paint
- Doesn't block browser paint
- Use for side effects that don't affect layout
```

### Q15: How does React implement concurrent features?
**Answer**:
- Work split into interruptible units
- Scheduler yields to browser between units
- High-priority updates interrupt low-priority work
- Uses `startTransition()` for non-urgent updates
- Enables responsive UI during heavy computation

## 🎯 Expert (Staff/Principal-Level)

### Q16: How would you implement your own React?
**Answer**:
```javascript
// Mini-React implementation:
1. createElement() - create element objects
2. render() - reconcile elements to DOM
3. useState() - state management with re-render
4. Basic reconciler with diff algorithm
5. Component lifecycle management
6. Event handling system
```

### Q17: How does React's context system work internally?
**Answer**:
- Context providers create context values on fiber nodes
- Consumers traverse up fiber tree to find nearest provider
- `readContext()` during render subscribes component to context
- Context changes trigger re-render of all consumers
- Uses stack-like structure for nested providers

### Q18: Explain React's effect scheduling system
**Answer**:
- Effects stored in circular linked list on fiber
- Different effect tags for different types (Layout, Passive, etc.)
- Passive effects scheduled with scheduler for async execution
- Layout effects run synchronously after DOM mutations
- Effect cleanup runs before next effect or unmount

### Q19: How does React handle component updates efficiently?
**Answer**:
- `React.memo()` prevents re-render if props unchanged
- `useMemo()`/`useCallback()` memoize expensive computations
- Fiber tree reuse via `bailoutOnAlreadyFinishedWork()`
- Lane-based batching reduces redundant work
- Early bailout when state doesn't change

### Q20: What are React's internal debugging hooks?
**Answer**:
- `__REACT_DEVTOOLS_GLOBAL_HOOK__` for DevTools integration
- `onScheduleUpdate`, `onCommitRoot` callbacks
- Fiber tree inspection via DevTools
- Performance profiling with React DevTools Profiler
- Error boundary tracking and component stack traces

## 🔬 Deep Internals (Expert+)

### Q21: How does React's work loop handle interruptions?
**Answer**:
```javascript
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}

// shouldYield() checks:
- Time elapsed since start
- Pending higher priority work
- Browser needs to paint/handle events
```

### Q22: Explain React's update batching mechanism
**Answer**:
- Updates batched by priority lane
- `flushSync()` forces immediate synchronous update
- Automatic batching in React 18+ for all updates
- `unstable_batchedUpdates()` for manual batching
- Event handlers automatically batched

### Q23: How does React implement Suspense?
**Answer**:
- Component throws promise during render
- `throwException()` catches and handles promise
- Suspense boundary catches thrown promise
- Shows fallback UI while promise pending
- Re-renders when promise resolves

### Q24: What's React's approach to memory management?
**Answer**:
- Fiber nodes reused across renders
- Object pooling for frequently created objects
- Weak references for cleanup
- Effect cleanup prevents memory leaks
- DevTools helps identify memory issues

### Q25: How does React handle server-side rendering?
**Answer**:
- `renderToString()` synchronously renders to HTML
- `renderToPipeableStream()` for streaming SSR
- Hydration matches server HTML with client components
- Selective hydration for better performance
- Concurrent features work with SSR

## 🛠️ Performance & Optimization

### Q26: How do you identify React performance bottlenecks?
**Answer**:
- React DevTools Profiler for component render times
- Chrome Performance tab for main thread blocking
- `why-did-you-render` for unnecessary re-renders
- Bundle analysis for code splitting opportunities
- Memory tab for memory leaks

### Q27: What causes unnecessary re-renders in React?
**Answer**:
- Parent component re-render without memoization
- New object/function references in props
- Context value changes
- State updates that don't actually change value
- Missing dependencies in useEffect

### Q28: How does React optimize list rendering?
**Answer**:
- Keys enable efficient reconciliation
- `React.memo()` prevents re-render of unchanged items
- Virtual scrolling for large lists
- `useMemo()` for expensive list computations
- Stable references for event handlers

### Q29: Explain React's concurrent rendering benefits
**Answer**:
- Non-blocking rendering keeps UI responsive
- High-priority updates interrupt low-priority work
- Time-slicing prevents long tasks
- Automatic batching reduces work
- Suspense enables progressive loading

### Q30: How do you optimize React bundle size?
**Answer**:
- Tree shaking to remove unused code
- Code splitting with `React.lazy()`
- Dynamic imports for route-based splitting
- Bundle analysis to identify large dependencies
- Preloading for critical resources

## 🎨 Patterns & Best Practices

### Q31: When should you use useCallback vs useMemo?
**Answer**:
```javascript
// useCallback - memoize functions
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// useMemo - memoize values
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(items);
}, [items]);
```

### Q32: How do you handle side effects in React?
**Answer**:
- `useEffect()` for async side effects
- `useLayoutEffect()` for synchronous DOM updates
- Cleanup functions to prevent memory leaks
- Dependency arrays for effect optimization
- Custom hooks for reusable effect logic

### Q33: What's the proper way to handle forms in React?
**Answer**:
- Controlled components for real-time validation
- Uncontrolled components with refs for simple forms
- Form libraries like Formik/React Hook Form
- Debouncing for expensive validation
- Error boundaries for form error handling

### Q34: How do you implement error boundaries effectively?
**Answer**:
```javascript
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    logErrorToService(error, errorInfo);
  }
}
```

### Q35: What are React's composition patterns?
**Answer**:
- Higher-Order Components (HOCs)
- Render props pattern
- Custom hooks for logic reuse
- Compound components
- Provider pattern for context

## 🔮 React 19 & Future

### Q36: What's new in React 19?
**Answer**:
- React Compiler for automatic memoization
- Server Components for server-side rendering
- Enhanced Suspense with streaming
- Improved concurrent features
- Better TypeScript integration

### Q37: How do React Server Components work?
**Answer**:
- Components run on server, send serialized output
- Reduce client bundle size
- Enable server-side data fetching
- Integrate with client components
- Stream updates to client

### Q38: What's React's compilation strategy?
**Answer**:
- React Compiler analyzes component code
- Automatically inserts memoization
- Optimizes component re-renders
- Reduces need for manual optimization
- Maintains React's programming model

### Q39: How does React handle streaming?
**Answer**:
- `renderToPipeableStream()` for Node.js
- `renderToReadableStream()` for Web Streams
- Progressive HTML delivery
- Selective hydration of components
- Better perceived performance

### Q40: What's React's approach to type safety?
**Answer**:
- TypeScript integration improvements
- Better inference for hooks
- Component prop type checking
- Generic components support
- Runtime type validation options

## 🧪 Testing & Debugging

### Q41: How do you test React components effectively?
**Answer**:
- React Testing Library for user-centric tests
- Jest for unit testing
- MSW for API mocking
- React DevTools for debugging
- Snapshot testing for regression prevention

### Q42: What debugging techniques work best for React?
**Answer**:
- React DevTools for component inspection
- Breakpoints in component code
- Console logging with component names
- Error boundaries for error tracking
- Performance profiling

### Q43: How do you handle async testing in React?
**Answer**:
```javascript
// Testing async components
test('loads data', async () => {
  render(<AsyncComponent />);
  expect(screen.getByText('Loading...')).toBeInTheDocument();
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### Q44: What's the best way to mock React hooks?
**Answer**:
- Jest's `jest.mock()` for module mocking
- Custom hook testing with `renderHook()`
- Mocking context providers
- Spying on hook implementations
- Testing hook behavior in isolation

### Q45: How do you test React performance?
**Answer**:
- React DevTools Profiler
- Lighthouse for web vitals
- Custom performance marks
- Bundle size monitoring
- Render count tracking

## 🎯 Scenario-Based Questions

### Q46: How would you debug a memory leak in React?
**Answer**:
1. Use Chrome DevTools Memory tab
2. Check for missing effect cleanup
3. Look for event listener leaks
4. Identify circular references
5. Use React DevTools to track components
6. Profile heap snapshots over time

### Q47: Your React app is slow. How do you optimize it?
**Answer**:
1. Profile with React DevTools
2. Identify unnecessary re-renders
3. Add memoization where needed
4. Implement code splitting
5. Optimize bundle size
6. Use concurrent features
7. Implement virtual scrolling for lists

### Q48: How would you implement a custom hook for data fetching?
**Answer**:
```javascript
function useApi(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [url]);
  
  return { data, loading, error };
}
```

### Q49: How do you handle race conditions in React?
**Answer**:
- Use cleanup functions in useEffect
- Implement request cancellation
- Use AbortController for fetch requests
- Track component mount status
- Debounce rapid requests

### Q50: Design a React architecture for a large application
**Answer**:
1. **Component Structure**: Atomic design principles
2. **State Management**: Context + useReducer or external library
3. **Routing**: React Router with code splitting
4. **Data Fetching**: Custom hooks with caching
5. **Performance**: Memoization and lazy loading
6. **Testing**: Comprehensive test coverage
7. **Build**: Optimized bundling and deployment

## 🎉 Bonus: Build Your Own React

### Q51: Implement a minimal React in 100 lines
**Answer**:
```javascript
// Mini React implementation
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

// Continue with render, reconciler, hooks...
```

## 🎯 Interview Success Tips

### 1. **Structure Your Answers**
- Start with high-level concept
- Provide specific implementation details
- Give concrete examples
- Mention edge cases and optimizations

### 2. **Show Deep Understanding**
- Reference actual React source code
- Explain trade-offs and design decisions
- Connect concepts to real-world scenarios
- Demonstrate debugging skills

### 3. **Practice Implementation**
- Build mini-React from scratch
- Implement common patterns
- Debug performance issues
- Write comprehensive tests

### 4. **Stay Current**
- Follow React team updates
- Understand new features
- Know migration strategies
- Be aware of ecosystem changes

**🎉 Master these questions and you'll ace any React interview!** 