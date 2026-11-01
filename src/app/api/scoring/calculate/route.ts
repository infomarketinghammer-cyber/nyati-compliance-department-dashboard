import { db } from '@/src/server/db';
import {
  calculateOperationalMetrics,
  computeDepartmentScore,
  generateScoreExplainabilityTree,
} from '@/src/server/calculationEngine';
import { json, withAuth } from '@/src/server/http';
import { getPeriodContext } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Scoring Calculation Engine API
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = (ctx.query.periodId as string) || 'period-2026-09';
  const state = db.getState();

  const kras = db.getKRAs(orgId);
  const kpis = db.getKPIs(orgId);
  const measurements = db.getMeasurements(orgId, periodId);
  const settings = db.getScoringSettings(orgId);

  const summary = computeDepartmentScore(kras, kpis, measurements, settings);

  // Previous period of the same type for comparison, plus a trailing trend window
  const { previous, trendPeriods } = getPeriodContext(orgId, periodId);
  const prevSummary = previous
    ? computeDepartmentScore(kras, kpis, db.getMeasurements(orgId, previous.id), settings)
    : null;
  const scoreDiff = prevSummary ? Math.round((summary.overallScore - prevSummary.overallScore) * 100) / 100 : 0;

  const trend = trendPeriods.map((p) => {
    const pMsr = db.getMeasurements(orgId, p.id);
    return {
      periodId: p.id,
      periodName: p.name,
      hasData: pMsr.length > 0,
      score: pMsr.length > 0 ? computeDepartmentScore(kras, kpis, pMsr, settings).overallScore : null,
    };
  });

  const explainabilityTree = generateScoreExplainabilityTree(kras, kpis, measurements, settings);

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

  return json({
    periodId,
    departmentSummary: summary,
    previousPeriodSummary: prevSummary
      ? { ...prevSummary, periodId: previous!.id, periodName: previous!.name }
      : { overallScore: 0, status: 'BEHIND', periodId: null, periodName: null },
    scoreDiff,
    trend,
    measuredKpiCount: measurements.length,
    explainabilityTree,
    operationalSummary: opMetrics,
  });
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as POST, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
