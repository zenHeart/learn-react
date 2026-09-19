// Teaching experiment: unsafe mode intentionally permits stale results.
export function createRequestRunner({ transport, onChange, protectLatest = true }) {
  let generation = 0
  let disposed = false
  let snapshot = { status: 'idle', requestId: null, data: null, error: null }
  const controllers = new Set()
  const publish = next => { if (!disposed) { snapshot = next; onChange(next) } }
  return {
    getSnapshot: () => snapshot,
    async start(request) {
      if (disposed) return
      const current = ++generation
      if (protectLatest) for (const controller of controllers) controller.abort()
      const controller = new AbortController()
      controllers.add(controller)
      publish({ status: 'loading', requestId: request.id, data: null, error: null })
      const canPublish = () => !disposed && (!protectLatest || current === generation && !controller.signal.aborted)
      try {
        const data = await transport(request, { signal: controller.signal })
        if (canPublish()) publish({ status: 'success', requestId: request.id, data, error: null })
      } catch (error) {
        if (canPublish()) publish({ status: 'error', requestId: request.id, data: null, error: error instanceof Error ? error.message : String(error) })
      } finally {
        controllers.delete(controller)
      }
    },
    dispose() {
      disposed = true
      generation++
      for (const controller of controllers) controller.abort()
      controllers.clear()
    },
  }
}

export function createDemoTransport({ cancelable = true, onEvent = () => {}, timers = globalThis } = {}) {
  let disposed = false
  const pending = new Set()
  const emit = (kind, id) => { if (!disposed) onEvent({ kind, id }) }
  return {
    request(spec, { signal }) {
      return new Promise((resolve, reject) => {
        if (disposed) { reject(new Error('Transport disposed')); return }
        let settled = false
        let timer
        const finish = (kind, value) => {
          if (settled) return
          settled = true
          timers.clearTimeout(timer)
          signal.removeEventListener('abort', abort)
          pending.delete(abort)
          emit(kind, spec.id)
          if (kind === 'completed') resolve(value)
          else reject(value)
        }
        const abort = () => finish('cancelled', new DOMException('Request cancelled', 'AbortError'))
        emit('started', spec.id)
        pending.add(abort)
        if (cancelable && signal.aborted) { abort(); return }
        if (cancelable) signal.addEventListener('abort', abort, { once: true })
        timer = timers.setTimeout(() => spec.fail
          ? finish('failed', new Error('模拟请求失败'))
          : finish('completed', { id: spec.id, message: `请求 ${spec.id} 的结果` }), spec.delay)
      })
    },
    dispose() {
      disposed = true
      for (const abort of [...pending]) abort()
    },
  }
}
