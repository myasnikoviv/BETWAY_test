import { NextResponse } from 'next/server';
import { handleOptions } from '@/lib/api-response';
import { handleCreateRequest } from './handler';

/**
 * POST /api/v1/create
 * Generates a new Betway booking code from structured selections.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleCreateRequest(request);
}

/**
 * OPTIONS /api/v1/create
 * CORS preflight handler.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return handleOptions();
}
