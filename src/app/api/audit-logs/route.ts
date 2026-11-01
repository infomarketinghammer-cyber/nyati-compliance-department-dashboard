import { db } from '@/src/server/db';
import { isAdminRole } from '@/src/server/auth';
import { json, withAuth } from '@/src/server/http';
import type { UserRole } from '@/src/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Audit Logs API (governance roles only)
export const GET = withAuth((ctx) => {
  const role = ctx.userRole as UserRole;
  if (!isAdminRole(role) && role !== 'AUDITOR' && role !== 'MANAGEMENT') {
    return json({ error: 'Forbidden: The audit trail is restricted to HOD, administrators and auditors.' }, 403);
  }
  const orgId = ctx.organizationId;
  return json(db.getState().auditLogs.filter((l) => l.organizationId === orgId));
});
