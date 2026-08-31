import { describe, expect, it } from 'vitest';
import { handleConvertRequest } from '@/app/api/v1/convert/handler';
import { OPTIONS, POST } from '@/app/api/v1/convert/route';
import type { BetwayRawBookResponse, BetwayRawFindResponse } from '@/core/gateway/BetwayTypes';
import { MockBetwayGateway } from '@/core/gateway/MockBetwayGateway';
import createFixture from '../fixtures/create_response.json';
import resolveFixture from '../fixtures/resolve_response.json';

describe('POST /api/v1/convert', () => {
  it('converts a booking code using bookingCode parameter with 200 OK and CORS headers', async () => {
    const gateway = new MockBetwayGateway({
      resolveFixture: resolveFixture as BetwayRawFindResponse,
      createFixture: createFixture as BetwayRawBookResponse,
    });

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.sourceBookingCode).toBe('BW6D7ABCFB');
    expect(json.data.newBookingCode).toBe('BW6D7AC4BA');
    expect(json.data.slip.bookingCode).toBe('BW6D7AC4BA');
    expect(json.data.slip.selections.length).toBe(2);
    expect(json.data.slip.totalOdds).toBe(10.89);
    expect(typeof json.data.convertedAt).toBe('string');
  });

  it('converts a booking code using sourceBookingCode parameter with 200 OK', async () => {
    const gateway = new MockBetwayGateway({
      resolveFixture: resolveFixture as BetwayRawFindResponse,
      createFixture: createFixture as BetwayRawBookResponse,
    });

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceBookingCode: 'BW6D7ABCFB' }),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.sourceBookingCode).toBe('BW6D7ABCFB');
    expect(json.data.newBookingCode).toBe('BW6D7AC4BA');
  });

  it('returns 400 Bad Request on invalid booking code format', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'bad!' }),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(400);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 Bad Request on missing booking code', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 400 Bad Request on malformed JSON payload', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json{',
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('INVALID_INPUT');
  });

  it('returns 404 Not Found when source booking code does not exist', async () => {
    const gateway = new MockBetwayGateway();

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'NOTFOUND' }),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(404);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('BOOKING_CODE_NOT_FOUND');
  });

  it('returns 422 Unprocessable Entity when source slip contains inactive/stale selections', async () => {
    const staleFixture: BetwayRawFindResponse = {
      selections: [
        {
          eventId: 72221212,
          eventName: 'Arsenal vs Chelsea',
          marketId: '72221212546',
          marketName: 'Match Result',
          outcomeId: '722212125461718',
          outcomeName: 'Arsenal Win',
          priceDecimal: 1.95,
          isMarketActive: false, // Inactive market
        },
      ],
      isSingleBet: true,
    };

    const gateway = new MockBetwayGateway({
      resolveFixture: staleFixture,
    });

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(422);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('STALE_SELECTIONS');
  });

  it('returns 502 Bad Gateway when upstream Betway fails during conversion', async () => {
    const gateway = new MockBetwayGateway({
      shouldFailResolve: true,
    });

    const request = new Request('http://localhost/api/v1/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingCode: 'BW6D7ABCFB' }),
    });

    const response = await handleConvertRequest(request, gateway);

    expect(response.status).toBe(502);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('UPSTREAM_BETWAY_ERROR');
  });

  it('handles default POST export invocation without crash', async () => {
    const request = new Request('http://localhost/api/v1/convert', {
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
