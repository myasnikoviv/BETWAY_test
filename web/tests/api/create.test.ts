import { describe, expect, it } from 'vitest';
import { handleCreateRequest } from '@/app/api/v1/create/handler';
import { OPTIONS, POST } from '@/app/api/v1/create/route';
import type { BetwayRawBookResponse } from '@/core/gateway/BetwayTypes';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import createFixture from '../fixtures/create_response.json';

describe('POST /api/v1/create', () => {
  it('creates a new booking code with 200 OK and CORS headers', async () => {
    const gateway = new MockBetwayGateway({
      createFixture: createFixture as BetwayRawBookResponse,
    });

    const request = new Request('http://localhost/api/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selections: [
          {
            eventId: '72221212',
            marketId: '72221212546',
            selectionId: '722212125461718',
          },
        ],
        isSingleBet: true,
      }),
    });

    const response = await handleCreateRequest(request, gateway);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.bookingCode).toBe('BW6D7AC4BA');
  });

  it('returns 400 Bad Request on empty selections array', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selections: [],
      }),
    });

    const response = await handleCreateRequest(request, gateway);

    expect(response.status).toBe(400);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 Bad Request on missing selectionId in selections', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selections: [
          {
            eventId: '72221212',
            marketId: '72221212546',
          },
        ],
      }),
    });

    const response = await handleCreateRequest(request, gateway);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 Bad Request on malformed JSON payload', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-non-json{',
    });

    const response = await handleCreateRequest(request, gateway);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 502 Bad Gateway when upstream Betway creation fails', async () => {
    const gateway = new MockBetwayGateway({
      shouldFailCreate: true,
    });

    const request = new Request('http://localhost/api/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selections: [
          {
            eventId: '72221212',
            marketId: '72221212546',
            selectionId: '722212125461718',
          },
        ],
      }),
    });

    const response = await handleCreateRequest(request, gateway);

    expect(response.status).toBe(502);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UPSTREAM_BETWAY_ERROR');
  });

  it('handles default POST export invocation without crash', async () => {
    const request = new Request('http://localhost/api/v1/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selections: [] }),
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
