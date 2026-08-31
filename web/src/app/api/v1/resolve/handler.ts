import { NextResponse } from 'next/server';
import { BetwayHttpGateway } from '@/core/gateway/BetwayHttpGateway';
import type { IBetwayGateway } from '@/core/gateway/IBetwayGateway';
import { ResolveBookingCodeUseCase } from '@/core/use-cases/ResolveBookingCodeUseCase';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-response';
import { resolveBookingCodeSchema } from '@/lib/validation';

/**
 * Handles incoming resolve requests.
 * Accepts optional IBetwayGateway for deterministic testing and dependency injection.
 */
export async function handleResolveRequest(
  request: Request,
  gateway: IBetwayGateway = new BetwayHttpGateway()
): Promise<NextResponse> {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiErrorResponse(new SyntaxError('Malformed JSON in request body.'), 400);
    }

    const validated = resolveBookingCodeSchema.parse(body);
    const useCase = new ResolveBookingCodeUseCase(gateway);
    const result = await useCase.execute(validated.bookingCode);

    return apiSuccessResponse(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
