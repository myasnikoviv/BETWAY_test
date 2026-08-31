import { NextResponse } from 'next/server';
import { handleOptions } from '@/lib/api-response';
import { handleConvertRequest } from './handler';

/**
 * POST /api/v1/convert
 * Ingests an existing booking code, resolves its selections, creates a fresh booking code, and returns the ConvertResult.
 */
export async function POST(request: Request): Promise<NextResponse> {
  return handleConvertRequest(request);
}

/**
 * OPTIONS /api/v1/convert
 * CORS preflight handler.
 */
export async function OPTIONS(): Promise<NextResponse> {
  return handleOptions();
}
