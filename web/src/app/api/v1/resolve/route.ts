import { NextResponse } from 'next/server';
import { handleOptions } from '@/lib/api-response';
import { handleResolveRequest } from './handler';

/**
 * POST /api/v1/resolve
 * Ingests a booking code and resolves the complete bet slip domain model.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleResolveRequest(request);
}

/**
 * OPTIONS /api/v1/resolve
 * CORS preflight handler.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return handleOptions();
}
