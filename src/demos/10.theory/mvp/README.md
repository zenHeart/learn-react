# 整体流程预览

## key concept

- how to render
  - **Trigger**
    - initial state
    - side effect update state ,change state,props,context
  - **Render** find dom change and
    - initial render, after call createRoot
  - **Commit** apply change to real dom
    - appendChild()
    - update dom

1. class
   1. this.setState
   2. this.forceUpdata
2. function
   1. useState
   2. useReducer
3. other
   1. ReactDOM.render() like this.forceUpdate

## 核心流程

### createElement

创建 react element 实例函数

#### 入参

- type 元素类型
- props 元素属性
- children 子元素
  > 实际上支持传递多个 children , 例如 createElement(type, props, children1, children2, ...)

#### 出参

Element 对象核心结构为

```js
{
  $$typeof: REACT_ELEMENT_TYPE, // 内部属性帮助 react 识别为 React Element
  type: type, // 传入的类型
  key: key, // 如果 config.key 存在则为 config.key,否则为 null
  ref: ref, // 如果 config.ref 存在则为 config.ref,否则为 null
  props: props, // 铺平 config 后的 props

  _owner: owner, // 内部属性只读，{ current: null | Fiber },Record the component responsible for creating this element.

  _store: {}, // dev 可用，// The validation flag is currently mutative. We put it on， an external backing store so that we can freeze the whole object.This can be replaced with a WeakMap once they are implemented in commonly used development environments.
  _self: self, // 如果 config.__self 存在为 config.__self,否则为 null， 内部属性只读，只在 dev 模式可用，A *temporary* helper to detect places where `this` is different from the `owner` when React.createElement is called, so that we，can warn. We want to get rid of owner and replace string `ref`s with arrow， functions, and as long as `this` and owner are the same, there will be no，change in behavior.
  _source: source, // 果 config.__self 存在为 config.__self,否则为 null，内部属性只读，只在 dev 模式可用，An annotation object (added by a transpiler or otherwise)，indicating filename, line number, and/or other information.
}
```

#### 核心流程

1. 校验 type 是否合法
2. 校验 props 类型，如果类型传入了 propTypes 属性
3. 处理 arguments 传入一个 children 和多个 children 的场景，支持迭代器

#### 流程细节

