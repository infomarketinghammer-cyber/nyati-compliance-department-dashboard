import { db } from '@/src/server/db';
import { json, withAdmin, withAuth } from '@/src/server/http';
import { isFiniteNumber } from '@/src/server/routeHelpers';
import type { KRA } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// KRAs endpoints
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const kras = db.getKRAs(orgId).sort((a, b) => a.orderIndex - b.orderIndex);
  const totalWeight = kras.reduce((acc, k) => acc + (k.active ? k.weight : 0), 0);
  return json({
    kras,
    totalWeight,
    isValidTotalWeight: Math.abs(totalWeight - 100) < 0.01,
    remainingWeight: 100 - totalWeight,
  });
});

export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const state = db.getState();
  const { name, description, ownerId, weight, orderIndex, effectivePeriod, department, wing } = ctx.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return json({ error: 'KRA name is required.' }, 400);
  }
  if (!isFiniteNumber(weight) || Number(weight) < 0 || Number(weight) > 100) {
    return json({ error: 'KRA weight must be a number between 0 and 100.' }, 400);
  }

  const owner = state.users.find((u) => u.id === ownerId && u.organizationId === orgId) || ctx.user;
  const orgKras = state.kras.filter((k) => k.organizationId === orgId);

  const newKRA: KRA = {
    id: `kra-${Date.now()}`,
    organizationId: orgId,
    kraNumber: orgKras.reduce((max, k) => Math.max(max, k.kraNumber), 0) + 1,
    name: name.trim(),
    description: description || '',
    ownerId: owner.id,
    ownerName: owner.name,
    weight: Number(weight),
    active: true,
    orderIndex: Number(orderIndex) || orgKras.length + 1,
    effectivePeriod: effectivePeriod || 'FY 2026-27',
    department,
    wing,
  };

  state.kras.push(newKRA);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'CREATE_KRA',
    entity: 'KRA',
    entityId: newKRA.id,
    newValue: `Created KRA: ${newKRA.name} with weight ${newKRA.weight}%`,
  });

  return json(newKRA, 201);
});
