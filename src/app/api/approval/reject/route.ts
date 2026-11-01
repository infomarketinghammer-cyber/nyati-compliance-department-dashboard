import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { findPeriod } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const { periodId, rejectionReason } = ctx.body || {};

  if (!rejectionReason || !String(rejectionReason).trim()) {
    return json({ error: 'Rejection reason is required.' }, 400);
  }

  const period = findPeriod(orgId, periodId);
  if (!period) return json({ error: 'Period not found' }, 404);
  if (!['UNDER_REVIEW', 'SUBMITTED', 'APPROVED'].includes(period.status)) {
    return json({ error: `Only periods under review can be rejected (current status: ${period.status}).` }, 409);
  }

  const oldStatus = period.status;
  period.status = 'OPEN';

  for (const m of db.getMeasurements(orgId, periodId)) {
    m.approvalStatus = 'REJECTED';
    m.rejectionReason = rejectionReason;
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'REJECT_PERIOD_MEASUREMENTS',
    entity: 'PERFORMANCE_PERIOD',
    entityId: periodId,
    oldValue: oldStatus,
    newValue: 'OPEN (REJECTED)',
    reason: rejectionReason,
  });

  return json({ success: true, period });
});
