import { revokedTokens, SESSION_TTL_MS } from '@/src/server/auth';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = withAuth((ctx) => {
  const token = ctx.sessionToken;
  if (token) {
    const now = Date.now();
    for (const [t, exp] of revokedTokens) if (exp < now) revokedTokens.delete(t);
    revokedTokens.set(token, now + SESSION_TTL_MS);
  }
  return json({ success: true });
});

// Methods this path does not implement fall through to the API 404, as in the Express app
export { apiNotFound as GET, apiNotFound as PUT, apiNotFound as PATCH, apiNotFound as DELETE } from '@/src/server/http';