1. 调用 [createElementWithValidation](https://github.com/facebook/react/blob/v18.3.1/packages/react/src/ReactElementValidator.js#L432)
   1. [isValidElementType](https://github.com/facebook/react/blob/v18.3.1/packages/shared/isValidElementType.js#L48) 检查是否为合法的 React 元素, 支持的元素类型包括
      1. 字符串(html 标签)
      2. 函数(react Element)
      3. REACT_FRAGMENT_TYPE
      4. REACT_SUSPENSE_TYPE
      5. REACT_SUSPENSE_LIST_TYPE
      6. REACT_SCOPE_TYPE 需要同时使能
      7. REACT_OFFSCREEN_TYPE 需要同时使能 enableScopeAPI？
      8. REACT_CACHE_TYPE 需要同时使能 enableCacheElement？
      9. REACT_TRACING_MARKER_TYPE 需要同时使能 enableTransitionTracing
      10. REACT_LEGACY_HIDDEN_TYPE 需要同时使能 enableLegacyHidden
      11. REACT_PROFILER_TYPE, 不懂 ？
      12. REACT_DEBUG_TRACING_MODE_TYPE，不懂，需要同时使能 enableDebugTracing？
      13. REACT_STRICT_MODE_TYPE 严格模式类型？
      14. 非空对象， 检查 type.$$typeof 方法
          1. REACT_LAZY_TYPE
          2. REACT_MEMO_TYPE
          3. REACT_PROVIDER_TYPE
          4. REACT_CONTEXT_TYPE
          5. REACT_FORWARD_REF_TYPE
          6. REACT_MODULE_REFERENCE
          7. 或者 type.getModuleId 非空
      15. 其他返回 false
2. 对于非法的 Element 类型做如下处理
   1. 为空判断是否是忘记导入的对象
   2. 为数组提示对应错误
   3. 如果是 dev 模式提示 type 类型非法
3. 合法的 Element 类型，调用 [createElement](https://github.com/facebook/react/blob/v18.3.1/packages/react/src/ReactElement.js#L362)

   1. 初始化 key,ref,self,source,props 属性
   2. 将 config 配置铺平，浅拷贝到 props
   3. 从引用为 2 arguments 开始，保存 children createElement(type,config,children1, children2,...) 的方式调用多个子元素将值赋给 props.children
   4. 如果 type 是对象且包含 type.defaultProps，赋值到 props
   5. 返回 [ReactElement](https://github.com/facebook/react/blob/v18.3.1/packages/react/src/ReactElement.js#L148)，

4. 如果 type 类型合法，遍历传入的 children.校验每个 children 是否合法 [validateChildKeys](https://github.com/facebook/react/blob/v18.3.1/packages/react/src/ReactElementValidator.js#L168)
   1. 如果 node 非对象直接返回
   2. 如果 node 是数组
      1. 判断每个元素是不是合法的 ReactElement, 通过 `object.$$typeof === REACT_ELEMENT_TYPE` 判断
      2. 如果是数组检查每个元素是否包含 key 的配置， 没有抛出提示
      3. 非数组校验 Element， 校验成功且存在 node.\_store, 的标记 node.\_store.validated 为 true
      4. 判断节点是否为迭代器，如果是迭代器，循环迭代器校验
5. 如果元素类型是 REACT_FRAGMENT_TYPE， 校验 fragment 的 props ,[validateFragmentProps](https://github.com/facebook/react/blob/v18.3.1/packages/react/src/ReactElementValidator.js#L257)
6. 非 REACT_FRAGMENT_TYPE，校验 Element 的 props [validatePropTypes](https://github.com/facebook/react/blob/v18.3.1/packages/react/src/ReactElementValidator.js#L209), 用于处理 type 上挂载了 propTypes 的对象

### createRoot

核心对象 FiberRootNode

```js
function FiberRootNode(
  containerInfo,
  tag,
  hydrate,
  identifierPrefix,
  onRecoverableError
) {
  this.tag = tag; // 标识 root 节点类型 ，0 是历史版本， 1 是并发版本
  this.containerInfo = containerInfo; // 容器节点 dom 元素引用
  this.pendingChildren = null; // 待处理的子元素，默认为 null
  this.current = null; // 当前 FiberRootNode 对应的 FiberNode
  this.pingCache = null; // ?
  this.finishedWork = null; // ?
  this.timeoutHandle = noTimeout; //
  this.context = null; // 上下文
  this.pendingContext = null; // 挂起的上下文
  this.callbackNode = null; // ?
  this.callbackPriority = NoLane; //
  this.eventTimes = createLaneMap(NoLanes);
  this.expirationTimes = createLaneMap(NoTimestamp);

  this.pendingLanes = NoLanes;
  this.suspendedLanes = NoLanes;
  this.pingedLanes = NoLanes;
  this.expiredLanes = NoLanes;
  this.mutableReadLanes = NoLanes;
  this.finishedLanes = NoLanes;

  this.entangledLanes = NoLanes;
  this.entanglements = createLaneMap(NoLanes);

  this.hiddenUpdates = createLaneMap(null);

  this.identifierPrefix = identifierPrefix;
  this.onRecoverableError = onRecoverableError;

  if (enableCache) {
    this.pooledCache = null;
    this.pooledCacheLanes = NoLanes;
  }

  if (supportsHydration) {
    this.mutableSourceEagerHydrationData = null;
  }

  if (enableSuspenseCallback) {
    this.hydrationCallbacks = null;
  }

  if (enableTransitionTracing) {
    this.transitionCallbacks = null;
    const transitionLanesMap = (this.transitionLanes = []);
    for (let i = 0; i < TotalLanes; i++) {
      transitionLanesMap.push(null);
    }
  }

  if (enableProfilerTimer && enableProfilerCommitHooks) {
    this.effectDuration = 0;
    this.passiveEffectDuration = 0;
  }

  if (enableUpdaterTracking) {
    this.memoizedUpdaters = new Set();
    const pendingUpdatersLaneMap = (this.pendingUpdatersLaneMap = []);
    for (let i = 0; i < TotalLanes; i++) {
      pendingUpdatersLaneMap.push(new Set());
    }
  }

  if (__DEV__) {
    switch (tag) {
      case ConcurrentRoot:
        this._debugRootType = hydrate ? "hydrateRoot()" : "createRoot()";
        break;
      case LegacyRoot:
        this._debugRootType = hydrate ? "hydrate()" : "render()";
        break;
    }
  }
}
```

**FiberNode**

```js
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // Instance
  this.tag = tag; // fiber node 标识，取值 0-25
  this.key = key; // fiber node key
  this.elementType = null; // 元素类型
  this.type = null; // 元素类型
  this.stateNode = null; // ？

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;

  // Effects
  this.flags = NoFlags;
  this.subtreeFlags = NoFlags;
  this.deletions = null;

  this.lanes = NoLanes;
  this.childLanes = NoLanes;

  this.alternate = null;

  if (enableProfilerTimer) {
    // Note: The following is done to avoid a v8 performance cliff.
    //
    // Initializing the fields below to smis and later updating them with
    // double values will cause Fibers to end up having separate shapes.
    // This behavior/bug has something to do with Object.preventExtension().
    // Fortunately this only impacts DEV builds.
    // Unfortunately it makes React unusably slow for some applications.
    // To work around this, initialize the fields below with doubles.
    //
    // Learn more about this here:
    // https://github.com/facebook/react/issues/14365
    // https://bugs.chromium.org/p/v8/issues/detail?id=8538
    this.actualDuration = Number.NaN;
    this.actualStartTime = Number.NaN;
    this.selfBaseDuration = Number.NaN;
    this.treeBaseDuration = Number.NaN;

    // It's okay to replace the initial doubles with smis after initialization.
    // This won't trigger the performance cliff mentioned above,
    // and it simplifies other profiler code (including DevTools).
    this.actualDuration = 0;
    this.actualStartTime = -1;
    this.selfBaseDuration = 0;
    this.treeBaseDuration = 0;
  }

  if (__DEV__) {
    // This isn't directly used but is handy for debugging internals:

    this._debugSource = null;
    this._debugOwner = null;
    this._debugNeedsRemount = false;
    this._debugHookTypes = null;
    if (!hasBadMapPolyfill && typeof Object.preventExtensions === "function") {
      Object.preventExtensions(this);
    }
  }
}
```

**UpdateQueue**

```js
export function cloneUpdateQueue<State>(
  current: Fiber,
  workInProgress: Fiber
): void {
  // Clone the update queue from current. Unless it's already a clone.
  const queue: UpdateQueue<State> = (workInProgress.updateQueue: any);
  const currentQueue: UpdateQueue<State> = (current.updateQueue: any);
  if (queue === currentQueue) {
    const clone: UpdateQueue<State> = {
      baseState: currentQueue.baseState,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
      effects: currentQueue.effects,
    };
    workInProgress.updateQueue = clone;
  }
}
```

**ReactDOMRoot**

```js
this._internalRoot = FiberRootNode;
// 原型链上挂载了
// render，unmount 方法
```

**入参**

- container dom node
- options

**出参**

#### 核心流程

1. 初始化创建 FiberRootNode 节点，并初始化 FiberNode 节点和 updateQueue
2. 返回一个对象属性 \_internalRoot 指向 FiberRootNode 实例

#### 流程细节

1. [createContainer](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberReconciler.new.js#L247)
   1. 创建 [createFiberRoot](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberRoot.new.js#L134)
      1. 初始化 [FiberRootNode](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberRoot.new.js#L52) 对象, 返回 FiberRootNode 示例
      2. 初始化 uninitializedFiber， [createHostRootFiber](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiber.new.js#L428)
         1. 返回 [FiberNode](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiber.new.js#L118)
         2. 初始化 FiberNode 的 [UpdateQueue](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberClassUpdateQueue.new.js#L184)
2. 返回一个 [ReactDOMRoot](https://github.com/facebook/react/blob/v18.3.1/packages/react-dom/src/ReactDOMRoot.new.js#L88) 对象，


注意一下有两类 Fiber, 为什么需要强制区分为两类？

* FiberRootNode 代表整个应用的根节点
* FiberNode 代表应用中的一个节点


### [ReactDOMRoot.render](https://github.com/facebook/react/blob/v18.3.1/packages/react-dom/src/client/ReactDOMRoot.js#L92)

挂载 react element 函数到 dom 节点上

update 属性

```js
export function createUpdate(eventTime: number, lane: Lane): Update<*> {
  const update: Update<*> = {
    eventTime,
    lane,

    tag: UpdateState,
    payload: null, // 待更新的元素
    callback: null,

    next: null,
  };
  return update;
}
```

#### 入参

- children ReactNodeList，包括 React$Element，ReactPortal，ReactText，ReactFragment，ReactProvider<any>，ReactConsumer<any>;

#### 出参

无返回值

#### 核心流程

1. 传入需要渲染的 element 元素和 FiberRootNode 作为 container
1. 判断是否使用新的 enableNewReconciler， 默认为 false
   1. old [updateContainer]((https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberReconciler.old.js#L321)
      1. 初始化如下值
         1. currentTime 为当前时间
         2. eventTime
         3. lane // lane 的含义待确认
      2. 获取上下文信息 [getContextForSubtree](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberReconciler.old.js#L141)
      3. 创建更新对象 [createUpdate](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberClassUpdateQueue.old.js#L202)
      4. 如果定了 callback ,在 update 上追加 callback 操作
      5. [enqueueUpdate](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberClassUpdateQueue.old.js#L216) 推入更新队列
         1. [isUnsafeClassRenderPhaseUpdate](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L674) 判断是否为不安全的类更新，
         2. 如果是不安全你的类更新，调用[markUpdateLaneFromFiberToRoot](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberConcurrentUpdates.old.js#L140)
         3. 安全的更新调用 [enqueueConcurrentClassUpdate](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberConcurrentUpdates.old.js#L112)
      6. 如果 root 非空，调用 [scheduleUpdateOnFiber](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberWorkLoop.old.js#L528)
         1.
      7. 如果 root 非空，调用 [entangleTransitions](https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberClassUpdateQueue.old.js#L267)
   2. new [updateContainer]((https://github.com/facebook/react/blob/v18.3.1/packages/react-reconciler/src/ReactFiberReconciler.new.js#L321)

#### 流程细节

## 参考资料

- [react render behavior](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/)
- [ ] [Inside Fiber](https://indepth.dev/inside-fiber-in-depth-overview-of-the-new-reconciliation-algorithm-in-react)

# reconciliation

## 参考资料

- [ ] [比对](https://blog.isquaredsoftware.com/2020/05/blogged-answers-a-mostly-complete-guide-to-react-rendering-behavior/#further-information)

## question

- [ ] 什么是不安全的类更新
- [ ] markUpdateLaneFromFiberToRoot 含义待确认
