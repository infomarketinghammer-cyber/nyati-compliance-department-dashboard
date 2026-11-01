import { db } from '@/src/server/db';
import { json, withAdmin, withAuth } from '@/src/server/http';
import { getLockedPeriodError } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Evidence API (Section 27)
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const periodId = ctx.query.periodId as string;
  const kpiId = ctx.query.kpiId as string;
  const state = db.getState();

  let list = state.evidence.filter((e) => e.organizationId === orgId);
  if (periodId) list = list.filter((e) => e.periodId === periodId);
  if (kpiId) list = list.filter((e) => e.kpiId === kpiId);

  return json(list);
});

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const state = db.getState();
  const data = ctx.body || {};

  const kpi = state.kpis.find((k) => k.id === data.kpiId && k.organizationId === orgId);
  if (!kpi) return json({ error: 'KPI not found' }, 404);
  const lockErr = getLockedPeriodError(orgId, data.periodId);
  if (lockErr) return json({ error: lockErr.error }, lockErr.status);
  if (!data.fileName || !data.documentUrl) {
    return json({ error: 'A real evidence document must be uploaded.' }, 400);
  }

  const newEvidence = {
    id: `ev-${Date.now()}`,
    organizationId: orgId,
    measurementId: `msr-${data.kpiId}-${data.periodId}`,
    kpiId: data.kpiId,
    periodId: data.periodId,
    fileName: data.fileName,
    fileType: data.fileType || 'DOCUMENT',
    fileSize: data.fileSize || '',
    uploadedBy: currentUser.name,
    uploadedDate: new Date().toISOString().slice(0, 10),
    description: data.description || '',
    documentUrl: data.documentUrl,
  };

  state.evidence.push(newEvidence);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'UPLOAD_EVIDENCE',
    entity: 'KPI_EVIDENCE',
    entityId: newEvidence.id,
    newValue: `Attached document: ${newEvidence.fileName} for KPI ${kpi.kpiCode}`,
  });

  return json(newEvidence, 201);
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
