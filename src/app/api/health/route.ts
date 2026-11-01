import { json } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Health check
export function GET() {
  return json({ status: 'ok', timestamp: new Date().toISOString() });
}
