import { NextResponse } from "next/server";
import { getTargetReelLogs } from "@/lib/gratitudeLogs";

export const runtime = "nodejs";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getDateRange(url: URL) {
  const mode = url.searchParams.get("mode") ?? "all";
  const today = new Date();

  if (mode === "last30") {
    const start = new Date(today);
    start.setDate(start.getDate() - 29);
    return {
      startDate: formatDate(start),
      endDate: formatDate(today),
      mode,
    };
  }

  if (mode === "month") {
    const year = Number(url.searchParams.get("year") ?? today.getFullYear());
    const month = Number(url.searchParams.get("month") ?? today.getMonth() + 1);

    if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error("Invalid year or month.");
    }

    const start = new Date(Date.UTC(year, month - 1, 1));
    const monthEnd = new Date(Date.UTC(year, month, 0));
    const currentMonthEnd =
      year === today.getFullYear() && month === today.getMonth() + 1
        ? today
        : monthEnd;

    return {
      startDate: formatDate(start),
      endDate: formatDate(currentMonthEnd),
      mode,
    };
  }

  return { startDate: undefined, endDate: undefined, mode };
}

export async function GET(
  request: Request,
  { params }: { params: { targetId: string } },
) {
  try {
    const { targetId } = params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId") ?? undefined;
    const { startDate, endDate, mode } = getDateRange(url);
    const logs = await getTargetReelLogs({ targetId, userId, startDate, endDate });

    return NextResponse.json({ logs, range: { mode, startDate, endDate } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown reel error.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

