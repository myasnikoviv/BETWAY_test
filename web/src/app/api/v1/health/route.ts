import { NextResponse } from 'next/server';
import { apiSuccessResponse, handleOptions } from '@/lib/api-response';

export interface HealthCheckData {
  status: 'healthy';
  service: string;
  version: string;
  timestamp: string;
}

/**
 * GET /api/v1/health
 * Health check endpoint for uptime and service monitoring.
 */
export async function GET(): Promise<NextResponse> {
  const data: HealthCheckData = {
    status: 'healthy',
    service: 'betway-booking-code-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  };

  return apiSuccessResponse(data);
}

/**
 * OPTIONS /api/v1/health
 * CORS preflight handler.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return handleOptions();
}
