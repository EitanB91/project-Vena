import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseRoadmap, readPlanFiles } from '@/lib/roadmap';

const SAMPLE_ROADMAP = `# Roadmap — Test Project

<!-- vena:roadmap -->

## Vision

A test project for unit testing the roadmap parser.

## Phases

<!-- vena:phase id="0" status="complete" -->
### Phase 0 — Kickoff
**Status:** Complete (2026-03-01)
**Goal:** Set everything up.

- [x] Init repo
- [x] Create scaffold
- [ ] Stretch goal
<!-- /vena:phase -->

<!-- vena:phase id="1" status="next" -->
### Phase 1 — Build Things
**Status:** Next
**Goal:** Build the core features.

- [ ] Feature A
- [ ] Feature B
- [x] Spike research
<!-- /vena:phase -->

<!-- vena:phase id="2" status="planned" -->
### Phase 2 — Polish
**Status:** Planned
**Goal:** Make it shine.

- [ ] Responsive design
<!-- /vena:phase -->

## Feature Registry

| Feature | Phase | Priority | Status |
|---------|-------|----------|--------|
| Scaffold | 0 | Critical | Complete |
| Core features | 1 | High | Planned |
| Polish | 2 | Medium | Planned |
`;

describe('parseRoadmap', () => {
  const roadmap = parseRoadmap(SAMPLE_ROADMAP);

  it('extracts the title', () => {
    expect(roadmap.title).toBe('Roadmap — Test Project');
  });

  it('extracts the vision', () => {
    expect(roadmap.vision).toBe(
      'A test project for unit testing the roadmap parser.',
    );
  });

  it('extracts all phases', () => {
    expect(roadmap.phases).toHaveLength(3);
  });

  it('parses phase id and status from markers', () => {
    expect(roadmap.phases[0].id).toBe('0');
    expect(roadmap.phases[0].status).toBe('complete');
    expect(roadmap.phases[1].id).toBe('1');
    expect(roadmap.phases[1].status).toBe('next');
    expect(roadmap.phases[2].id).toBe('2');
    expect(roadmap.phases[2].status).toBe('planned');
  });

  it('parses phase titles from ### headings', () => {
    expect(roadmap.phases[0].title).toBe('Phase 0 — Kickoff');
    expect(roadmap.phases[1].title).toBe('Phase 1 — Build Things');
  });

  it('parses phase goals', () => {
    expect(roadmap.phases[0].goal).toBe('Set everything up.');
    expect(roadmap.phases[2].goal).toBe('Make it shine.');
  });

  it('extracts completed date from Status line', () => {
    expect(roadmap.phases[0].completedDate).toBe('2026-03-01');
    expect(roadmap.phases[1].completedDate).toBeNull();
  });

  it('parses task checkboxes correctly', () => {
    const phase0Tasks = roadmap.phases[0].tasks;
    expect(phase0Tasks).toHaveLength(3);
    expect(phase0Tasks[0]).toEqual({ text: 'Init repo', completed: true });
    expect(phase0Tasks[1]).toEqual({ text: 'Create scaffold', completed: true });
    expect(phase0Tasks[2]).toEqual({ text: 'Stretch goal', completed: false });
  });

  it('extracts the feature registry', () => {
    expect(roadmap.featureRegistry).toHaveLength(3);
    expect(roadmap.featureRegistry[0]).toEqual({
      feature: 'Scaffold',
      phase: '0',
      priority: 'Critical',
      status: 'Complete',
    });
  });

  it('handles empty content gracefully', () => {
    const empty = parseRoadmap('');
    expect(empty.title).toBe('Untitled Roadmap');
    expect(empty.vision).toBe('');
    expect(empty.phases).toHaveLength(0);
    expect(empty.featureRegistry).toHaveLength(0);
  });
});

describe('readPlanFiles', () => {
  let tmpDir: string;

  beforeAll(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vena-plans-'));
    const plansDir = path.join(tmpDir, 'plans');
    fs.mkdirSync(plansDir);

    fs.writeFileSync(
      path.join(plansDir, 'Roadmap-Test.md'),
      '# Roadmap — Test Project\n\nSome content here.\nLine 3.\n',
    );
    fs.writeFileSync(
      path.join(plansDir, 'Plan-MVP.md'),
      '# Plan — MVP (v0.1.0)\n\nMVP details.\n',
    );
    fs.writeFileSync(
      path.join(plansDir, 'notes.txt'),
      'Not a markdown file',
    );
  });

  afterAll(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('reads all .md files from plans/ directory', () => {
    const files = readPlanFiles(tmpDir);
    expect(files).toHaveLength(2);
  });

  it('extracts title from first # heading', () => {
    const files = readPlanFiles(tmpDir);
    const mvp = files.find((f) => f.name === 'Plan-MVP.md');
    expect(mvp?.title).toBe('Plan — MVP (v0.1.0)');
  });

  it('extracts roadmap title correctly', () => {
    const files = readPlanFiles(tmpDir);
    const roadmap = files.find((f) => f.name === 'Roadmap-Test.md');
    expect(roadmap?.title).toBe('Roadmap — Test Project');
  });

  it('counts lines correctly', () => {
    const files = readPlanFiles(tmpDir);
    const roadmap = files.find((f) => f.name === 'Roadmap-Test.md');
    expect(roadmap?.lines).toBe(5);
  });

  it('filters out non-.md files', () => {
    const files = readPlanFiles(tmpDir);
    const names = files.map((f) => f.name);
    expect(names).not.toContain('notes.txt');
  });

  it('returns empty array for missing plans/ directory', () => {
    const files = readPlanFiles('/nonexistent/path');
    expect(files).toEqual([]);
  });

  it('falls back to filename when no # heading exists', () => {
    const noHeadingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vena-noh-'));
    const plansDir = path.join(noHeadingDir, 'plans');
    fs.mkdirSync(plansDir);
    fs.writeFileSync(path.join(plansDir, 'raw-notes.md'), 'No heading here\n');

    const files = readPlanFiles(noHeadingDir);
    expect(files[0].title).toBe('raw-notes.md');

    fs.rmSync(noHeadingDir, { recursive: true, force: true });
  });
});
