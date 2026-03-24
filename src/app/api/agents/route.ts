import path from "node:path";
import { NextResponse } from "next/server";
import { readAllAgents } from "@/lib/agents";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/agents
 *
 * Returns all agent profiles for the current project.
 * Security: S5 server-only, S6 safe errors.
 */
export async function GET() {
  try {
    const claudeDir = path.join(process.cwd(), ".claude");
    const profiles = readAllAgents(claudeDir);

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
