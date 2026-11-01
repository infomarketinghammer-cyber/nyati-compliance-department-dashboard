import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { findPeriod } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Approval Workflow Endpoints (Section 28 - ADMIN-ONLY)
export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const { periodId } = ctx.body || {};

  const period = findPeriod(orgId, periodId);
  if (!period) return json({ error: 'Period not found' }, 404);
  if (period.status !== 'OPEN') {
    return json({ error: `Only OPEN periods can be submitted for review (current status: ${period.status}).` }, 409);
  }

  const settings = db.getScoringSettings(orgId);
  if (settings.enforce100PercentWeight !== false) {
    const total = db.getKRAs(orgId).filter((k) => k.active).reduce((a, k) => a + k.weight, 0);
    if (Math.abs(total - 100) >= 0.01) {
      return json({ error: `Active KRA weights total ${total}%. Balance them to exactly 100% before submitting.` }, 409);
    }
  }

  const oldStatus = period.status;
  period.status = 'UNDER_REVIEW';

  for (const m of db.getMeasurements(orgId, periodId)) {
    if (m.approvalStatus === 'DRAFT' || m.approvalStatus === 'REOPENED' || m.approvalStatus === 'REJECTED') {
      m.approvalStatus = 'UNDER_REVIEW';
      m.rejectionReason = undefined;
    }
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'SUBMIT_PERIOD_FOR_REVIEW',
    entity: 'PERFORMANCE_PERIOD',
    entityId: periodId,
    oldValue: oldStatus,
    newValue: 'UNDER_REVIEW',
    reason: 'Measurements compiled and submitted for executive governance review',
  });

  return json({ success: true, period });
});
