import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth((ctx) => {
  return json({ user: ctx.user });
});
