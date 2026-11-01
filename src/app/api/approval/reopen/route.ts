import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { findPeriod } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const { periodId, reopenReason } = ctx.body || {};

  if (!reopenReason || !String(reopenReason).trim()) {
    return json({ error: 'Authorized reason is required to unlock a finalized period.' }, 400);
  }

  const period = findPeriod(orgId, periodId);
  if (!period) return json({ error: 'Period not found' }, 404);
  if (period.status !== 'LOCKED') {
    return json({ error: `Only LOCKED periods can be reopened (current status: ${period.status}).` }, 409);
  }

  period.status = 'OPEN';

  for (const m of db.getMeasurements(orgId, periodId)) {
    m.approvalStatus = 'REOPENED';
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'REOPEN_LOCKED_PERIOD',
    entity: 'PERFORMANCE_PERIOD',
    entityId: periodId,
    oldValue: 'LOCKED',
    newValue: 'OPEN (REOPENED)',
    reason: reopenReason,
  });

  return json({ success: true, period });
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as GET, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
