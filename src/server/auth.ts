import crypto from 'crypto';

import type { UserRole } from '../types';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  level: 1 | 2 | 3;
  designation: string;
  department?: string;
  wing?: string;
  managerId?: string | null;
  managerName?: string | null;
  subordinateIds?: string[];
  assignedKras?: string[];
  assignedKpis?: string[];
  organizationId: string;
}

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

// Sessions are stateless HMAC-signed tokens so they stay valid across server restarts and across
// multiple hosted instances (Cloud Run / AI Studio), where an in-memory session map is not shared.
// The signing key must be identical on every instance: SESSION_SECRET, else derived from GEMINI_API_KEY.
const SESSION_SECRET = (() => {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (process.env.GEMINI_API_KEY) {
    return crypto.createHash('sha256').update(`compliance-dashboard-session:${process.env.GEMINI_API_KEY}`).digest('hex');
  }
  console.warn('[auth] SESSION_SECRET is not set; using an insecure development signing key. Set SESSION_SECRET in production.');
  return 'compliance-dashboard-insecure-dev-session-key';
})();

// Tokens revoked by logout on this instance (best effort; tokens also expire after SESSION_TTL_MS).
// Cached on globalThis so Next.js dev hot reloads do not forget revocations.
const globalForAuth = globalThis as unknown as { __revokedTokens?: Map<string, number> };
export const revokedTokens = (globalForAuth.__revokedTokens ??= new Map<string, number>());

export function signSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL_MS, n: crypto.randomBytes(8).toString('hex') })).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string): { uid: string; exp: number } | null {
  const [payload, sig] = token.split('.');
  if (!payload || !sig) return null;
  const expected = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest();
  const given = Buffer.from(sig, 'base64url');
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof data.uid !== 'string' || typeof data.exp !== 'number' || data.exp < Date.now()) return null;
    if (revokedTokens.has(token)) return null;
    return data;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: any): SessionUser {
  const { password: _, ...safeUser } = user;
  return safeUser as SessionUser;
}

function hashPassword(raw: string): Buffer {
  return crypto.createHash('sha256').update(raw).digest();
}

export function passwordsMatch(input: string, stored: string): boolean {
  return crypto.timingSafeEqual(hashPassword(input), hashPassword(stored));
}

export function isAdminRole(role: UserRole | null | undefined) {
  return role === 'LEGAL_HEAD' || role === 'SUPER_ADMIN';
}
