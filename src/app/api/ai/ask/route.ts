import { askLegalIntelligenceAssistant } from '@/src/server/gemini';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// AI Legal Intelligence Assistant API (Section 55)
export const POST = withAuth(async (ctx) => {
  const orgId = ctx.organizationId;
  const { question, periodId } = ctx.body || {};

  if (!question || !String(question).trim()) {
    return json({ error: 'A question is required.' }, 400);
  }

  try {
    const answer = await askLegalIntelligenceAssistant(orgId, periodId || 'period-2026-09', String(question));
    return json({ answer });
  } catch (err: any) {
    return json({ error: 'AI advisor error', details: err?.message }, 500);
  }
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as GET, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
