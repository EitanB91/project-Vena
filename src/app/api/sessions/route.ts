import { NextRequest, NextResponse } from "next/server";
import { getProjectSlug, getProjectTelemetry } from "@/lib/telemetry";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/sessions
 *
 * Returns telemetry-based session list for the current project.
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

    const sessions = telemetry.sessions.map((s) => ({
      sessionId: s.sessionId,
      title: s.title,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      durationMinutes: s.durationMinutes,
      model: s.model,
      isActive: s.isActive,
      tokens: s.tokens,
      messageCount: s.messageCount,
      toolCallCount: s.toolCallCount,
      subagentCount: s.subagentCount,
      subagentTokens: s.subagentTokens,
    }));

    return NextResponse.json(
      {
        sessions,
        totalSessions: sessions.length,
        activeSessionCount: telemetry.activeSessionCount,
      },
      { headers: HEADERS },
    );
  } catch {
    // S6: No file paths in error responses
    return NextResponse.json(
      { error: "Failed to read session data" },
      { status: 500, headers: HEADERS },
    );
  }
}
