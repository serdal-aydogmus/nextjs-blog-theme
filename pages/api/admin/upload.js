import fs from 'fs';
import path from 'path';
import { requireAuth } from '../../../lib/admin-auth';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default requireAuth(function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { filename, data } = req.body;
  if (!filename || !data) return res.status(400).json({ error: 'filename ve data zorunludur' });

  const base64 = data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64, 'base64');

  const safe = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '-');
  const uploadDir = path.join(process.cwd(), 'public', 'images', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  fs.writeFileSync(path.join(uploadDir, safe), buffer);
  return res.status(200).json({ url: `/images/uploads/${safe}` });
});
