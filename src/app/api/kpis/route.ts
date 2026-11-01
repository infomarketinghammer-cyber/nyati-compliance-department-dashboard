import { db } from '@/src/server/db';
import { json, withAdmin, withAuth } from '@/src/server/http';
import { isFiniteNumber, validateKpiPayload } from '@/src/server/routeHelpers';
import type { KPI } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// KPIs endpoints
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const kraId = ctx.query.kraId as string;
  let kpis = db.getKPIs(orgId);
  if (kraId) {
    kpis = kpis.filter((k) => k.kraId === kraId);
  }
  return json(kpis);
});

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const state = db.getState();
  const data = ctx.body || {};
  const currentUser = ctx.user;

  const kpiCode = data.kpiCode || `KPI-${Date.now().toString().slice(-4)}`;
  const validationError = validateKpiPayload(orgId, { ...data, kpiCode }, true);
  if (validationError) return json({ error: validationError }, 400);

  const owner = state.users.find((u) => u.id === data.ownerId && u.organizationId === orgId) || currentUser;

  const newKPI: KPI = {
    id: `kpi-${Date.now()}`,
    organizationId: orgId,
    kraId: data.kraId,
    kpiCode,
    name: String(data.name).trim(),
    description: data.description || '',
    ownerId: owner.id,
    ownerName: owner.name,
    measurementType: data.measurementType || 'PERCENTAGE',
    unit: data.unit || '%',
    frequency: data.frequency || 'MONTHLY',
    direction: data.direction || 'HIGHER_IS_BETTER',
    calculationMethod: data.calculationMethod || 'MANUAL',
    dataSource: data.dataSource,
    weight: isFiniteNumber(data.weight) ? Number(data.weight) : 30,
    minAcceptableValue: isFiniteNumber(data.minAcceptableValue) ? Number(data.minAcceptableValue) : undefined,
    targetValue: Number(data.targetValue),
    maxCapValue: isFiniteNumber(data.maxCapValue) ? Number(data.maxCapValue) : undefined,
    active: true,
    effectiveDate: data.effectiveDate || new Date().toISOString().slice(0, 10),
  };

  state.kpis.push(newKPI);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'CREATE_KPI',
    entity: 'KPI',
    entityId: newKPI.id,
    newValue: `Created KPI: ${newKPI.name} (Code: ${newKPI.kpiCode}) with target ${newKPI.targetValue}`,
  });

  return json(newKPI, 201);
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
