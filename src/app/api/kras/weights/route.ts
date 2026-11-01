import { db } from '@/src/server/db';
import { json, withAdmin } from '@/src/server/http';
import { isFiniteNumber } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Bulk update KRA weights (must balance to 100%)
export const POST = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const state = db.getState();
  const { weights, reason } = (ctx.body || {}) as { weights: Record<string, number>; reason?: string };

  if (!weights || typeof weights !== 'object') {
    return json({ error: 'A weights map of { kraId: weight } is required.' }, 400);
  }

  const orgKras = state.kras.filter((k) => k.organizationId === orgId);
  for (const [id, weight] of Object.entries(weights)) {
    if (!orgKras.some((k) => k.id === id)) {
      return json({ error: `Unknown KRA id: ${id}` }, 400);
    }
    if (!isFiniteNumber(weight) || Number(weight) < 0 || Number(weight) > 100) {
      return json({ error: 'Each KRA weight must be a number between 0 and 100.' }, 400);
    }
  }

  // Validate the resulting total across all active KRAs before mutating anything
  const projectedTotal = orgKras
    .filter((k) => k.active)
    .reduce((acc, k) => acc + (weights[k.id] !== undefined ? Number(weights[k.id]) : k.weight), 0);
  if (Math.abs(projectedTotal - 100) >= 0.01) {
    return json({
      error: `Active KRA weights must total exactly 100% (submitted total: ${Math.round(projectedTotal * 100) / 100}%).`,
    }, 400);
  }

  for (const [id, weight] of Object.entries(weights)) {
    const kra = orgKras.find((k) => k.id === id)!;
    const oldWeight = kra.weight;
    if (oldWeight === Number(weight)) continue;
    kra.weight = Number(weight);

    db.addAuditLog({
      organizationId: orgId,
      ...ctx.actor(),
      action: 'BULK_UPDATE_KRA_WEIGHT',
      entity: 'KRA',
      entityId: kra.id,
      oldValue: `${oldWeight}%`,
      newValue: `${kra.weight}%`,
      reason: reason || 'Weight balancing',
    });
  }

  return json({
    success: true,
    totalWeight: projectedTotal,
    isValid: true,
    kras: db.getKRAs(orgId),
  });
});
