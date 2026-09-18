import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {AiStreamError, postAiStream} from '../../services/ai-stream';

const frame = (event: string, data: unknown) => `event: ${event}\r\ndata: ${JSON.stringify(data)}\r\n\r\n`;
const end = 'event: end\ndata: [DONE]\n\n';
const operationId = 'test-operation-0001';

function streamResponse(text: string, fragmented = false): Response {
  const bytes = new TextEncoder().encode(text);
  return new Response(new ReadableStream<Uint8Array>({
    start(controller) {
      if (fragmented) {
        for (const byte of bytes) controller.enqueue(new Uint8Array([byte]));
      } else controller.enqueue(bytes);
      controller.close();
    },
  }), {headers: {'Content-Type': 'text/event-stream'}});
}

describe('AI streaming feature adapter', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()));
  afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

  it('handles fragmented UTF-8 and CRLF, preserves CSRF and returns only final result', async () => {
    const progress = vi.fn();
    vi.mocked(fetch).mockResolvedValue(streamResponse(
      ': heartbeat\r\n\r\n' + frame('open', {operation_id: operationId})
      + frame('progress', {request_id: 'invoke-123', received_bytes: 20})
      + frame('done', {result: {text: '日本語'}}) + end, true,
    ));
    await expect(postAiStream('/index.php', {task: 'ai.generate'}, {
      headers: {'X-CSRF-Token': 'csrf-fixture'}, requestId: operationId, onProgress: progress,
    })).resolves.toEqual({text: '日本語'});
    const init = vi.mocked(fetch).mock.calls[0][1]!;
    expect(new Headers(init.headers).get('X-CSRF-Token')).toBe('csrf-fixture');
    expect(new Headers(init.headers).get('X-AI-Request-ID')).toBe(operationId);
    expect(init.credentials).toBe('same-origin');
    expect(JSON.parse(init.body as string).stream).toBe(true);
    expect(progress).toHaveBeenCalledWith(expect.objectContaining({request_id: 'invoke-123', received_bytes: 20}));
  });

  it.each([
    frame('progress', {received_bytes: 1}) + end,
    frame('done', {result: {ok: true}}),
    'event: done\ndata: {broken}\n\n' + end,
    frame('done', {result: {ok: true}}) + frame('done', {result: {ok: false}}) + end,
  ])('rejects incomplete/malformed terminal sequences without retrying', async (body) => {
    vi.mocked(fetch).mockResolvedValue(streamResponse(frame('open', {request_id: 'invoke-started'}) + body));
    await expect(postAiStream('/index.php', {}, {requestId: operationId})).rejects.toMatchObject({
      code: 'stream_incomplete', requestId: 'invoke-started', operationId,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('keeps final validation errors and correlation IDs', async () => {
    vi.mocked(fetch).mockResolvedValue(streamResponse(frame('error', {
      message: 'Invalid output', code: 'ai_invalid_output', status: 422, request_id: 'invoke-invalid',
    }) + end));
    await expect(postAiStream('/index.php', {}, {requestId: operationId})).rejects.toMatchObject({
      message: 'Invalid output', code: 'ai_invalid_output', status: 422, requestId: 'invoke-invalid',
    });
  });

  it('handles a pre-stream JSON permission refusal', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({message: 'Permission denied'}), {
      status: 403, headers: {'Content-Type': 'application/json'},
    }));
    await expect(postAiStream('/index.php', {}, {requestId: operationId})).rejects.toMatchObject({status: 403, message: 'Permission denied'});
  });

  it('aborts a silent first response with an explicit idle deadline', async () => {
    vi.useFakeTimers();
    vi.mocked(fetch).mockImplementation((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
    }));
    const request = postAiStream('/index.php', {}, {requestId: operationId, idleTimeoutMs: 1000});
    const assertion = expect(request).rejects.toMatchObject({code: 'idle_timeout', status: 504, operationId});
    await vi.advanceTimersByTimeAsync(1001);
    await assertion;
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not send site credentials to another origin', async () => {
    await expect(postAiStream('https://outside.example/ai', {}, {requestId: operationId})).rejects.toBeInstanceOf(AiStreamError);
    expect(fetch).not.toHaveBeenCalled();
  });
});
