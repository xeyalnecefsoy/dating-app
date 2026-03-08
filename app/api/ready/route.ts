import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

  if (!convexUrl) {
    return NextResponse.json(
      { ready: false, reason: "NEXT_PUBLIC_CONVEX_URL is missing" },
      { status: 503 }
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const ops = await client.query(api.ops.getOperationalHealthPublic, {});

    const ready = ops.status === "ok";
    return NextResponse.json(
      {
        ready,
        status: ops.status,
        checks: ops.checks,
      },
      { status: ready ? 200 : 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { ready: false, reason: error?.message || "unknown" },
      { status: 503 }
    );
  }
}
