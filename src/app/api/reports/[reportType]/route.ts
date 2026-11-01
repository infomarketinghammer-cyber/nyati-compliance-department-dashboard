import { db } from '@/src/server/db';
import { computeDepartmentScore } from '@/src/server/calculationEngine';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Reports API (Section 40)
export const GET = withAuth<{ reportType: string }>((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = (ctx.query.periodId as string) || 'period-2026-09';
  const state = db.getState();
  const kras = db.getKRAs(orgId);
  const kpis = db.getKPIs(orgId);
  const measurements = db.getMeasurements(orgId, periodId);
  const settings = db.getScoringSettings(orgId);

  return json({
    reportType: ctx.params.reportType,
    periodId,
    generatedDate: new Date().toISOString(),
    organization: state.organizations.find((o) => o.id === orgId),
    summary: computeDepartmentScore(kras, kpis, measurements, settings),
    kras,
    kpis,
    measurements,
  });
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as POST, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
