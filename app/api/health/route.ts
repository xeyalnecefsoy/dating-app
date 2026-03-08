import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const startedAt = Date.now();
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        error: "NEXT_PUBLIC_CONVEX_URL is missing",
      },
      { status: 503 }
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const ops = await client.query(api.ops.getOperationalHealthPublic, {});

    const payload = {
      status: ops.status,
      timestamp: new Date().toISOString(),
      latencyMs: Date.now() - startedAt,
      checks: ops.checks,
      metrics: ops.metrics,
      automation: ops.automation,
      activeSystemAlert: ops.activeSystemAlert,
    };

    return NextResponse.json(payload, {
      status: ops.status === "ok" ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "down",
        timestamp: new Date().toISOString(),
        latencyMs: Date.now() - startedAt,
        error: error?.message || "unknown",
      },
      { status: 503 }
    );
  }
}
