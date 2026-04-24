import { createToken } from '../../../lib/admin-auth';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = createToken(username);
      res.setHeader(
        'Set-Cookie',
        `admin_token=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Strict`
      );
      return res.status(200).json({ ok: true });
    }
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', 'admin_token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
}
