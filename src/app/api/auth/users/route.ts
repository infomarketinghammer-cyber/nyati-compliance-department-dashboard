import { db } from '@/src/server/db';
import { sanitizeUser } from '@/src/server/auth';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Employee directory (WITHOUT passwords)
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const safeUsers = db.getState().users.filter((u) => u.organizationId === orgId).map(sanitizeUser);

  return json({
    users: safeUsers,
    count: safeUsers.length,
    head: safeUsers.find((u) => u.role === 'LEGAL_HEAD'),
    managers: safeUsers.filter((u) => u.role === 'LEGAL_MANAGER'),
    team: safeUsers.filter((u) => u.role === 'LEGAL_EXECUTIVE'),
  });
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as POST, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
