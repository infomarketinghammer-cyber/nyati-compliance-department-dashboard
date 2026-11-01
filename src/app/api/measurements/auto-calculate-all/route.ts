import { db } from '@/src/server/db';
import {
  autoCalculateKPIActual,
  calculateKPIAchievement,
  calculateOperationalMetrics,
} from '@/src/server/calculationEngine';
import { json, withAdmin } from '@/src/server/http';
import { getLockedPeriodError } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Auto-calculate ALL automatic KPIs from operational records (ADMIN-ONLY)
export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = ctx.body?.periodId || 'period-2026-09';
  const state = db.getState();

  const lockErr = getLockedPeriodError(orgId, periodId);
  if (lockErr) return json({ error: lockErr.error }, lockErr.status);

  const opMetrics = calculateOperationalMetrics(
    state.contracts.filter((c) => c.organizationId === orgId),
    state.compliances.filter((c) => c.organizationId === orgId),
    state.litigations.filter((l) => l.organizationId === orgId),
    state.notices.filter((n) => n.organizationId === orgId),
    state.risks.filter((r) => r.organizationId === orgId),
    state.dueDiligences.filter((d) => d.organizationId === orgId),
    state.approvals.filter((a) => a.organizationId === orgId),
    state.tasks.filter((t) => t.organizationId === orgId)
  );

  const kpis = db.getKPIs(orgId);
  const settings = db.getScoringSettings(orgId);
  const updatedCount: string[] = [];
  const skippedOverrides: string[] = [];

  for (const kpi of kpis) {
    if (kpi.calculationMethod !== 'AUTOMATIC') continue;
    const autoVal = autoCalculateKPIActual(kpi.kpiCode, opMetrics);
    if (autoVal === null) continue;

    let measurement = state.measurements.find(
      (m) => m.kpiId === kpi.id && m.periodId === periodId && m.organizationId === orgId
    );

    // Never silently overwrite an authorized manual override
    if (measurement?.isManuallyOverridden) {
      skippedOverrides.push(kpi.kpiCode);
      continue;
    }

    const calc = calculateKPIAchievement(kpi, autoVal, kpi.targetValue, settings);

    if (measurement) {
      measurement.actual = autoVal;
      measurement.target = kpi.targetValue;
      measurement.achievement = calc.achievement;
      measurement.weightedScore = calc.weightedScore;
      measurement.status = calc.status;
      measurement.calculatedAutomatically = true;
    } else {
      measurement = {
        id: `msr-${kpi.id}-${periodId}`,
        organizationId: orgId,
        kpiId: kpi.id,
        periodId,
        target: kpi.targetValue,
        actual: autoVal,
        achievement: calc.achievement,
        weightedScore: calc.weightedScore,
        status: calc.status,
        approvalStatus: 'DRAFT',
        calculatedAutomatically: true,
        isManuallyOverridden: false,
        submittedBy: 'SYSTEM_CALCULATION_ENGINE',
        submittedDate: new Date().toISOString(),
      };
      state.measurements.push(measurement);
    }
    updatedCount.push(kpi.kpiCode);
  }

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'AUTO_CALCULATE_MEASUREMENTS',
    entity: 'KPI_ENGINE',
    newValue: `Auto-calculated ${updatedCount.length} KPIs from operational registers for ${periodId}` +
      (skippedOverrides.length ? ` (kept ${skippedOverrides.length} manual overrides: ${skippedOverrides.join(', ')})` : ''),
  });

  return json({
    success: true,
    updatedCount: updatedCount.length,
    kpiCodes: updatedCount,
    skippedOverrides,
    measurements: db.getMeasurements(orgId, periodId),
  });
});
