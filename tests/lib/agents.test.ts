import { describe, it, expect } from 'vitest';
import { readAgentIdentity, readAgentMemory } from '@/lib/agents';
import path from 'node:path';

const CLAUDE_DIR = path.resolve('c:/Users/user/Desktop/Ai/Claude/project-Vena/.claude');

describe('readAgentIdentity', () => {
  it('parses Nova identity file', () => {
    const identity = readAgentIdentity(
      path.join(CLAUDE_DIR, 'design-team', 'nova-identity.md'),
    );

    expect(identity).not.toBeNull();
    expect(identity!.name).toBe('Nova');
    expect(identity!.role).toBe('Visual Design Lead');
    expect(identity!.sections).toHaveProperty('Role');
    expect(identity!.projects.length).toBeGreaterThan(0);
  });

  it('parses Viktor identity file', () => {
    const identity = readAgentIdentity(
      path.join(CLAUDE_DIR, 'qa-team', 'viktor-identity.md'),
    );

    expect(identity).not.toBeNull();
    expect(identity!.name).toBe('Viktor');
    expect(identity!.role).toBe('QA Team Lead');
  });

  it('parses Silas identity with compound name', () => {
    const identity = readAgentIdentity(
      path.join(CLAUDE_DIR, 'vault-and-valve', 'silas-identity.md'),
    );

    expect(identity).not.toBeNull();
    expect(identity!.name).toContain('Silas');
    expect(identity!.role).toBe('Budget & Resource Lead');
  });

  it('extracts key phrases from personality sections', () => {
    const identity = readAgentIdentity(
      path.join(CLAUDE_DIR, 'qa-team', 'viktor-identity.md'),
    );

    expect(identity).not.toBeNull();
    expect(identity!.keyPhrases.length).toBeGreaterThan(0);
  });

  it('returns null for non-existent file', () => {
    const identity = readAgentIdentity('/nonexistent/path.md');
    expect(identity).toBeNull();
  });
});

describe('readAgentMemory', () => {
  it('parses Nova memory file', () => {
    const memory = readAgentMemory(
      path.join(CLAUDE_DIR, 'design-team', 'nova-memory.md'),
    );

    expect(memory).not.toBeNull();
    expect(memory!.agentName).toBe('Nova');
    expect(memory!.sections).toHaveProperty('Design Token System (approved Phase 0)');
    expect(memory!.lastModified).toBeInstanceOf(Date);
  });

  it('returns null for non-existent file', () => {
    const memory = readAgentMemory('/nonexistent/path.md');
    expect(memory).toBeNull();
  });
});
