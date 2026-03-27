import path from "node:path";
import { NextResponse } from "next/server";
import { readAllAgents } from "@/lib/agents";
import { readBudgetLedger, computeBudgetSummary } from "@/lib/budget";
import { readProjectRoadmap } from "@/lib/roadmap";
import { getProjectSlug, getProjectTelemetry } from "@/lib/telemetry";
import { enhanceAgentProfiles } from "@/lib/agent-status";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/dashboard
 *
 * Returns combined dashboard data: agents, budget, roadmap progress, telemetry.
 * Single endpoint to minimize client-side requests.
 * Security: S5 server-only, S6 safe errors.
 */
export async function GET() {
  try {
    const projectPath = process.cwd();
    const claudeDir = path.join(projectPath, ".claude");

    // Fetch all data sources in parallel
    const slug = getProjectSlug(projectPath);
    const [rawProfiles, ledger, roadmap, telemetry] = await Promise.all([
      Promise.resolve(readAllAgents(claudeDir)),
      Promise.resolve(readBudgetLedger(claudeDir)),
      Promise.resolve(readProjectRoadmap(projectPath)),
      getProjectTelemetry(slug),
    ]);

    // Enhance agent status with telemetry
    const mostRecentSession = telemetry.sessions[0] ?? null;
    const profiles = enhanceAgentProfiles(rawProfiles, {
      activeSessionCount: telemetry.activeSessionCount,
      mostRecentSessionEnd: mostRecentSession?.endTime ?? null,
    });

    const summary = ledger ? computeBudgetSummary(ledger) : null;

    const currentPhase = roadmap?.phases.find(
      (p) => p.status === "next" || p.status === "in_progress",
    );
    const completedPhases =
      roadmap?.phases.filter((p) => p.status === "complete").length ?? 0;

    // Serialize agents (strip file paths — S6)
    const agents = profiles.map((p) => ({
      name: p.identity.name,
      role: p.identity.role,
      colorToken: p.colorToken,
      status: p.status,
      lastSeen: p.lastSeen,
    }));

    return NextResponse.json(
      {
        agents,
        budget: summary
          ? {
              remainingBalance: summary.remainingBalance,
              usableBudget: summary.usableBudget,
              alertLevel: summary.alertLevel,
              currency: summary.currency,
            }
          : null,
        roadmap: roadmap
          ? {
              currentPhase: currentPhase
                ? { id: currentPhase.id, title: currentPhase.title }
                : null,
              completedPhases,
              totalPhases: roadmap.phases.length,
              phases: roadmap.phases.map((p) => ({
                id: p.id,
                title: p.title,
                status: p.status,
                tasksDone: p.tasks.filter((t) => t.completed).length,
                tasksTotal: p.tasks.length,
              })),
            }
          : null,
        telemetry: {
          activeSessionCount: telemetry.activeSessionCount,
          totalSessions: telemetry.sessions.length,
          totals: telemetry.totals,
          dailyUsage: telemetry.dailyUsage,
          sessions: telemetry.sessions.slice(0, 5).map((s) => ({
            sessionId: s.sessionId,
            title: s.title,
            startTime: s.startTime.toISOString(),
            endTime: s.endTime.toISOString(),
            durationMinutes: s.durationMinutes,
            model: s.model,
            isActive: s.isActive,
            tokens: s.tokens,
            messageCount: s.messageCount,
          })),
        },
      },
      { headers: HEADERS },
    );
  } catch {
    // S6: No file paths in error responses
    return NextResponse.json(
      { error: "Failed to read dashboard data" },
      { status: 500, headers: HEADERS },
    );
  }
}
