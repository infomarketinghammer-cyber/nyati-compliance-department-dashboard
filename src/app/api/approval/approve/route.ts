import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { findPeriod } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const { periodId } = ctx.body || {};

  const period = findPeriod(orgId, periodId);
  if (!period) return json({ error: 'Period not found' }, 404);
  if (!['UNDER_REVIEW', 'SUBMITTED', 'APPROVED'].includes(period.status)) {
    return json({ error: `Only periods under review can be approved and locked (current status: ${period.status}).` }, 409);
  }

  const settings = db.getScoringSettings(orgId);
  if (settings.enforce100PercentWeight !== false) {
    const total = db.getKRAs(orgId).filter((k) => k.active).reduce((a, k) => a + k.weight, 0);
    if (Math.abs(total - 100) >= 0.01) {
      return json({ error: `Active KRA weights total ${total}%. Balance them to exactly 100% before locking.` }, 409);
    }
  }

  const oldStatus = period.status;
  const approverName = `${currentUser.name} (${currentUser.designation})`;
  period.status = 'LOCKED';
  period.approvedBy = approverName;
  period.lockedDate = new Date().toISOString();

  for (const m of db.getMeasurements(orgId, periodId)) {
    m.approvalStatus = 'APPROVED';
    m.approvedBy = approverName;
    m.approvedDate = period.lockedDate;
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'APPROVE_AND_LOCK_PERIOD',
    entity: 'PERFORMANCE_PERIOD',
    entityId: periodId,
    oldValue: oldStatus,
    newValue: 'LOCKED',
    reason: 'Period approved and officially locked for quarterly audit compliance',
  });

  return json({ success: true, period });
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as GET, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
