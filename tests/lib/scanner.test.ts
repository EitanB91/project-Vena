import { describe, it, expect } from 'vitest';
import { scanProject } from '@/lib/scanner';
import path from 'node:path';

const PROJECT_ROOT = path.resolve('c:/Users/user/Desktop/Ai/Claude/project-Vena');

describe('scanProject', () => {
  it('discovers this project as a VenaProject', () => {
    const project = scanProject(PROJECT_ROOT);

    expect(project).not.toBeNull();
    expect(project!.name).toBe('project-Vena');
    expect(project!.hasClaudeMd).toBe(true);
    expect(project!.claudeDir).toContain('.claude');
  });

  it('discovers agent directories', () => {
    const project = scanProject(PROJECT_ROOT);

    expect(project).not.toBeNull();
    expect(project!.agentDirs.length).toBeGreaterThanOrEqual(3);

    const dirNames = project!.agentDirs.map((d) => path.basename(d));
    expect(dirNames).toContain('design-team');
    expect(dirNames).toContain('qa-team');
    expect(dirNames).toContain('vault-and-valve');
  });

  it('returns null for directory without .claude/', () => {
    const result = scanProject('/tmp/nonexistent-project');
    expect(result).toBeNull();
  });
});
