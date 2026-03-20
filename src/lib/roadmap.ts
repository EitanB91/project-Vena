// =============================================================================
// Roadmap Parser — Parse markdown with <!-- vena:* --> markers
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import type {
  FeatureEntry,
  PhaseStatus,
  Roadmap,
  RoadmapPhase,
  RoadmapTask,
} from '@/types';

/**
 * Read and parse a roadmap markdown file.
 */
export function readRoadmap(filePath: string): Roadmap | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return parseRoadmap(raw);
  } catch {
    return null;
  }
}

/**
 * Parse roadmap markdown content into a structured Roadmap object.
 */
export function parseRoadmap(content: string): Roadmap {
  const lines = content.split('\n');

  const title = extractTitle(lines);
  const vision = extractVision(lines);
  const phases = extractPhases(content);
  const featureRegistry = extractFeatureRegistry(lines);

  return { title, vision, phases, featureRegistry };
}

// ---------------------------------------------------------------------------
// Internal extractors
// ---------------------------------------------------------------------------

/**
 * Extract the document title (first # heading).
 */
function extractTitle(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)/);
    if (match) return match[1].trim();
  }
  return 'Untitled Roadmap';
}

/**
 * Extract the Vision section content.
 */
function extractVision(lines: string[]): string {
  let inVision = false;
  const visionLines: string[] = [];

  for (const line of lines) {
    if (line.match(/^##\s+Vision/)) {
      inVision = true;
      continue;
    }
    if (inVision && line.match(/^##\s/)) {
      break;
    }
    if (inVision) {
      visionLines.push(line);
    }
  }

  return visionLines.join('\n').trim();
}

/**
 * Extract all phases from vena:phase markers.
 *
 * Format:
 * <!-- vena:phase id="0" status="complete" -->
 * ### Phase 0 — Title
 * **Status:** Complete (date)
 * **Goal:** Goal text
 * - [x] Task 1
 * - [ ] Task 2
 * <!-- /vena:phase -->
 */
function extractPhases(content: string): RoadmapPhase[] {
  const phases: RoadmapPhase[] = [];

  // Match phase blocks between markers
  const phasePattern =
    /<!-- vena:phase\s+id="([^"]+)"\s+status="([^"]+)"\s*-->([\s\S]*?)<!-- \/vena:phase -->/g;

  let match;
  while ((match = phasePattern.exec(content)) !== null) {
    const id = match[1];
    const status = match[2] as PhaseStatus;
    const block = match[3];

    const lines = block.split('\n');
    const title = extractPhaseTitle(lines);
    const goal = extractPhaseGoal(lines);
    const completedDate = extractCompletedDate(lines);
    const tasks = extractTasks(lines);

    phases.push({ id, title, status, goal, completedDate, tasks });
  }

  return phases;
}

/**
 * Extract phase title from ### heading.
 */
function extractPhaseTitle(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^###\s+(.+)/);
    if (match) return match[1].trim();
  }
  return 'Untitled Phase';
}

/**
 * Extract goal from **Goal:** line.
 */
function extractPhaseGoal(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/\*\*Goal:\*\*\s*(.+)/);
    if (match) return match[1].trim();
  }
  return '';
}

/**
 * Extract completed date from **Status:** line.
 * Pattern: **Status:** Complete (2026-03-19)
 */
function extractCompletedDate(lines: string[]): string | null {
  for (const line of lines) {
    const match = line.match(/\*\*Status:\*\*\s*Complete\s*\(([^)]+)\)/i);
    if (match) return match[1].trim();
  }
  return null;
}

/**
 * Extract task list items from markdown checkbox lines.
 */
function extractTasks(lines: string[]): RoadmapTask[] {
  const tasks: RoadmapTask[] = [];

  for (const line of lines) {
    const match = line.match(/^-\s+\[([ xX])\]\s+(.+)/);
    if (match) {
      tasks.push({
        completed: match[1] !== ' ',
        text: match[2].trim(),
      });
    }
  }

  return tasks;
}

/**
 * Extract the Feature Registry table.
 */
function extractFeatureRegistry(lines: string[]): FeatureEntry[] {
  const entries: FeatureEntry[] = [];
  let inTable = false;
  let pastHeader = false;

  for (const line of lines) {
    if (line.match(/^##\s+Feature Registry/)) {
      inTable = true;
      continue;
    }

    if (inTable) {
      // End of table on next heading
      if (line.match(/^##\s/) && !line.match(/Feature Registry/)) {
        break;
      }

      if (!line.startsWith('|')) continue;

      // Skip separator row
      if (line.includes('---')) {
        pastHeader = true;
        continue;
      }

      // Skip header row
      if (!pastHeader) continue;

      const cells = line
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean);

      if (cells.length >= 4) {
        entries.push({
          feature: cells[0],
          phase: cells[1],
          priority: cells[2],
          status: cells[3],
        });
      }
    }
  }

  return entries;
}

/**
 * Find and parse the project roadmap file.
 * Looks for Roadmap-*.md files in a plans/ directory.
 */
export function readProjectRoadmap(projectPath: string): Roadmap | null {
  const plansDir = path.join(projectPath, 'plans');

  try {
    const files = fs.readdirSync(plansDir);
    const roadmapFile = files.find(
      (f) => f.startsWith('Roadmap') && f.endsWith('.md'),
    );

    if (!roadmapFile) return null;

    return readRoadmap(path.join(plansDir, roadmapFile));
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Plan Document Reader
// ---------------------------------------------------------------------------

/** Metadata for a plan document found in plans/ */
export interface PlanFile {
  name: string;
  title: string;
  lines: number;
}

/**
 * Read all markdown plan files from the plans/ directory.
 * Returns metadata for each file: filename, title (first # heading), and line count.
 */
export function readPlanFiles(projectPath: string): PlanFile[] {
  const plansDir = path.join(projectPath, 'plans');

  try {
    const files = fs.readdirSync(plansDir).filter((f) => f.endsWith('.md'));
    return files.map((name) => {
      const content = fs.readFileSync(path.join(plansDir, name), 'utf-8');
      const lines = content.split('\n');
      const titleLine = lines.find((l) => l.startsWith('# '));
      const title = titleLine ? titleLine.replace(/^#\s+/, '').trim() : name;
      return { name, title, lines: lines.length };
    });
  } catch {
    return [];
  }
}
