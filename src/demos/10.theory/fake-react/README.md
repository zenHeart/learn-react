# 核心对象

1. **scheduler** 调度器实现在每帧内执行，避免同步渲染的阻塞问题
2. **reconciler** 完成 Fiber 树的构建和更新
3. Fiber 对象，包含如下功能，详细属性如下
   -  引用 Element 树结构
   -  作为渲染的基本单位
   -  作为调度的基本单位
   -  RootFiber 为 UI 树

```js
export type Fiber = {
   tag: WorkTag, // 标识 Fiber 的类型，例如函数组件、类组件、宿主组件等。
   key: null | string, // 唯一标识子节点的键值，用于在调和过程中保持子节点的稳定性。
   elementType: any, // 元素的类型，用于在调和过程中保持组件的身份。
   type: any, // 解析后的函数/类/对象，表示与该 Fiber 关联的组件。
   stateNode: any, // 与该 Fiber 关联的本地状态节点，例如 DOM 节点或类组件实例。
   return: Fiber | null, // 指向父 Fiber 节点。
   child: Fiber | null, // 指向第一个子 Fiber 节点。
   sibling: Fiber | null, // 指向下一个兄弟 Fiber 节点。
   index: number, // 子节点的索引。
   ref:
      | null
      | (((handle: mixed) => void) & { _stringRef: ?string, ... })
      | RefObject, // 引用，用于访问 DOM 节点或组件实例。
   refCleanup: null | (() => void), // 清理引用的函数。
   pendingProps: any, // 当前渲染周期的输入属性。
   memoizedProps: any, // 上一次渲染周期的输入属性。该属性会包含 Element 属性的传入内容，内部的 children 会包含 Element 的子节点信息
   updateQueue: mixed, // 状态更新队列。
   memoizedState: any, // 上一次渲染周期的状态。
   dependencies: Dependencies | null, // 依赖项（上下文、事件等）。
   mode: TypeOfMode, // 描述 Fiber 及其子树的属性的位字段。
   flags: Flags, // 描述 Fiber 及其子树的副作用的位字段。
   subtreeFlags: Flags, // 子树的副作用位字段。
   deletions: Array<Fiber> | null, // 要删除的 Fiber 节点数组。
   lanes: Lanes, // 当前 Fiber 的优先级。
   childLanes: Lanes, // 子树的优先级。
   alternate: Fiber | null, // 备用 Fiber，用于双缓冲机制。
   actualDuration?: number, // 当前更新中渲染该 Fiber 及其子树所花费的时间。
   actualStartTime?: number, // 当前更新中开始渲染该 Fiber 的时间。
   selfBaseDuration?: number, // 最近一次渲染该 Fiber 所花费的时间。
   treeBaseDuration?: number, // 子树的基础时间总和。
   _debugInfo?: ReactDebugInfo | null, // 调试信息。
   _debugOwner?: ReactComponentInfo | Fiber | null, // 调试所有者。
   _debugStack?: string | Error | null, // 调试堆栈。
   _debugTask?: ConsoleTask | null, // 调试任务。
   _debugIsCurrentlyTiming?: boolean, // 是否正在计时。
   _debugNeedsRemount?: boolean, // 是否需要重新挂载。
   _debugHookTypes?: Array<HookType> | null, // 用于验证钩子顺序的类型数组。
};
```

## 核心代码断点

1. 一些工具函数来处理状态逻辑

