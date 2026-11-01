import { db } from '@/src/server/db';
import { passwordsMatch, sanitizeUser, signSessionToken } from '@/src/server/auth';
import { json, readJsonBody } from '@/src/server/http';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Authentication: login by corporate email (or its local part) and exact password
export async function POST(req: Request) {
  const { email, password } = (await readJsonBody(req)) || {};
  const state = db.getState();

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
    return json({ error: 'Email and password are required' }, 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  const user = state.users.find((u) => {
    const uEmail = u.email.toLowerCase();
    return uEmail === cleanEmail || uEmail.split('@')[0] === cleanEmail;
  });

  // Same message for unknown user and wrong password so accounts cannot be enumerated
  if (!user || !user.password || !passwordsMatch(cleanPass, user.password)) {
    return json({ error: 'Invalid email or password.' }, 401);
  }

  const token = signSessionToken(user.id);
  const safeUser = sanitizeUser(user);

  db.addAuditLog({
    organizationId: user.organizationId,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action: 'LOGIN',
    entity: 'USER_SESSION',
    entityId: user.id,
    newValue: `${user.name} (${user.designation}) authenticated successfully via corporate credentials`,
  });

  return json({ success: true, user: safeUser, token });
}
