import crypto from 'crypto';

const SECRET = process.env.ADMIN_SECRET || 'dev-secret-change-in-production';

export function createToken(username) {
  const payload = Buffer.from(
    JSON.stringify({ username, exp: Date.now() + 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

export function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;
  } catch {
    return null;
  }
  const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
  if (data.exp < Date.now()) return null;
  return data;
}

export function getAuthFromRequest(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/admin_token=([^;]+)/);
  if (!match) return null;
  return verifyToken(decodeURIComponent(match[1]));
}

export function requireAuth(handler) {
  return (req, res) => {
    if (!getAuthFromRequest(req)) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    return handler(req, res);
  };
}
