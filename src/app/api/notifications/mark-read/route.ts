import { db } from '@/src/server/db';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const id = ctx.body?.id;
  for (const n of db.getState().notifications) {
    if (n.organizationId === orgId && (!id || n.id === id)) {
      n.read = true;
    }
  }
  return json({ success: true });
});
