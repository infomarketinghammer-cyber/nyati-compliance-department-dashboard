import { db } from '@/src/server/db';
import { json, withAuth } from '@/src/server/http';
import { canActOnSubmission } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manager Approval endpoint with strict reporting hierarchy authorization
export const POST = withAuth<{ id: string }>((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const { remarks } = ctx.body || {};

  const sub = db.getState().submissions.find((s) => s.id === ctx.params.id && s.organizationId === orgId);
  if (!sub) {
    return json({ error: 'Submission not found' }, 404);
  }

  if (!canActOnSubmission(currentUser, sub)) {
    return json({
      error: `Forbidden: Only the designated reporting manager (${sub.managerName}) or Head of Department can approve this deliverable, and never your own.`,
    }, 403);
  }

  const approverName = `${currentUser.name} (${currentUser.designation})`;
  try {
    const result = db.approveSubmission(sub.id, currentUser, approverName, remarks);
    return json({ success: true, ...result });
  } catch (err: any) {
    return json({ error: err.message }, 409);
  }
});
