// Helpers shared by the /api route handlers (moved unchanged from the former Express app)
import { db } from './db';
import { calculateKPIAchievement } from './calculationEngine';
import type { SessionUser } from './auth';
import type { KPI, KPIMeasurement, PerformancePeriod, ScoringSettings } from '../types';

export const OPERATIONAL_ENTITIES = [
  'contracts',
  'compliances',
  'litigations',
  'notices',
  'risks',
  'dueDiligences',
  'approvals',
  'transactions',
  'tasks',
] as const;
export type OperationalEntity = (typeof OPERATIONAL_ENTITIES)[number];

// Minimum fields a new operational record must carry to be meaningful in registers and KPI calculation
export const OPERATIONAL_REQUIRED_FIELDS: Record<OperationalEntity, string[]> = {
  contracts: ['contractTitle', 'counterparty', 'contractType', 'status'],
  compliances: ['requirement', 'authority', 'dueDate', 'status'],
  litigations: ['caseNumber', 'court', 'parties', 'caseStatus', 'riskLevel'],
  notices: ['noticeType', 'direction', 'sender', 'dateReceived', 'status'],
  risks: ['description', 'riskCategory', 'probability', 'impact', 'status'],
  dueDiligences: ['propertyName', 'location', 'legalClearanceStatus'],
  approvals: ['approvalType', 'authority', 'applicationDate', 'status'],
  transactions: ['transactionTitle', 'transactionType', 'counterparty', 'status'],
  tasks: ['taskTitle', 'priority', 'dueDate', 'status'],
};

export const KPI_DIRECTIONS = ['HIGHER_IS_BETTER', 'LOWER_IS_BETTER', 'TARGET_RANGE', 'EXACT_TARGET'];

export const KRA_EDITABLE_FIELDS = ['name', 'description', 'ownerId', 'ownerName', 'weight', 'active', 'orderIndex', 'effectivePeriod', 'department', 'wing'] as const;
export const KPI_EDITABLE_FIELDS = [
  'kraId', 'kpiCode', 'name', 'description', 'ownerId', 'ownerName', 'department', 'wing', 'measurementType', 'unit',
  'frequency', 'direction', 'calculationMethod', 'dataSource', 'dataSourceMetric', 'weight', 'minAcceptableValue',
  'targetValue', 'maxCapValue', 'active', 'effectiveDate', 'endDate',
] as const;

export function pick<T extends object>(source: any, fields: readonly string[]): Partial<T> {
  const out: any = {};
  for (const f of fields) {
    if (source && source[f] !== undefined) out[f] = source[f];
  }
  return out;
}

export function isFiniteNumber(v: unknown): boolean {
  return v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v));
}

// Previous period of the same type (monthly/quarterly) ordered by start date, and a trailing trend window
export function getPeriodContext(orgId: string, periodId: string) {
  const state = db.getState();
  const current = state.periods.find((p) => p.id === periodId && p.organizationId === orgId);
  if (!current) return { current: undefined, previous: undefined, trendPeriods: [] as PerformancePeriod[] };
  const sameType = state.periods
    .filter((p) => p.organizationId === orgId && p.type === current.type)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const idx = sameType.findIndex((p) => p.id === current.id);
  return {
    current,
    previous: idx > 0 ? sameType[idx - 1] : undefined,
    trendPeriods: sameType.slice(Math.max(0, idx - 5), idx + 1),
  };
}

// Re-derive achievement/score/status from the stored actual so displayed values always reflect current KPI config & settings
export function withLiveCalculation(m: KPIMeasurement, kpis: KPI[], settings: ScoringSettings): KPIMeasurement {
  const kpi = kpis.find((k) => k.id === m.kpiId);
  if (!kpi) return m;
  const calc = calculateKPIAchievement(kpi, m.actual, kpi.targetValue, settings);
  return { ...m, target: kpi.targetValue, achievement: calc.achievement, weightedScore: calc.weightedScore, status: calc.status };
}

export const validateKpiPayload = (orgId: string, data: any, isCreate: boolean): string | null => {
  const state = db.getState();
  if (isCreate || data.name !== undefined) {
    if (!data.name || !String(data.name).trim()) return 'KPI name is required.';
  }
  if (isCreate || data.kraId !== undefined) {
    if (!state.kras.some((k) => k.id === data.kraId && k.organizationId === orgId)) return 'A valid parent KRA is required.';
  }
  if (data.direction !== undefined && !KPI_DIRECTIONS.includes(data.direction)) {
    return `Direction must be one of: ${KPI_DIRECTIONS.join(', ')}`;
  }
  if ((isCreate || data.targetValue !== undefined) && !isFiniteNumber(data.targetValue)) return 'Target value must be a number.';
  if (data.weight !== undefined && (!isFiniteNumber(data.weight) || Number(data.weight) <= 0 || Number(data.weight) > 100)) {
    return 'KPI weight must be a number between 1 and 100.';
  }
  if (data.minAcceptableValue !== undefined && data.minAcceptableValue !== null && !isFiniteNumber(data.minAcceptableValue)) {
    return 'Minimum acceptable value must be a number.';
  }
  if (data.maxCapValue !== undefined && data.maxCapValue !== null && (!isFiniteNumber(data.maxCapValue) || Number(data.maxCapValue) < 100)) {
    return 'Achievement cap must be a number of at least 100.';
  }
  if (data.kpiCode !== undefined) {
    const dup = state.kpis.find((k) => k.organizationId === orgId && k.kpiCode === data.kpiCode && k.id !== data.id);
    if (dup) return `KPI code ${data.kpiCode} is already used by "${dup.name}".`;
  }
  return null;
};

export const getLockedPeriodError = (orgId: string, periodId: string): { status: number; error: string } | null => {
  const period = db.getState().periods.find((p) => p.id === periodId && p.organizationId === orgId);
  if (!period) return { status: 404, error: 'Performance period not found.' };
  if (period.status === 'LOCKED') {
    return { status: 403, error: `${period.name} is LOCKED. Reopen the period with an authorized reason before changing it.` };
  }
  return null;
};

export const findPeriod = (orgId: string, periodId: string) =>
  db.getState().periods.find((p) => p.id === periodId && p.organizationId === orgId);

export const canActOnSubmission = (currentUser: SessionUser, sub: { managerId: string; employeeId: string }) => {
  if (sub.employeeId === currentUser.id) return false; // never self-approve
  const isDirectManager = sub.managerId === currentUser.id;
  const isHOD = currentUser.level === 1 && (currentUser.role === 'LEGAL_HEAD' || currentUser.role === 'MANAGEMENT');
  return isDirectManager || isHOD || currentUser.role === 'SUPER_ADMIN';
};

// Operational Registers API (whitelisted entities only)
export const resolveOperationalEntity = (entity: string): OperationalEntity | null =>
  OPERATIONAL_ENTITIES.includes(entity as OperationalEntity) ? (entity as OperationalEntity) : null;
