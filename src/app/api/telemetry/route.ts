import { NextRequest, NextResponse } from "next/server";
import path from "node:path";
import { getProjectSlug, getProjectTelemetry } from "@/lib/telemetry";
import { syncTelemetryToVV } from "@/lib/vv-sync";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/telemetry
 *
 * Returns aggregated telemetry for the current project.
 * Security: S1 path confinement, S4 input validation, S5 server-only, S6 safe errors.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slugParam = searchParams.get("project");

    // S4: Validate slug if provided
    if (slugParam !== null && !/^[a-zA-Z0-9_-]+$/.test(slugParam)) {
      return NextResponse.json(
        { error: "Invalid project identifier" },
        { status: 400, headers: HEADERS },
      );
    }

    const slug = slugParam ?? getProjectSlug(process.cwd());
    const telemetry = await getProjectTelemetry(slug);

    // F9: Lazily sync ended sessions to V&V usage log
    try {
      const claudeDir = path.join(process.cwd(), '.claude');
      syncTelemetryToVV(claudeDir, telemetry.sessions);
    } catch {
      // Sync is best-effort — don't block telemetry response
    }

    // Serialize dates for JSON transport
    const serialized = {
      projectSlug: telemetry.projectSlug,
      activeSessionCount: telemetry.activeSessionCount,
      totals: telemetry.totals,
      dailyUsage: telemetry.dailyUsage,
      sessions: telemetry.sessions.map((s) => ({
        sessionId: s.sessionId,
        title: s.title,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        durationMinutes: s.durationMinutes,
        model: s.model,
        entrypoint: s.entrypoint,
        version: s.version,
        gitBranch: s.gitBranch,
        isActive: s.isActive,
        tokens: s.tokens,
        messageCount: s.messageCount,
        toolCallCount: s.toolCallCount,
        subagentCount: s.subagentCount,
        subagentTokens: s.subagentTokens,
      })),
    };

    return NextResponse.json(serialized, { headers: HEADERS });
  } catch {
    // S6: No file paths in error responses
    return NextResponse.json(
      { error: "Failed to read telemetry data" },
      { status: 500, headers: HEADERS },
    );
  }
}
