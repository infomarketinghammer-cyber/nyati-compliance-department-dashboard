import { db } from '@/src/server/db';
import { calculateKPIAchievement } from '@/src/server/calculationEngine';
import { json, withAdmin, withAuth } from '@/src/server/http';
import { getLockedPeriodError, isFiniteNumber, withLiveCalculation } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Measurements API (achievement values are always re-derived with the current KPI config and settings)
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = ctx.query.periodId as string;
  const kpis = db.getKPIs(orgId);
  const settings = db.getScoringSettings(orgId);
  return json(db.getMeasurements(orgId, periodId).map((m) => withLiveCalculation(m, kpis, settings)));
});

// Enter/Update single actual value (ADMIN-ONLY Reconciliation: LEGAL_HEAD or SUPER_ADMIN)
export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const state = db.getState();
  const { kpiId, periodId, actual, comments } = ctx.body || {};

  if (!isFiniteNumber(actual)) {
    return json({ error: 'Actual value must be a number.' }, 400);
  }
  const lockErr = getLockedPeriodError(orgId, periodId);
  if (lockErr) return json({ error: lockErr.error }, lockErr.status);

  const kpi = state.kpis.find((k) => k.id === kpiId && k.organizationId === orgId);
  if (!kpi) return json({ error: 'KPI not found' }, 404);

  let measurement = state.measurements.find(
    (m) => m.kpiId === kpiId && m.periodId === periodId && m.organizationId === orgId
  );
  const oldActual = measurement?.actual;

  const calc = calculateKPIAchievement(kpi, Number(actual), kpi.targetValue, db.getScoringSettings(orgId));

  if (measurement) {
    measurement.actual = Number(actual);
    measurement.target = kpi.targetValue;
    measurement.achievement = calc.achievement;
    measurement.weightedScore = calc.weightedScore;
    measurement.status = calc.status;
    measurement.calculatedAutomatically = false;
    measurement.comments = comments || measurement.comments;
    measurement.submittedBy = currentUser.id;
    measurement.submittedDate = new Date().toISOString();
  } else {
    measurement = {
      id: `msr-${kpiId}-${periodId}`,
      organizationId: orgId,
      kpiId,
      periodId,
      target: kpi.targetValue,
      actual: Number(actual),
      achievement: calc.achievement,
      weightedScore: calc.weightedScore,
      status: calc.status,
      approvalStatus: 'DRAFT',
      calculatedAutomatically: false,
      isManuallyOverridden: false,
      submittedBy: currentUser.id,
      submittedDate: new Date().toISOString(),
      comments,
    };
    state.measurements.push(measurement);
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'ADMIN_UPDATE_KPI_ACTUAL',
    entity: 'KPI_MEASUREMENT',
    entityId: measurement.id,
    oldValue: oldActual !== undefined ? `${oldActual} ${kpi.unit}` : undefined,
    newValue: `${currentUser.name} (${currentUser.role}) recorded actual ${actual} ${kpi.unit} for ${kpi.name} (Achievement: ${calc.achievement}%)`,
    reason: comments,
  });

  return json(measurement);
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