```js
const TagMap = {
   0: "FunctionComponent",
   1: "ClassComponent",
   3: "HostRoot", // Root of a host tree. Could be nested inside another node.
   4: "HostPortal", // A subtree. Could be an entry point to a different renderer.
   5: "HostComponent",
   6: "HostText",
   7: "Fragment",
   8: "Mode",
   9: "ContextConsumer",
   10: "ContextProvider",
   11: "ForwardRef",
   12: "Profiler",
   13: "SuspenseComponent",
   14: "MemoComponent",
   15: "SimpleMemoComponent",
   16: "LazyComponent",
   17: "IncompleteClassComponent",
   18: "DehydratedFragment",
   19: "SuspenseListComponent",
   21: "ScopeComponent",
   22: "OffscreenComponent",
   23: "LegacyHiddenComponent",
   24: "CacheComponent",
   25: "TracingMarkerComponent",
   26: "HostHoistable",
   27: "HostSingleton",
   28: "IncompleteFunctionComponent",
   29: "Throw",
};

const ModeMap = {
   0b0000000: "NoMode",
   0b0000001: "ConcurrentMode",
   0b0000010: "ProfileMode",
   0b0000100: "DebugTracingMode",
   0b0001000: "StrictLegacyMode",
   0b0010000: "StrictEffectsMode",
   0b1000000: "NoStrictPassiveEffectsMode",
};
let getModeAsString = (modes) => {
   if (modes === 0) return "NoMode";

   const setModes = [];
   for (const [binStr, modeName] of Object.entries(ModeMap)) {
      const binNum = +binStr;
      if (modes & binNum) {
         setModes.push(modeName);
      }
   }

   return setModes.join(",");
};

const FLAGS = {
   "0b0000000000000000000000000000": "NoFlags",
   "0b0000000000000000000000000001": "PerformedWork",
   "0b0000000000000000000000000010": "Placement",
   "0b0000000000000000000010000000": "DidCapture",
   "0b0000000000000001000000000000": "Hydrating",
   "0b0000000000000000000000000100": "Update",
   "0b0000000000000000000000001000": "Cloned",
   "0b0000000000000000000000010000": "ChildDeletion",
   "0b0000000000000000000000100000": "ContentReset",
   "0b0000000000000000000001000000": "Callback",
   "0b0000000000000000000100000000": "ForceClientRender",
   "0b0000000000000000001000000000": "Ref",
   "0b0000000000000000010000000000": "Snapshot",
   "0b0000000000000000100000000000": "Passive",
   "0b0000000000000010000000000000": "Visibility",
   "0b0000000000000100000000000000": "StoreConsistency",
   "0b0000000000000111111111111111": "HostEffectMask",
   "0b0000000000001000000000000000": "Incomplete",
   "0b0000000000010000000000000000": "ShouldCapture",
   "0b0000000000100000000000000000": "ForceUpdateForLegacySuspense",
   "0b0000000001000000000000000000": "DidPropagateContext",
   "0b0000000010000000000000000000": "NeedsPropagation",
   "0b0000000100000000000000000000": "Forked",
   "0b0000001000000000000000000000": "RefStatic",
   "0b0000010000000000000000000000": "LayoutStatic",
   "0b0000100000000000000000000000": "PassiveStatic",
   "0b0001000000000000000000000000": "MaySuspendCommit",
   "0b0010000000000000000000000000": "PlacementDEV",
   "0b0100000000000000000000000000": "MountLayoutDev",
   "0b1000000000000000000000000000": "MountPassiveDev",
};
let getFlagsAsString = (flags) => {
   if (flags === 0) return "NoFlags";
   const setFlags = [];

   for (const [binStr, flagName] of Object.entries(FLAGS)) {
      const binNum = +binStr;
      if (flags & binNum) {
         setFlags.push(flagName);
      }
   }

   return setFlags.join(",");
};

const LANES = {
   0b0000000000000000000000000000000: "NoLane",
   0b0000000000000000000000000000001: "SyncHydrationLane",
   0b0000000000000000000000000000010: "SyncLane",
   0b0000000000000000000000000000100: "InputContinuousHydrationLane",
   0b0000000000000000000000000001000: "InputContinuousLane",
   0b0000000000000000000000000010000: "DefaultHydrationLane",
   0b0000000000000000000000000100000: "DefaultLane",
   0b0000000000000000000000001000000: "TransitionHydrationLane",
   0b0000000001111111111111110000000: "TransitionLanes",
   0b0000000000000000000000010000000: "TransitionLane1",
   0b0000000000000000000000100000000: "TransitionLane2",
   0b0000000000000000000001000000000: "TransitionLane3",
   0b0000000000000000000010000000000: "TransitionLane4",
   0b0000000000000000000100000000000: "TransitionLane5",
   0b0000000000000000001000000000000: "TransitionLane6",
   0b0000000000000000010000000000000: "TransitionLane7",
   0b0000000000000000100000000000000: "TransitionLane8",
   0b0000000000000001000000000000000: "TransitionLane9",
   0b0000000000000010000000000000000: "TransitionLane10",
   0b0000000000000100000000000000000: "TransitionLane11",
   0b0000000000001000000000000000000: "TransitionLane12",
   0b0000000000010000000000000000000: "TransitionLane13",
   0b0000000000100000000000000000000: "TransitionLane14",
   0b0000000001000000000000000000000: "TransitionLane15",
   0b0000011110000000000000000000000: "RetryLanes",
   0b0000000010000000000000000000000: "RetryLane1",
   0b0000000100000000000000000000000: "RetryLane2",
   0b0000001000000000000000000000000: "RetryLane3",
   0b0000010000000000000000000000000: "RetryLane4",
   0b0000100000000000000000000000000: "SelectiveHydrationLane",
   0b0000111111111111111111111111111: "NonIdleLanes",
   0b0001000000000000000000000000000: "IdleHydrationLane",
   0b0010000000000000000000000000000: "IdleLane",
   0b0100000000000000000000000000000: "OffscreenLane",
   0b1000000000000000000000000000000: "DeferredLane",
};

let getLanesAsString = (lanes) => {
   if (lanes === 0) return "NoLane";
   const setLanes = [];

   for (const [binStr, lanesName] of Object.entries(LANES)) {
      const binNum = +binStr;
      if (lanes & binNum) {
         setLanes.push(lanesName);
      }
   }

   return setLanes.join(",");
};

const propertyMapConvert = {
   mode: (val) => `${val}: ${getModeAsString(val)}`,
   flags: (val) => `${val}: ${getFlagsAsString(val)}`,
   subtreeFlags: (val) => `${val}: ${getFlagsAsString(val)}`,
   lanes: (val) => `${val}: ${getLanesAsString(val)}`,
   childLanes: (val) => `${val}: ${getLanesAsString(val)}`,
   other: (value) => value,
};
let convertPropertyValue = (key, value) => {
   const convert = propertyMapConvert[key] || propertyMapConvert.other;
   return convert(value);
};
```

