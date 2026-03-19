import { describe, expect, it } from 'vitest';
import { slugify } from '../../src/lib/slugify';

describe('slugify', () => {
  it('converts a simple name to lowercase', () => {
    expect(slugify('Nova')).toBe('nova');
  });

  it('converts a name with quotes and spaces to a hyphenated slug', () => {
    expect(slugify('Silas "Penny-Pincher" Sterling')).toBe(
      'silas-penny-pincher-sterling',
    );
  });

  it('handles a single-word name', () => {
    expect(slugify('Viktor')).toBe('viktor');
  });

  it('returns empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });

  it('strips leading and trailing special characters', () => {
    expect(slugify('--Nova--')).toBe('nova');
  });

  it('collapses consecutive non-alphanumeric characters into one hyphen', () => {
    expect(slugify('The   Master   Web   Architect')).toBe(
      'the-master-web-architect',
    );
  });

  it('handles names with mixed separators', () => {
    expect(slugify('Agent — Code Review')).toBe('agent-code-review');
  });

  it('preserves numbers in names', () => {
    expect(slugify('Agent 47')).toBe('agent-47');
  });
});
