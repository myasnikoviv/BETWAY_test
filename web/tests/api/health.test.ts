import { describe, expect, it } from 'vitest';
import { GET, OPTIONS } from '@/app/api/v1/health/route';

describe('GET /api/v1/health', () => {
  it('returns 200 healthy status with service metadata and CORS headers', async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('healthy');
    expect(json.data.service).toBe('betway-booking-code-api');
    expect(json.data.version).toBe('1.0.0');
    expect(typeof json.data.timestamp).toBe('string');
    expect(!isNaN(Date.parse(json.data.timestamp))).toBe(true);
  });

  it('handles OPTIONS preflight with 204 and CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toContain('GET');
  });
});
