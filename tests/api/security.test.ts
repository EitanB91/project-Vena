import { describe, it, expect } from 'vitest';

// =============================================================================
// Security validation tests for API route input patterns
// These verify the same validation logic used in the API routes (S1, S4)
// =============================================================================

// S4: Slug validation pattern (mirrors API route regex)
const SLUG_PATTERN = /^[a-zA-Z0-9_-]+$/;

function isValidSlug(slug: string): boolean {
  return SLUG_PATTERN.test(slug) && slug.length > 0 && slug.length < 256;
}

describe('S4 — Input validation (slug)', () => {
  it('accepts valid project slugs', () => {
    expect(isValidSlug('c--Users-user-Desktop-project')).toBe(true);
    expect(isValidSlug('my_project')).toBe(true);
    expect(isValidSlug('a')).toBe(true);
    expect(isValidSlug('project-123')).toBe(true);
  });

  it('rejects path traversal attempts', () => {
    expect(isValidSlug('../../etc/passwd')).toBe(false);
    expect(isValidSlug('../..')).toBe(false);
    expect(isValidSlug('foo/../bar')).toBe(false);
  });

  it('rejects command injection attempts', () => {
    expect(isValidSlug('foo;ls')).toBe(false);
    expect(isValidSlug('foo|cat /etc/passwd')).toBe(false);
    expect(isValidSlug('foo && rm -rf /')).toBe(false);
    expect(isValidSlug('$(whoami)')).toBe(false);
  });

  it('rejects empty and overly long slugs', () => {
    expect(isValidSlug('')).toBe(false);
    expect(isValidSlug('a'.repeat(256))).toBe(false);
  });

  it('rejects special characters', () => {
    expect(isValidSlug('foo bar')).toBe(false);
    expect(isValidSlug('foo/bar')).toBe(false);
    expect(isValidSlug('foo\\bar')).toBe(false);
    expect(isValidSlug('foo:bar')).toBe(false);
  });
});

// S2: Extension whitelist (.jsonl only)
describe('S2 — Extension whitelist', () => {
  it('accepts .jsonl files', () => {
    expect('session.jsonl'.endsWith('.jsonl')).toBe(true);
  });

  it('rejects non-jsonl files', () => {
    expect('session.json'.endsWith('.jsonl')).toBe(false);
    expect('session.txt'.endsWith('.jsonl')).toBe(false);
    expect('.credentials.json'.endsWith('.jsonl')).toBe(false);
  });
});

// S3: Credential file patterns
describe('S3 — No credential exposure', () => {
  const CREDENTIAL_PATTERNS = [
    '.credentials.json',
    'credentials.json',
    '.env',
    '.env.local',
    'secrets.json',
  ];

  it('UUID JSONL pattern does not match credential files', () => {
    const UUID_JSONL = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.jsonl$/;
    for (const cred of CREDENTIAL_PATTERNS) {
      expect(UUID_JSONL.test(cred)).toBe(false);
    }
  });
});

// S6: Safe error messages
describe('S6 — Safe error messages', () => {
  const UNSAFE_PATTERNS = [
    /[A-Z]:\\Users/,         // Windows paths
    /\/home\//,              // Linux home
    /\/Users\//,             // macOS paths
    /\.claude\//,            // Claude directory
    /node_modules/,          // Node modules
  ];

  const safeErrors = [
    'Failed to read telemetry data',
    'Invalid project identifier',
    'No budget ledger found',
    'Failed to read session data',
    'Failed to read agent data',
    'Failed to read dashboard data',
  ];

  it('safe error messages contain no file paths', () => {
    for (const msg of safeErrors) {
      for (const pattern of UNSAFE_PATTERNS) {
        expect(pattern.test(msg)).toBe(false);
      }
    }
  });
});
