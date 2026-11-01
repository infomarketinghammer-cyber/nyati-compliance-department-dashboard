import { db } from '@/src/server/db';
import { computeDepartmentScore } from '@/src/server/calculationEngine';
import { json, withAdmin, withAuth } from '@/src/server/http';
import { findPeriod } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Performance Reviews API (Section 39)
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = ctx.query.periodId as string;
  let list = db.getState().reviews.filter((r) => r.organizationId === orgId);
  if (periodId) list = list.filter((r) => r.periodId === periodId);
  return json(list);
});

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const state = db.getState();
  const data = ctx.body || {};

  const period = findPeriod(orgId, data.periodId);
  if (!period) return json({ error: 'Period not found' }, 404);
  if (!data.performanceSummary || !String(data.performanceSummary).trim()) {
    return json({ error: 'Performance summary is required.' }, 400);
  }

  // The published score is always the engine's score for that period, never client supplied
  const summary = computeDepartmentScore(
    db.getKRAs(orgId),
    db.getKPIs(orgId),
    db.getMeasurements(orgId, period.id),
    db.getScoringSettings(orgId)
  );

  const newRev = {
    id: `rev-${Date.now()}`,
    organizationId: orgId,
    periodId: period.id,
    reviewerId: currentUser.id,
    reviewerName: `${currentUser.name} (${currentUser.designation})`,
    overallScore: summary.overallScore,
    performanceSummary: data.performanceSummary,
    majorAchievements: data.majorAchievements || '',
    identifiedProblems: data.identifiedProblems || '',
    reasonsForUnderperformance: data.reasonsForUnderperformance || '',
    correctiveActions: data.correctiveActions || '',
    managementComments: data.managementComments || '',
    createdDate: new Date().toISOString().slice(0, 10),
    status: data.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
  } as const;

  state.reviews.unshift({ ...newRev });

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'PUBLISH_PERFORMANCE_REVIEW',
    entity: 'PERFORMANCE_REVIEW',
    entityId: newRev.id,
    newValue: `Published review for ${period.name} (score ${newRev.overallScore}%)`,
  });

  return json(newRev, 201);
});
