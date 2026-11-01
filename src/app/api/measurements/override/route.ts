import { db } from '@/src/server/db';
import { calculateKPIAchievement } from '@/src/server/calculationEngine';
import { json, withAdmin } from '@/src/server/http';
import { getLockedPeriodError, isFiniteNumber } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manual Override Endpoint (Section 54 - ADMIN-ONLY)
export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const state = db.getState();
  const { kpiId, periodId, overrideValue, reason } = ctx.body || {};

  if (!reason || !String(reason).trim() || !isFiniteNumber(overrideValue)) {
    return json({ error: 'A numeric override value and a detailed justification reason are required.' }, 400);
  }
  const lockErr = getLockedPeriodError(orgId, periodId);
  if (lockErr) return json({ error: lockErr.error }, lockErr.status);

  const kpi = state.kpis.find((k) => k.id === kpiId && k.organizationId === orgId);
  if (!kpi) return json({ error: 'KPI not found' }, 404);

  let measurement = state.measurements.find(
    (m) => m.kpiId === kpiId && m.periodId === periodId && m.organizationId === orgId
  );

  const originalVal = measurement ? measurement.actual : 0;
  const calc = calculateKPIAchievement(kpi, Number(overrideValue), kpi.targetValue, db.getScoringSettings(orgId));

  const approverTitle = `${currentUser.name} (${currentUser.designation})`;

  if (measurement) {
    // Preserve the very first pre-override value across repeated overrides
    if (!measurement.isManuallyOverridden) measurement.originalCalculatedValue = originalVal;
    measurement.actual = Number(overrideValue);
    measurement.target = kpi.targetValue;
    measurement.achievement = calc.achievement;
    measurement.weightedScore = calc.weightedScore;
    measurement.status = calc.status;
    measurement.isManuallyOverridden = true;
    measurement.overrideReason = reason;
    measurement.overrideBy = approverTitle;
    measurement.overrideDate = new Date().toISOString();
  } else {
    measurement = {
      id: `msr-${kpiId}-${periodId}`,
      organizationId: orgId,
      kpiId,
      periodId,
      target: kpi.targetValue,
      actual: Number(overrideValue),
      achievement: calc.achievement,
      weightedScore: calc.weightedScore,
      status: calc.status,
      approvalStatus: 'DRAFT',
      calculatedAutomatically: false,
      isManuallyOverridden: true,
      overrideReason: reason,
      overrideBy: approverTitle,
      overrideDate: new Date().toISOString(),
      submittedBy: currentUser.id,
      submittedDate: new Date().toISOString(),
    };
    state.measurements.push(measurement);
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'MANUAL_OVERRIDE_KPI',
    entity: 'KPI_MEASUREMENT',
    entityId: measurement.id,
    oldValue: `${originalVal} ${kpi.unit}`,
    newValue: `${overrideValue} ${kpi.unit}`,
    reason: `Section 54 Exception Authorized by ${approverTitle}: ${reason}`,
  });

  return json({ success: true, measurement });
});
