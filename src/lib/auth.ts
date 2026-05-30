import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'artistmeet.session';
const AUTH_SECRET = process.env.AUTH_SECRET ?? 'artistmeet-dev-secret';
const HASH_PREFIX = 'scrypt';

export type AuthSession = {
  userId: number;
  username: string;
  role: string;
};

function encodeBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(value: string) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(value).digest('base64url');
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString('base64url');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('base64url');
  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

export function verifyPassword(password: string, storedPassword: string) {
  if (storedPassword.startsWith(`${HASH_PREFIX}$`)) {
    const [, salt, derivedKey] = storedPassword.split('$');
    if (!salt || !derivedKey) {
      return false;
    }

    const comparisonKey = crypto.scryptSync(password, salt, Buffer.from(derivedKey, 'base64url').length).toString('base64url');
    return safeEqual(comparisonKey, derivedKey);
  }

  return safeEqual(password, storedPassword);
}

export function createSessionToken(session: AuthSession) {
  const payload = encodeBase64Url(JSON.stringify(session));
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null) {
  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(decodeBase64Url(payload)) as Partial<AuthSession>;
    if (typeof session.userId !== 'number' || typeof session.username !== 'string' || typeof session.role !== 'string') {
      return null;
    }

    return session as AuthSession;
  } catch {
    return null;
  }
}
