import { db } from '@/src/server/db';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hierarchy Rollup endpoint
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = (ctx.query.periodId as string) || 'period-2026-09';
  return json(db.getHierarchyRollup(orgId, periodId));
});
