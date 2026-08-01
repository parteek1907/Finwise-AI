/**
 * Candle mocks — DELETED
 *
 * All candle/chart data now comes from Yahoo Finance via:
 *   Market Store → services/market.ts → /api/market/candles → Yahoo Finance Provider
 *
 * This file is kept as a stub to prevent import errors during cleanup.
 * It will be fully removed once all references are confirmed eliminated.
 */

import { Candle } from '../types/market';

// No mock candles — all data from Yahoo Finance
export const MOCK_CANDLES: Record<string, Candle[]> = {};
