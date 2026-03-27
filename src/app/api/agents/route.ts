import path from "node:path";
import { NextResponse } from "next/server";
import { readAllAgents } from "@/lib/agents";
import { getProjectSlug, getProjectTelemetry } from "@/lib/telemetry";
import { enhanceAgentProfiles } from "@/lib/agent-status";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/agents
 *
 * Returns all agent profiles for the current project,
 * with telemetry-enhanced status detection.
 * Security: S5 server-only, S6 safe errors.
 */
export async function GET() {
  try {
    const projectPath = process.cwd();
    const claudeDir = path.join(projectPath, ".claude");
    const rawProfiles = readAllAgents(claudeDir);

    // Enhance with telemetry activity
    const slug = getProjectSlug(projectPath);
    const telemetry = await getProjectTelemetry(slug);
    const mostRecentSession = telemetry.sessions[0] ?? null;

    const profiles = enhanceAgentProfiles(rawProfiles, {
      activeSessionCount: telemetry.activeSessionCount,
      mostRecentSessionEnd: mostRecentSession?.endTime ?? null,
    });

    // Strip file paths from response (S6)
    const serialized = profiles.map((p) => ({
      name: p.identity.name,
      role: p.identity.role,
      sections: p.identity.sections,
      projects: p.identity.projects,
      keyPhrases: p.identity.keyPhrases,
      colorToken: p.colorToken,
      status: p.status,
      lastSeen: p.lastSeen,
      memory: p.memory
        ? {
            agentName: p.memory.agentName,
            sections: p.memory.sections,
            lastModified: p.memory.lastModified.toISOString(),
          }
        : null,
    }));

    return NextResponse.json({ agents: serialized }, { headers: HEADERS });
  } catch {
    // S6: No file paths in error responses
    return NextResponse.json(
      { error: "Failed to read agent data" },
      { status: 500, headers: HEADERS },
    );
  }
}
