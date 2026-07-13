import { NextResponse } from 'next/server';

// NexFlow KB · health endpoint
// Lightweight liveness probe so Rizz / external services can confirm the
// knowledge-base API is responding. Returns build metadata, no app state.
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'nexflow-kb',
    version: 'v1',
    timestamp: new Date().toISOString(),
  });
}
