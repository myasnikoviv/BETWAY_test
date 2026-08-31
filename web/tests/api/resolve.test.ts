import { describe, expect, it } from 'vitest';
import { handleResolveRequest } from '@/app/api/v1/resolve/handler';
import { OPTIONS, POST } from '@/app/api/v1/resolve/route';
import type { BetwayRawFindResponse } from '@/core/gateway/BetwayTypes';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import resolveFixture from '../fixtures/resolve_response.json';

describe('POST /api/v1/resolve', () => {
  it('resolves a valid booking code with 200 OK and CORS headers', async () => {
    const gateway = new MockBetwayGateway({
      resolveFixture: resolveFixture as BetwayRawFindResponse,
    });

    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
    });

    const response = await handleResolveRequest(request, gateway);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.bookingCode).toBe('BW6D7ABCFB');
    expect(json.data.selections.length).toBe(2);
    expect(json.data.totalOdds).toBe(10.89);
  });

  it('returns 400 Bad Request on invalid booking code format', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'bad!' }),
    });

    const response = await handleResolveRequest(request, gateway);

    expect(response.status).toBe(400);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 Bad Request on missing booking code', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await handleResolveRequest(request, gateway);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 Bad Request on malformed JSON payload', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-non-json-body{',
    });

    const response = await handleResolveRequest(request, gateway);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 404 Not Found when booking code is not found on Betway', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'NOTFOUND' }),
    });

    const response = await handleResolveRequest(request, gateway);

    expect(response.status).toBe(404);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BOOKING_CODE_NOT_FOUND');
  });

  it('returns 502 Bad Gateway when upstream Betway service fails', async () => {
    const gateway = new MockBetwayGateway({
      shouldFailResolve: true,
    });

    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
    });

    const response = await handleResolveRequest(request, gateway);

    expect(response.status).toBe(502);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UPSTREAM_BETWAY_ERROR');
  });

  it('handles default POST export invocation without errors', async () => {
    const request = new Request('http://localhost/api/v1/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'invalid!' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('handles OPTIONS preflight with 204 and CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});
