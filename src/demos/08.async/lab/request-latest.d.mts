export type RequestSpec = { id: number; delay: number; fail?: boolean }
export type Result = { id: number; message: string }
export type Snapshot = { status: 'idle' | 'loading' | 'success' | 'error'; requestId: number | null; data: Result | null; error: string | null }
export type TransportEvent = { kind: 'started' | 'completed' | 'failed' | 'cancelled'; id: number }
export function createRequestRunner(options: { transport: (request: RequestSpec, context: { signal: AbortSignal }) => Promise<Result>; onChange: (snapshot: Snapshot) => void; protectLatest?: boolean }): { start(request: RequestSpec): Promise<void>; dispose(): void; getSnapshot(): Snapshot }
export function createDemoTransport(options?: { cancelable?: boolean; onEvent?: (event: TransportEvent) => void }): { request(request: RequestSpec, context: { signal: AbortSignal }): Promise<Result>; dispose(): void }
