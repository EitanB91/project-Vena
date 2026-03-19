// =============================================================================
// Project Scanner — Discover .claude/ directories
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type { VenaProject } from '@/types';

/**
 * Scan a project directory and return its VenaProject descriptor.
 * Expects `projectPath` to be the root of a project containing `.claude/`.
 */
export function scanProject(projectPath: string): VenaProject | null {
  const claudeDir = path.join(projectPath, '.claude');

  if (!fs.existsSync(claudeDir) || !fs.statSync(claudeDir).isDirectory()) {
    return null;
  }

  const hasClaudeMd = fs.existsSync(path.join(projectPath, 'CLAUDE.md'));
  const agentDirs = discoverAgentDirs(claudeDir);

  return {
    path: projectPath,
    name: path.basename(projectPath),
    claudeDir,
    hasClaudeMd,
    agentDirs,
  };
}

/**
 * Discover agent directories within .claude/.
 * An agent directory is any subdirectory containing an *-identity.md file.
 */
function discoverAgentDirs(claudeDir: string): string[] {
  const dirs: string[] = [];

  try {
    const entries = fs.readdirSync(claudeDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const subPath = path.join(claudeDir, entry.name);
      const subEntries = fs.readdirSync(subPath);
      const hasIdentity = subEntries.some((f) => f.endsWith('-identity.md'));

      if (hasIdentity) {
        dirs.push(subPath);
      }
    }
  } catch {
    // If we can't read the directory, return empty
  }

  return dirs;
}

/**
 * Scan a list of project paths and return all valid VenaProjects.
 */
export function scanProjects(projectPaths: string[]): VenaProject[] {
  const projects: VenaProject[] = [];

  for (const p of projectPaths) {
    const project = scanProject(p);
    if (project) {
      projects.push(project);
    }
  }

  return projects;
}
