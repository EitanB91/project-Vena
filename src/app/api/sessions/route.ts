import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { getProjectSlug, getProjectTelemetry } from "@/lib/telemetry";
import { getSessionEnrichment } from "@/lib/sessions";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/sessions
 *
 * Returns telemetry-based session list for the current project,
 * enriched with V&V category/phase data and daily usage chart data.
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

    // Read V&V enrichment (categories + phase per session)
    const enrichment = getSessionEnrichment(path.join(process.cwd(), ".claude"));

    const sessions = telemetry.sessions.map((s) => {
      const vv = enrichment.get(s.sessionId);
      return {
        sessionId: s.sessionId,
        title: s.title,
        startTime: s.startTime.toISOString(),
        endTime: s.endTime.toISOString(),
        durationMinutes: s.durationMinutes,
        model: s.model,
        gitBranch: s.gitBranch,
        isActive: s.isActive,
        tokens: s.tokens,
        messageCount: s.messageCount,
        toolCallCount: s.toolCallCount,
        subagentCount: s.subagentCount,
        subagentTokens: s.subagentTokens,
        categories: vv?.categories ?? [],
        phase: vv?.phase ?? null,
      };
    });

    // Daily usage for chart
    const dailyUsage = telemetry.dailyUsage.map((d) => ({
      date: d.date,
      sessions: d.sessions,
      minutes: Math.round(d.durationMinutes * 10) / 10,
    }));

    return NextResponse.json(
      {
        sessions,
        totalSessions: sessions.length,
        activeSessionCount: telemetry.activeSessionCount,
        dailyUsage,
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
