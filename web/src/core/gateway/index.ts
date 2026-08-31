export type {
  BetwayOutcomePayload,
  BetwayRawBookResponse,
  BetwayRawFindResponse,
  BetwayRawSelection,
  BetwayRawMarket,
  BetwayRawOutcome,
  BetwayRawPrice,
  BetwayRawSportEvent,
  BetwayBookABetRequest,
  BetwayFindBookABetRequest,
} from './BetwayTypes';

export type { IBetwayGateway } from './IBetwayGateway';

export {
  BetwayHttpGateway,
  DEFAULT_PRIMARY_BASE_URL,
  DEFAULT_FALLBACK_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  DEFAULT_HEADERS,
  type BetwayHttpGatewayOptions,
} from './BetwayHttpGateway';

export {
  MockBetwayGateway,
  type MockBetwayGatewayOptions,
} from './MockBetwayGateway';

export {
  normalizeBetwaySelection,
  normalizeBetwayFindResponse,
  mapSelectionsToBetwayOutcomes,
} from './normalization';
