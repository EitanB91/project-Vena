import path from "node:path";
import { NextResponse } from "next/server";
import { readBudgetLedger, computeBudgetSummary } from "@/lib/budget";

const HEADERS = { "Cache-Control": "no-store" } as const;

/**
 * GET /api/budget
 *
 * Returns budget ledger summary and Claude Code usage info.
 * Security: S5 server-only, S6 safe errors.
 */
export async function GET() {
  try {
    const claudeDir = path.join(process.cwd(), ".claude");
    const ledger = readBudgetLedger(claudeDir);

    if (!ledger) {
      return NextResponse.json(
        { error: "No budget ledger found" },
        { status: 404, headers: HEADERS },
      );
    }

    const summary = computeBudgetSummary(ledger);

    return NextResponse.json(
      {
        summary,
        alertThresholds: ledger.alertThresholds,
        authority: ledger.authority,
      },
      { headers: HEADERS },
    );
  } catch {
    // S6: No file paths in error responses
    return NextResponse.json(
      { error: "Failed to read budget data" },
      { status: 500, headers: HEADERS },
    );
  }
}
