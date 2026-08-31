import { NextResponse } from 'next/server';
import { BetwayHttpGateway } from '@/core/gateway/BetwayHttpGateway';
import type { IBetwayGateway } from '@/core/gateway/IBetwayGateway';
import { ConvertBookingCodeUseCase } from '@/core/use-cases/ConvertBookingCodeUseCase';
import { apiErrorResponse, apiSuccessResponse } from '@/lib/api-response';
import { convertBookingCodeSchema } from '@/lib/validation';

/**
 * Handles incoming convert booking code requests.
 * Accepts optional IBetwayGateway for deterministic testing and dependency injection.
 */
export async function handleConvertRequest(
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

    const validated = convertBookingCodeSchema.parse(body);
    const sourceCode = validated.sourceBookingCode ?? validated.bookingCode ?? '';

    const useCase = new ConvertBookingCodeUseCase(gateway);
    const result = await useCase.execute(sourceCode);

    return apiSuccessResponse(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
