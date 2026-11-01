// Route-handler wrappers equivalent to the former Express middleware stack:
// session resolution, requireAuth, requireAdmin and the actor() audit identity.
import { NextResponse } from 'next/server';

import { db } from './db';
import { isAdminRole, sanitizeUser, verifySessionToken, type SessionUser } from './auth';
import type { UserRole } from '../types';

export type Query = Record<string, string | undefined>;

export interface HandlerContext<P = {}> {
  req: Request;
  user: SessionUser;
  userId: string;
  userRole: UserRole;
  organizationId: string;
  sessionToken: string;
  actor: () => { userId: string; userName: string; userRole: UserRole };
  body: any;
  query: Query;
  params: P;
}

type Handler<P> = (ctx: HandlerContext<P>) => Response | Promise<Response>;
type RouteSegment<P> = { params: Promise<P> };

export const UNAUTHORIZED_ERROR = 'Unauthorized: Your session has expired or is invalid. Please sign in again.';

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

// Equivalent of express.json(): an absent or unparseable body becomes {}
export async function readJsonBody(req: Request): Promise<any> {
  const parsed = await req.json().catch(() => ({}));
  return parsed && typeof parsed === 'object' ? parsed : {};
}

// Session authentication: the organization is always taken from the verified session, never from a client header
export function resolveSession(req: Request) {
  const authHeader = req.headers.get('authorization');
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  } else if (req.headers.get('x-session-token')) {
    token = String(req.headers.get('x-session-token'));
  }

  const claims = token ? verifySessionToken(token) : null;
  // Always resolve the user fresh from the directory so role changes apply immediately
  const dbUser = claims ? db.getState().users.find((u) => u.id === claims.uid) : undefined;
  const user = dbUser ? sanitizeUser(dbUser) : null;

  return {
    user,
    userId: user?.id ?? null,
    userRole: user?.role ?? null,
    sessionToken: user ? token : null,
    organizationId: user?.organizationId ?? (req.headers.get('x-organization-id') || 'org-apex-01'),
  };
}

function readQuery(req: Request): Query {
  const query: Query = {};
  for (const [key, value] of new URL(req.url).searchParams) {
    if (query[key] === undefined) query[key] = value;
  }
  return query;
}

function wrap<P>(handler: Handler<P>, adminOnly: boolean) {
  return async (req: Request, segment: RouteSegment<P>): Promise<Response> => {
    const session = resolveSession(req);
    if (!session.user) {
      return json({ error: UNAUTHORIZED_ERROR }, 401);
    }
    // Strict role guard for Admin / HOD governance endpoints
    if (adminOnly && !isAdminRole(session.userRole)) {
      return json({ error: 'Forbidden: This action requires Head of Department (LEGAL_HEAD) or SUPER_ADMIN authorization.' }, 403);
    }

    const user = session.user;
    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    return handler({
      req,
      user,
      userId: user.id,
      userRole: user.role,
      organizationId: session.organizationId,
      sessionToken: session.sessionToken!,
      // Audit identity of the authenticated caller
      actor: () => ({ userId: user.id, userName: user.name, userRole: user.role }),
      body: hasBody ? await readJsonBody(req) : {},
      query: readQuery(req),
      params: segment?.params ? await segment.params : ({} as P),
    });
  };
}

export function withAuth<P = {}>(handler: Handler<P>) {
  return wrap(handler, false);
}

export function withAdmin<P = {}>(handler: Handler<P>) {
  return wrap(handler, true);
}
