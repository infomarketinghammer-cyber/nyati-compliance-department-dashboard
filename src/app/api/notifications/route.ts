import { db } from '@/src/server/db';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Notifications API
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  return json(db.getState().notifications.filter((n) => n.organizationId === orgId));
});
