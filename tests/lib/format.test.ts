import { describe, it, expect } from 'vitest';
import {
  formatTokens,
  formatDuration,
  formatRelativeTime,
  formatDate,
  formatDateShort,
} from '@/lib/format';

// =============================================================================
// formatTokens
// =============================================================================

describe('formatTokens', () => {
  it('returns "0" for zero', () => {
    expect(formatTokens(0)).toBe('0');
  });

  it('returns small numbers as-is', () => {
    expect(formatTokens(42)).toBe('42');
    expect(formatTokens(999)).toBe('999');
  });

  it('formats thousands as K', () => {
    expect(formatTokens(1_000)).toBe('1K');
    expect(formatTokens(1_500)).toBe('1.5K');
    expect(formatTokens(48_700)).toBe('48.7K');
    expect(formatTokens(999_999)).toBe('1000K');
  });

  it('formats millions as M', () => {
    expect(formatTokens(1_000_000)).toBe('1M');
    expect(formatTokens(238_027_794)).toBe('238M');
    expect(formatTokens(2_500_000)).toBe('2.5M');
  });

  it('formats billions as B', () => {
    expect(formatTokens(1_000_000_000)).toBe('1B');
    expect(formatTokens(1_200_000_000)).toBe('1.2B');
  });

  it('handles edge cases', () => {
    expect(formatTokens(-1)).toBe('0');
    expect(formatTokens(NaN)).toBe('0');
    expect(formatTokens(Infinity)).toBe('0');
  });
});

// =============================================================================
// formatDuration
// =============================================================================

describe('formatDuration', () => {
  it('returns "< 1m" for sub-minute', () => {
    expect(formatDuration(0.3)).toBe('< 1m');
    expect(formatDuration(0.9)).toBe('< 1m');
  });

  it('returns minutes for < 60', () => {
    expect(formatDuration(1)).toBe('1m');
    expect(formatDuration(23)).toBe('23m');
    expect(formatDuration(59.4)).toBe('59m');
  });

  it('returns hours and minutes for < 24h', () => {
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(91)).toBe('1h 31m');
    expect(formatDuration(271)).toBe('4h 31m');
  });

  it('returns days and hours for >= 24h', () => {
    expect(formatDuration(1440)).toBe('1d');
    expect(formatDuration(1500)).toBe('1d 1h');
    expect(formatDuration(2880)).toBe('2d');
  });

  it('handles edge cases', () => {
    expect(formatDuration(0)).toBe('< 1m');
    expect(formatDuration(-5)).toBe('0m');
    expect(formatDuration(NaN)).toBe('0m');
  });
});

// =============================================================================
// formatRelativeTime
// =============================================================================

describe('formatRelativeTime', () => {
  const BASE = new Date('2026-03-22T12:00:00Z').getTime();

  it('returns "just now" for < 10 seconds', () => {
    expect(formatRelativeTime(new Date(BASE - 5_000), BASE)).toBe('just now');
    expect(formatRelativeTime(new Date(BASE), BASE)).toBe('just now');
  });

  it('returns seconds for < 60s', () => {
    expect(formatRelativeTime(new Date(BASE - 30_000), BASE)).toBe('30s ago');
    expect(formatRelativeTime(new Date(BASE - 45_000), BASE)).toBe('45s ago');
  });

  it('returns minutes for < 60m', () => {
    expect(formatRelativeTime(new Date(BASE - 5 * 60_000), BASE)).toBe('5m ago');
    expect(formatRelativeTime(new Date(BASE - 59 * 60_000), BASE)).toBe('59m ago');
  });

  it('returns hours for < 24h', () => {
    expect(formatRelativeTime(new Date(BASE - 2 * 3_600_000), BASE)).toBe('2h ago');
  });

  it('returns days for >= 24h', () => {
    expect(formatRelativeTime(new Date(BASE - 3 * 86_400_000), BASE)).toBe('3d ago');
  });

  it('returns "just now" for future dates', () => {
    expect(formatRelativeTime(new Date(BASE + 60_000), BASE)).toBe('just now');
  });
});

// =============================================================================
// formatDate
// =============================================================================

describe('formatDate', () => {
  it('formats Date as DD-MM-YYYY', () => {
    expect(formatDate(new Date('2026-03-22T12:00:00Z'))).toBe('22-03-2026');
  });

  it('formats ISO string as DD-MM-YYYY', () => {
    expect(formatDate('2026-01-05T00:00:00Z')).toBe('05-01-2026');
  });

  it('handles invalid date', () => {
    expect(formatDate('not-a-date')).toBe('Invalid date');
  });
});

// =============================================================================
// formatDateShort
// =============================================================================

describe('formatDateShort', () => {
  it('formats Date as DD-MM', () => {
    expect(formatDateShort(new Date('2026-03-22T12:00:00Z'))).toBe('22-03');
  });

  it('formats ISO string as DD-MM', () => {
    expect(formatDateShort('2026-01-05T00:00:00Z')).toBe('05-01');
  });

  it('handles invalid date', () => {
    expect(formatDateShort('not-a-date')).toBe('--');
  });
});