1. **ReactElement** 末尾追加 `console.log("ReactElement %O", type);` 查看 ReactElement 的内容
2. **FiberNode** 追踪 FiberNode 创建和属性变更的过程, 返回节点是添加如下代码

```js
// 追加 id 标识 fiber
let id = 1;
function FiberNode(tag, pendingProps, key, mode) {
   this._id = id++;
   this.tag = tag;
   this.key = key;
   this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
         null;
   this.index = 0;
   this.refCleanup = this.ref = null;
   this.pendingProps = pendingProps;
   this.dependencies =
      this.memoizedState =
      this.updateQueue =
      this.memoizedProps =
         null;
   this.mode = mode;
   this.subtreeFlags = this.flags = 0;
   this.deletions = null;
   this.childLanes = this.lanes = 0;
   this.alternate = null;
   this.actualDuration = -0;
   this.actualStartTime = -1.1;
   this.treeBaseDuration = this.selfBaseDuration = -0;
   this._debugOwner = this._debugInfo = null;
   this._debugNeedsRemount = !1;
   this._debugHookTypes = null;
   this._mode = getModeAsString(mode); // 调试使用
   hasBadMapPolyfill ||
      "function" !== typeof Object.preventExtensions ||
      Object.preventExtensions(this);
   console.log(`FiberNode${this._id} create ${TagMap[this.tag]}`, this);
   debugger;
   // 使用 Proxy 监听所有 set 操作
   return new Proxy(this, {
      set(target, property, value) {
         // if (property.includes('lags') && getFlagsAsString(value).includes('Update')) {
         //   debugger
         // }
         console.log(
            `FiberNode${target._id} update ${
               TagMap[target.tag]
            } property: %s, value: %O`,
            property,
            convertPropertyValue(property, value)
         );
         target[property] = value;
         return true;
      },
   });
}
```

3. **workInProgress** 重写局部变量，追踪 workInProgress 的推入过程

```js
window._workInProgress = null;
Object.defineProperty(window, "workInProgress", {
   get() {
      return window._workInProgress;
   },

   set(val) {
      console.log(
         `push workInProgress${val?._id} set ${TagMap[val?.tag]} %O`,
         val
      );
      window._workInProgress = val;
   },
});
```

4. **performUnitOfWork** 开始执行任务时，追踪 workInProgress 的推入过程

```js
if (unitOfWork) {
   console.group(
      `performUnitOfWork${unitOfWork?._id} ${TagMap[unitOfWork?.tag]}`
   );
}
```

5. **completeUnitOfWork** 完成任务时，追踪 workInProgress 的推出过程

```js
if (unitOfWork) {
   console.groupEnd(
      `performUnitOfWork${unitOfWork?._id} ${TagMap[unitOfWork?.tag]}`
   );
}
```

6. **beginWork** 开始任务

```js
console.group(`beginWork${workInProgress?._id} ${TagMap[workInProgress?.tag]}`);
```

7. **completeWork** 完成任务， 在 runWithFiberInDEV

```js
function runWithFiberInDEV(fiber, callback, arg0, arg1, arg2, arg3, arg4) {
   var previousFiber = current;
   ReactSharedInternals.getCurrentStack =
      null === fiber ? null : getCurrentFiberStackInDev;
   isRendering = !1;
   current = fiber;
   try {
      return callback(arg0, arg1, arg2, arg3, arg4);
   } finally {
      current = previousFiber;
      if (!arg1?.tag) {
         debugger;
      }
      console.groupEnd(`beginWork${arg1?._id} ${TagMap[arg1?.tag]}`);
   }
   throw Error(
      "runWithFiberInDEV should never be called in production. This is a bug in React."
   );
}
```

8. **commitMutationEffectsOnFiber** 提交任务

```js
// 开始打此点位
console.group(
   `commitMutationEffectsOnFiber${finishedWork?._id} ${
      TagMap[finishedWork?.tag]
   }`
);
// 执行完毕打上
console.groupEnd(
   `commitMutationEffectsOnFiber${finishedWork?._id} ${
      TagMap[finishedWork?.tag]
   }`
);
```

9. 在 container 上打点追踪 dom 更新。
10. Function Component 没有 StateNode 是如何关联的？
