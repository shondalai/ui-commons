import {createParser} from 'eventsource-parser';

/** Progress is deliberately separate from the final, domain-validated result. */
export interface AiStreamProgress {
  request_id?: string | null;
  received_bytes?: number;
  operation_id?: string;
}

export interface AiStreamOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
  onProgress?: (progress: AiStreamProgress) => void;
  timeoutMs?: number;
  idleTimeoutMs?: number;
  /** Reuse for an intentional retry of the same operation after checking status. */
  requestId?: string;
}

/** Identifiers survive timeout/disconnect so support can reconcile a paid call. */
export class AiStreamError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number,
    public readonly requestId?: string,
    public readonly operationId?: string,
  ) {
    super(message);
    this.name = 'AiStreamError';
  }
}

/**
 * POST a Joomla feature operation over SSE. Unlike EventSource this supports
 * JSON and CSRF headers. No automatic reconnect/retry can duplicate paid work.
 * Resolve only the final feature result, never provisional model JSON.
 */
export async function postAiStream<T>(url: string, body: unknown, options: AiStreamOptions = {}): Promise<T> {
  const endpoint = new URL(url, window.location.href);
  if (endpoint.origin !== window.location.origin) {
    throw new AiStreamError('AI requests must use the current site.', 'invalid_origin', 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AiStreamError('The AI request body must be an object.', 'invalid_request', 400);
  }

  const operationId = options.requestId ?? crypto.randomUUID();
  if (!/^[A-Za-z0-9_.:-]{8,100}$/.test(operationId)) {
    throw new AiStreamError('The AI operation identifier is invalid.', 'invalid_request', 400);
  }
  let requestId: string | undefined;
  let expired: 'idle_timeout' | 'deadline_exceeded' | undefined;
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeoutMs = Math.max(1000, Math.min(options.timeoutMs ?? 180000, 300000));
  const idleMs = Math.max(1000, Math.min(options.idleTimeoutMs ?? 65000, timeoutMs));
  const totalTimer = setTimeout(() => { expired = 'deadline_exceeded'; controller.abort(); }, timeoutMs);
  let idleTimer: ReturnType<typeof setTimeout>;
  const resetIdle = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { expired = 'idle_timeout'; controller.abort(); }, idleMs);
  };
  options.signal?.addEventListener('abort', abort, {once: true});
  if (options.signal?.aborted) controller.abort();
  resetIdle();

  const error = (message: string, code = 'stream_incomplete', status = 502) =>
    new AiStreamError(message, code, status, requestId, operationId);
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

  try {
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');
    headers.set('Accept', 'text/event-stream');
    headers.set('X-AI-Request-ID', operationId);
    const response = await fetch(endpoint.href, {
      method: 'POST', credentials: 'same-origin', redirect: 'error', headers,
      body: JSON.stringify({...body, stream: true}), signal: controller.signal,
    });

    if (!response.ok || !response.headers.get('content-type')?.includes('text/event-stream')) {
      let payload: Record<string, unknown> = {};
      if (response.headers.get('content-type')?.includes('application/json')) {
        payload = await response.json() as Record<string, unknown>;
      }
      const message = typeof payload.message === 'string' ? payload.message : 'The AI service could not start a streaming response.';
      throw error(message, typeof payload.error_code === 'string' ? payload.error_code : 'stream_unavailable', response.status >= 400 ? response.status : 502);
    }
    if (!response.body) throw error('The AI response has no stream.');

    reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8', {fatal: true});
    let complete = false;
    let ended = false;
    let result: T | undefined;
    let failure: AiStreamError | undefined;
    let received = 0;
    const parser = createParser({
      maxBufferSize: 8 * 1024 * 1024,
      onError() { failure = error('The AI response stream is malformed.'); },
      onEvent(event) {
        if (ended) { failure = error('The AI response continued after its terminal event.'); return; }
        if (event.event === 'end' && event.data === '[DONE]') { ended = true; return; }
        let data: Record<string, unknown>;
        try {
          const parsed: unknown = JSON.parse(event.data);
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
          data = parsed as Record<string, unknown>;
        } catch {
          failure = error('The AI response contains an invalid event.');
          return;
        }
        if (typeof data.request_id === 'string') requestId = data.request_id;
        if (event.event === 'open' || event.event === 'progress') {
          options.onProgress?.({
            request_id: requestId, operation_id: operationId,
            received_bytes: typeof data.received_bytes === 'number' ? data.received_bytes : undefined,
          });
        } else if (event.event === 'done') {
          if (complete || !Object.prototype.hasOwnProperty.call(data, 'result')) {
            failure = error('The AI stream has an invalid completion.');
            return;
          }
          complete = true;
          result = data.result as T;
        } else if (event.event === 'error') {
          failure = error(
            typeof data.message === 'string' ? data.message : 'The AI operation failed.',
            typeof data.code === 'string' ? data.code : 'ai_failed',
            typeof data.status === 'number' ? data.status : 422,
          );
        }
      },
    });

    while (!ended) {
      const chunk = await reader.read();
      if (chunk.done) break;
      resetIdle();
      received += chunk.value.byteLength;
      if (received > 16 * 1024 * 1024) throw error('The AI response exceeded its size limit.');
      parser.feed(decoder.decode(chunk.value, {stream: true}));
      if (failure) throw failure;
    }
    if (failure) throw failure;
    if (!complete || !ended) throw error('The AI stream was interrupted. Check the request status before retrying.');
    return result as T;
  } catch (cause) {
    if (cause instanceof AiStreamError) throw cause;
    if (controller.signal.aborted) {
      throw error(
        expired ? 'The AI request timed out. Check its status before retrying.' : 'The AI request was interrupted.',
        expired ?? 'cancelled', expired ? 504 : 499,
      );
    }
    throw error('The connection to the AI service was interrupted. Check its status before retrying.');
  } finally {
    clearTimeout(totalTimer);
    clearTimeout(idleTimer!);
    options.signal?.removeEventListener('abort', abort);
    await reader?.cancel().catch(() => undefined);
    reader?.releaseLock();
  }
}
