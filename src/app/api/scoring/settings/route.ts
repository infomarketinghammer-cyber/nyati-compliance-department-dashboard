import { db } from '@/src/server/db';
import { json, withAdmin, withAuth } from '@/src/server/http';
import { isFiniteNumber } from '@/src/server/routeHelpers';
import type { ScoringSettings } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Scoring Settings API
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  return json(db.getScoringSettings(orgId));
});

export const PUT = withAdmin((ctx) => {
  const orgId = ctx.organizationId;
  const current = db.getScoringSettings(orgId);
  const body = ctx.body || {};
  const next: ScoringSettings = { ...current };

  for (const field of ['behindThreshold', 'atRiskThreshold', 'onTrackThreshold', 'maxAchievementCap', 'minAchievementFloor', 'roundingDecimals'] as const) {
    if (body[field] !== undefined) {
      if (!isFiniteNumber(body[field])) return json({ error: `${field} must be a number.` }, 400);
      (next as any)[field] = Number(body[field]);
    }
  }
  if (body.enforce100PercentWeight !== undefined) next.enforce100PercentWeight = Boolean(body.enforce100PercentWeight);

  if (!(next.behindThreshold > 0 && next.behindThreshold < next.atRiskThreshold && next.atRiskThreshold <= next.onTrackThreshold)) {
    return json({ error: 'Thresholds must satisfy 0 < Behind < At Risk ≤ On Track.' }, 400);
  }
  if (next.onTrackThreshold > 200) return json({ error: 'On Track threshold cannot exceed 200%.' }, 400);
  if (next.maxAchievementCap < 100 || next.maxAchievementCap > 200) {
    return json({ error: 'Maximum achievement cap must be between 100% and 200%.' }, 400);
  }
  if (next.minAchievementFloor < 0 || next.minAchievementFloor >= next.behindThreshold) {
    return json({ error: 'Achievement floor must be at least 0 and below the Behind threshold.' }, 400);
  }
  if (!Number.isInteger(next.roundingDecimals) || next.roundingDecimals < 0 || next.roundingDecimals > 4) {
    return json({ error: 'Decimal precision must be a whole number from 0 to 4.' }, 400);
  }

  const updated = db.updateScoringSettings(orgId, next);

  db.addAuditLog({
    organizationId: orgId,
    ...ctx.actor(),
    action: 'UPDATE_SCORING_SETTINGS',
    entity: 'SCORING_CONFIG',
    oldValue: JSON.stringify(current),
    newValue: JSON.stringify(updated),
  });

  return json(updated);
});
