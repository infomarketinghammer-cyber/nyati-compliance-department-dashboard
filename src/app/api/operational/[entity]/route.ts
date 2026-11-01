import { db } from '@/src/server/db';
import { json, withAuth } from '@/src/server/http';
import {
  isFiniteNumber,
  OPERATIONAL_REQUIRED_FIELDS,
  resolveOperationalEntity,
  type OperationalEntity,
} from '@/src/server/routeHelpers';
import type { UserRole } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const entityNotFound = (entity: string) => json({ error: `Operational register '${entity}' not found` }, 404);

export const GET = withAuth<{ entity: string }>((ctx) => {
  const entityKey = resolveOperationalEntity(ctx.params.entity);
  if (!entityKey) return entityNotFound(ctx.params.entity);
  const orgId = ctx.organizationId;
  const items = (db.getState() as any)[entityKey].filter((i: any) => i.organizationId === orgId);
  return json(items);
});

export const POST = withAuth<{ entity: string }>((ctx) => {
  const entityKey = resolveOperationalEntity(ctx.params.entity);
  if (!entityKey) return entityNotFound(ctx.params.entity);
  const orgId = ctx.organizationId;
  const role = ctx.userRole as UserRole;
  if (role === 'AUDITOR' || role === 'MANAGEMENT') {
    return json({ error: 'Forbidden: Auditors and management viewers have read-only access to registers.' }, 403);
  }

  const body = { ...(ctx.body || {}) };
  delete body.id;
  delete body.organizationId;

  const missing = OPERATIONAL_REQUIRED_FIELDS[entityKey].filter(
    (f) => body[f] === undefined || body[f] === null || String(body[f]).trim() === ''
  );
  if (missing.length) {
    return json({ error: `Missing required fields: ${missing.join(', ')}` }, 400);
  }

  // Derived fields so new records feed SLA / risk calculations consistently with seeded ones
  for (const f of ['contractValueINR', 'targetSLADays', 'actualTATDays', 'actualResponseDays', 'actualDaysTaken', 'estimatedExposureINR',
    'actualLegalCostINR', 'probability', 'impact', 'defectsIdentified', 'defectsResolved', 'transactionValueINR']) {
    if (body[f] !== undefined && body[f] !== '') {
      if (!isFiniteNumber(body[f])) return json({ error: `${f} must be a number.` }, 400);
      body[f] = Number(body[f]);
    }
  }
  if (entityKey === 'contracts' && body.actualTATDays !== undefined && body.targetSLADays !== undefined) {
    body.isWithinSLA = body.actualTATDays <= body.targetSLADays;
  }
  if (entityKey === 'notices' && body.actualResponseDays !== undefined && body.targetSLADays !== undefined) {
    body.isWithinSLA = body.actualResponseDays <= body.targetSLADays;
  }
  if (entityKey === 'risks') {
    if (body.probability < 1 || body.probability > 5 || body.impact < 1 || body.impact > 5) {
      return json({ error: 'Probability and impact must be between 1 and 5.' }, 400);
    }
    body.riskScore = body.probability * body.impact;
    body.riskLevel = body.riskScore >= 20 ? 'CRITICAL' : body.riskScore >= 12 ? 'HIGH' : body.riskScore >= 6 ? 'MEDIUM' : 'LOW';
  }
  if (entityKey === 'dueDiligences') {
    body.defectsIdentified = body.defectsIdentified ?? 0;
    body.defectsResolved = body.defectsResolved ?? 0;
    if (body.defectsResolved > body.defectsIdentified) {
      return json({ error: 'Resolved defects cannot exceed identified defects.' }, 400);
    }
  }

  const prefix: Record<OperationalEntity, string> = {
    contracts: 'cnt', compliances: 'comp', litigations: 'lit', notices: 'not', risks: 'rsk',
    dueDiligences: 'dd', approvals: 'appr', transactions: 'txn', tasks: 'tsk',
  };
  const newItem = {
    ...body,
    id: `${prefix[entityKey]}-${Date.now()}`,
    organizationId: orgId,
  };

  (db.getState() as any)[entityKey].unshift(newItem);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: `CREATE_${entityKey.toUpperCase()}`,
    entity: entityKey.toUpperCase(),
    entityId: newItem.id,
    newValue: `Added ${entityKey} register record ${newItem.id}`,
  });

  return json(newItem, 201);
});
