import { db } from '@/src/server/db';
import { sanitizeUser } from '@/src/server/auth';
import { json, withAuth } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Bootstrap initial configuration & metadata (WITHOUT passwords)
export const GET = withAuth((ctx) => {
  const orgId = ctx.organizationId;
  const state = db.getState();

  const org = state.organizations.find((o) => o.id === orgId) || state.organizations[0];
  const companies = state.companies.filter((c) => c.organizationId === org.id);
  const projects = state.projects.filter((p) => p.organizationId === org.id);
  const users = state.users.filter((u) => u.organizationId === org.id).map(sanitizeUser);
  const financialYears = state.financialYears.filter((f) => f.organizationId === org.id);
  const periods = state.periods.filter((p) => p.organizationId === org.id);
  const scoringSettings = db.getScoringSettings(org.id);

  const activePeriod = periods.find((p) => p.status === 'UNDER_REVIEW' || p.status === 'OPEN') || periods[periods.length - 1];

  return json({
    organization: org,
    allOrganizations: [org],
    companies,
    projects,
    users,
    financialYears,
    periods,
    activePeriod,
    scoringSettings,
  });
});
