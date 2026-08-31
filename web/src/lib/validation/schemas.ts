import { z } from 'zod';

/**
 * Regular expression validating Betway Nigeria booking code syntax (4–15 alphanumeric characters).
 */
export const BOOKING_CODE_REGEX = /^[A-Za-z0-9]{4,15}$/;

/**
 * Schema for resolving a booking code.
 */
export const resolveBookingCodeSchema = z.object({
  bookingCode: z
    .string()
    .trim()
    .min(1, 'bookingCode is required')
    .regex(
      BOOKING_CODE_REGEX,
      'Booking code must be between 4 and 15 alphanumeric characters'
    ),
});

export type ResolveBookingCodeSchema = z.infer<typeof resolveBookingCodeSchema>;
export const resolveSchema = resolveBookingCodeSchema;

/**
 * Schema for an individual bet selection when creating a booking code.
 */
export const betSelectionInputSchema = z.object({
  eventId: z.string().trim().min(1, 'eventId is required'),
  eventName: z.string().trim().optional(),
  marketId: z.string().trim().min(1, 'marketId is required'),
  marketName: z.string().trim().optional(),
  selectionId: z.string().trim().min(1, 'selectionId is required'),
  selectionName: z.string().trim().optional(),
  odds: z.number().positive('odds must be a positive number').optional(),
  sportId: z.string().trim().optional(),
  league: z.string().trim().optional(),
  region: z.string().trim().optional(),
  eventStartTime: z.number().optional(),
  isMarketActive: z.boolean().optional(),
});

export type BetSelectionInputSchema = z.infer<typeof betSelectionInputSchema>;

/**
 * Schema for creating a new booking code.
 */
export const createBookingCodeSchema = z.object({
  selections: z
    .array(betSelectionInputSchema)
    .min(1, 'At least one selection is required'),
  isSingleBet: z.boolean().optional(),
});

export type CreateBookingCodeSchema = z.infer<typeof createBookingCodeSchema>;
export const createSchema = createBookingCodeSchema;

/**
 * Schema for converting an existing booking code.
 * Accepts either `bookingCode` or `sourceBookingCode` (4–15 alphanumeric characters).
 */
export const convertBookingCodeSchema = z
  .object({
    bookingCode: z
      .string()
      .trim()
      .regex(
        BOOKING_CODE_REGEX,
        'bookingCode must be between 4 and 15 alphanumeric characters'
      )
      .optional(),
    sourceBookingCode: z
      .string()
      .trim()
      .regex(
        BOOKING_CODE_REGEX,
        'sourceBookingCode must be between 4 and 15 alphanumeric characters'
      )
      .optional(),
  })
  .refine(
    (data) => Boolean(data.bookingCode || data.sourceBookingCode),
    {
      message: 'Either bookingCode or sourceBookingCode must be provided',
      path: ['bookingCode'],
    }
  );

export type ConvertBookingCodeSchema = z.infer<typeof convertBookingCodeSchema>;
export const convertSchema = convertBookingCodeSchema;
