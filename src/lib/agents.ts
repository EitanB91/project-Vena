// =============================================================================
// Agent Reader — Parse identity and memory markdown files
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type {
  AgentIdentity,
  AgentMemory,
  AgentProfile,
  AgentProject,
} from '@/types';

/** Known agent color tokens (matches globals.css) */
const AGENT_COLORS: Record<string, string> = {
  orchestrator: 'vena-agent-orchestrator',
  claude: 'vena-agent-orchestrator',
  nova: 'vena-agent-nova',
  viktor: 'vena-agent-viktor',
  silas: 'vena-agent-silas',
};

/**
 * Read and parse an agent identity markdown file.
 */
export function readAgentIdentity(filePath: string): AgentIdentity | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return parseIdentity(raw, filePath);
  } catch {
    return null;
  }
}

/**
 * Read and parse an agent memory markdown file.
 */
export function readAgentMemory(filePath: string): AgentMemory | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const stat = fs.statSync(filePath);
    return parseMemory(raw, filePath, stat.mtime);
  } catch {
    return null;
  }
}

/**
 * Discover all agents in a .claude/ directory and return their profiles.
 */
export function readAllAgents(claudeDir: string): AgentProfile[] {
  const profiles: AgentProfile[] = [];

  try {
    const entries = fs.readdirSync(claudeDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const subPath = path.join(claudeDir, entry.name);
      const subEntries = fs.readdirSync(subPath);

      const identityFile = subEntries.find((f) => f.endsWith('-identity.md'));
      if (!identityFile) continue;

      const identity = readAgentIdentity(path.join(subPath, identityFile));
      if (!identity) continue;

      const memoryFile = subEntries.find((f) => f.endsWith('-memory.md'));
      const memory = memoryFile
        ? readAgentMemory(path.join(subPath, memoryFile))
        : null;

      const nameLower = identity.name.toLowerCase();
      const colorToken = AGENT_COLORS[nameLower] ?? 'vena-accent';

      profiles.push({ identity, memory, colorToken });
    }
  } catch {
    // Directory not readable
  }

  // Also check for root identity.md (the Orchestrator)
  const rootIdentity = path.join(claudeDir, 'identity.md');
  if (fs.existsSync(rootIdentity)) {
    const identity = readAgentIdentity(rootIdentity);
    if (identity) {
      profiles.unshift({
        identity,
        memory: null,
        colorToken: AGENT_COLORS['orchestrator'] ?? 'vena-accent',
      });
    }
  }

  return profiles;
}

// ---------------------------------------------------------------------------
// Internal parsers
// ---------------------------------------------------------------------------

function parseIdentity(raw: string, filePath: string): AgentIdentity {
  const lines = raw.split('\n');
  const { name, role } = parseTitle(lines[0] ?? '');
  const sections = parseSections(lines);
  const projects = parseProjectsTable(sections['Scope'] ?? sections['Scope — Active Projects'] ?? '');
  const keyPhraseSource = [
    sections['Personality'] ?? '',
    sections['Identity'] ?? '',
  ].join('\n');
  const keyPhrases = parseKeyPhrases(keyPhraseSource);

  return {
    name,
    role,
    filePath,
    rawContent: raw,
    sections,
    projects,
    keyPhrases,
  };
}

function parseMemory(
  raw: string,
  filePath: string,
  lastModified: Date,
): AgentMemory {
  const lines = raw.split('\n');
  const { name } = parseTitle(lines[0] ?? '');
  const sections = parseSections(lines);

  return {
    agentName: name,
    filePath,
    rawContent: raw,
    sections,
    lastModified,
  };
}

/**
 * Parse a title line like "# Nova — Visual Design Lead"
 * Returns { name, role }.
 */
function parseTitle(line: string): { name: string; role: string } {
  // Strip leading # marks and trim
  const cleaned = line.replace(/^#+\s*/, '').trim();

  // Try splitting on common separators: —, -, :
  const separators = [' — ', ' - ', ': '];
  for (const sep of separators) {
    const idx = cleaned.indexOf(sep);
    if (idx !== -1) {
      return {
        name: cleaned.slice(0, idx).trim(),
        role: cleaned.slice(idx + sep.length).trim(),
      };
    }
  }

  return { name: cleaned, role: '' };
}

/**
 * Parse markdown into heading → content sections.
 * Only captures ## level headings.
 */
function parseSections(lines: string[]): Record<string, string> {
  const sections: Record<string, string> = {};
  let currentHeading = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^##\s+(.+)/);
    if (headingMatch) {
      if (currentHeading) {
        sections[currentHeading] = currentContent.join('\n').trim();
      }
      currentHeading = headingMatch[1].trim();
      currentContent = [];
    } else if (currentHeading) {
      currentContent.push(line);
    }
  }

  if (currentHeading) {
    sections[currentHeading] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Parse a markdown table for project scope entries.
 * Expects rows like: | **Project Name** | Role description |
 */
function parseProjectsTable(content: string): AgentProject[] {
  const projects: AgentProject[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match table rows (skip header and separator)
    if (!line.startsWith('|') || line.includes('---')) continue;

    const cells = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);

    if (cells.length >= 2) {
      const name = cells[0].replace(/\*\*/g, '').replace(/\(.*?\)/g, '').trim();
      const role = cells[1].trim();
      // Skip header row
      if (name.toLowerCase() === 'project') continue;
      projects.push({ name, role });
    }
  }

  return projects;
}

/**
 * Extract key phrases (lines starting with - " or containing quoted text).
 */
function parseKeyPhrases(content: string): string[] {
  const phrases: string[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    // Match quoted phrases in two formats:
    //   *"Look at this curve..."*  (Nova-style, wrapped in asterisks)
    //   "Dis function..."          (Viktor-style, plain quotes)
    const quoteMatches = line.match(/\*"([^"]+)"\*|(?:^[-\s>]*)"([^"]+)"/g);
    if (quoteMatches) {
      for (const match of quoteMatches) {
        const cleaned = match.replace(/[*">-]/g, '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
        if (cleaned.length > 10) {
          phrases.push(cleaned);
        }
      }
    }
  }

  return phrases;
}
