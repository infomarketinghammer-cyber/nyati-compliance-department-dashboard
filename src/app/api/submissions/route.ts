import { db } from '@/src/server/db';
import { json, withAuth } from '@/src/server/http';
import { getLockedPeriodError, isFiniteNumber } from '@/src/server/routeHelpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Hierarchical Submissions & Approvals API (Staff -> Reporting Manager -> HOD)
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const { employeeId, managerId, periodId } = ctx.query as {
    employeeId?: string;
    managerId?: string;
    periodId?: string;
  };

  const submissions = db.getSubmissions(orgId, {
    employeeId,
    managerId,
    periodId,
    currentUserId: currentUser.id,
  });

  // Evidence FILE contents are restricted to the submitter, their direct manager, the HOD, and SUPER_ADMIN / AUDITOR
  const sanitized = submissions.map((s) => {
    const isOwner = s.employeeId === currentUser.id;
    const isDirectManager = s.managerId === currentUser.id;
    const isHOD = currentUser.level === 1 && (currentUser.role === 'LEGAL_HEAD' || currentUser.role === 'MANAGEMENT');
    const isAdminOrAuditor = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'AUDITOR';

    const canAccessFile = isOwner || isDirectManager || isHOD || isAdminOrAuditor;

    return {
      ...s,
      document: {
        ...s.document,
        fileData: canAccessFile ? s.document.fileData : '',
        isRestricted: !canAccessFile,
      },
    };
  });

  return json(sanitized);
});

// Submit KRA deliverable with real evidence file upload
export const POST = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const currentUser = ctx.user;
  const state = db.getState();
  const data = ctx.body || {};

  if (data.employeeId && data.employeeId !== currentUser.id && currentUser.role !== 'SUPER_ADMIN') {
    return json({
      error: 'Forbidden: You cannot submit deliverables on behalf of another employee.',
    }, 403);
  }

  const employee = state.users.find((u) => u.id === currentUser.id) || currentUser;
  const manager = employee.managerId ? state.users.find((u) => u.id === employee.managerId) : undefined;
  if (!manager || manager.id === employee.id) {
    return json({
      error: 'You have no reporting manager in the org chart to approve deliverables. Record KPI actuals via Reconciliation instead.',
    }, 400);
  }

  const kpi = state.kpis.find((k) => k.id === data.kpiId && k.organizationId === orgId);
  if (!kpi) {
    return json({ error: 'KPI deliverable not found.' }, 404);
  }

  const periodId = data.periodId || 'period-2026-09';
  const lockErr = getLockedPeriodError(orgId, periodId);
  if (lockErr) return json({ error: lockErr.error }, lockErr.status);

  // Employees can only submit against their assigned KPIs
  const isAssigned =
    kpi.ownerId === currentUser.id ||
    currentUser.assignedKpis?.includes(kpi.id) ||
    currentUser.assignedKras?.includes(kpi.kraId) ||
    (currentUser.level === 2 && (kpi.wing === currentUser.wing || kpi.department === currentUser.department)) ||
    currentUser.role === 'SUPER_ADMIN';

  if (!isAssigned) {
    return json({
      error: `Forbidden: KPI ${kpi.kpiCode} (${kpi.name}) is not assigned to you. You can only submit deliverables for your own assigned KPIs.`,
    }, 403);
  }

  if (!isFiniteNumber(data.achievedValue)) {
    return json({ error: 'Achieved value must be a number.' }, 400);
  }

  // Real evidence upload is mandatory
  const fileData = data.fileData || data.document?.fileData;
  const fileName = data.fileName || data.document?.fileName;
  if (!fileName || !fileData || typeof fileData !== 'string' || !fileData.startsWith('data:')) {
    return json({
      error: 'A real verification evidence document must be uploaded to submit a deliverable.',
    }, 400);
  }

  const duplicatePending = state.submissions.find(
    (s) => s.employeeId === currentUser.id && s.kpiId === kpi.id && s.periodId === periodId && s.status === 'PENDING_APPROVAL'
  );
  if (duplicatePending) {
    return json({
      error: `You already have a pending submission for ${kpi.kpiCode} in this period. Wait for your manager's decision first.`,
    }, 409);
  }

  const kra = state.kras.find((kr) => kr.id === kpi.kraId);

  const newSub = {
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    organizationId: orgId,
    periodId,
    kpiId: kpi.id,
    kpiCode: kpi.kpiCode,
    kpiName: kpi.name,
    kraId: kpi.kraId,
    kraName: kra?.name || '',
    employeeId: currentUser.id,
    employeeName: currentUser.name,
    employeeDesignation: currentUser.designation,
    employeeLevel: currentUser.level || 3,
    department: currentUser.department,
    wing: currentUser.wing,
    managerId: manager.id,
    managerName: manager.name,
    achievedValue: Number(data.achievedValue),
    targetValue: kpi.targetValue,
    unit: kpi.unit || 'units',
    notes: data.notes || '',
    submittedDate: new Date().toISOString().slice(0, 10),
    document: {
      fileName,
      fileType: data.fileType || data.document?.fileType || 'PDF',
      fileSize: data.fileSize || data.document?.fileSize || '',
      fileData,
      description: data.notes || data.description || data.document?.description || '',
    },
    status: 'PENDING_APPROVAL' as const,
    pointsAwarded: 0,
    maxPoints: 100,
  };

  const saved = db.addSubmission(newSub);
  return json(saved, 201);
});
