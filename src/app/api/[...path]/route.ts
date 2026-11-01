import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Unknown API routes return a JSON 404 (after the session check, as the Express app did)
const notFound = withAuth((ctx) =>
  json({ error: `API route not found: ${ctx.req.method} ${new URL(ctx.req.url).pathname}` }, 404)
);

export { notFound as GET, notFound as POST, notFound as PUT, notFound as PATCH, notFound as DELETE };
