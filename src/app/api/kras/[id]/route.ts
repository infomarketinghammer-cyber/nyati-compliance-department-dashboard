import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { isFiniteNumber, KRA_EDITABLE_FIELDS, pick } from '@/src/server/routeHelpers';
import type { KRA } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PUT = withAdmin<{ id: string }>((ctx) => {
  const orgId = ctx.organizationId;
  const state = db.getState();
  const kra = state.kras.find((k) => k.id === ctx.params.id && k.organizationId === orgId);

  if (!kra) {
    return json({ error: 'KRA not found' }, 404);
  }

  const updates = pick<KRA>(ctx.body, KRA_EDITABLE_FIELDS);
  if (updates.weight !== undefined) {
    if (!isFiniteNumber(updates.weight) || Number(updates.weight) < 0 || Number(updates.weight) > 100) {
      return json({ error: 'KRA weight must be a number between 0 and 100.' }, 400);
    }
    updates.weight = Number(updates.weight);
  }
  if (updates.name !== undefined && !String(updates.name).trim()) {
    return json({ error: 'KRA name cannot be empty.' }, 400);
  }

  const oldWeight = kra.weight;
  Object.assign(kra, updates);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: updates.weight !== undefined && updates.weight !== oldWeight ? 'UPDATE_KRA_WEIGHT' : 'UPDATE_KRA',
    entity: 'KRA',
    entityId: kra.id,
    oldValue: updates.weight !== undefined && updates.weight !== oldWeight ? `${oldWeight}%` : undefined,
    newValue: updates.weight !== undefined && updates.weight !== oldWeight ? `${kra.weight}%` : `Updated KRA: ${kra.name}`,
    reason: ctx.body.reason || 'KRA configuration adjustment',
  });

  return json(kra);
});
