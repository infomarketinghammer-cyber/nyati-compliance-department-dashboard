import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { KPI_EDITABLE_FIELDS, pick, validateKpiPayload } from '@/src/server/routeHelpers';
import type { KPI } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = withAdmin<{ id: string }>((ctx) => {
  const orgId = ctx.organizationId;
  const state = db.getState();
  const kpi = state.kpis.find((k) => k.id === ctx.params.id && k.organizationId === orgId);

  if (!kpi) {
    return json({ error: 'KPI not found' }, 404);
  }

  const updates = pick<KPI>(ctx.body, KPI_EDITABLE_FIELDS) as any;
  const validationError = validateKpiPayload(orgId, { ...updates, id: kpi.id }, false);
  if (validationError) return json({ error: validationError }, 400);

  for (const numericField of ['weight', 'targetValue', 'minAcceptableValue', 'maxCapValue']) {
    if (updates[numericField] === null || updates[numericField] === '') updates[numericField] = undefined;
    else if (updates[numericField] !== undefined) updates[numericField] = Number(updates[numericField]);
  }
  if (updates.ownerId) {
    const owner = state.users.find((u) => u.id === updates.ownerId && u.organizationId === orgId);
    if (owner) updates.ownerName = owner.name;
  }

  Object.assign(kpi, updates);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'UPDATE_KPI',
    entity: 'KPI',
    entityId: kpi.id,
    newValue: `Updated KPI: ${kpi.name} (target ${kpi.targetValue} ${kpi.unit}, weight ${kpi.weight}%)`,
    reason: ctx.body.reason || 'KPI configuration adjustment',
  });

  return json(kpi);
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as GET, apiNotFound as POST, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
