import crypto from 'crypto';
import { requireAuth } from '../../../lib/admin-auth';

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

function sign(params, secret) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + secret;
  return crypto.createHash('sha1').update(str).digest('hex');
}

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { data } = req.body;
  if (!data) return res.status(400).json({ error: 'data zorunludur' });

  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloud || !key || !secret) {
    return res.status(500).json({ error: 'Cloudinary ayarları eksik' });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'blog';
  const signature = sign({ folder, timestamp }, secret);

  const form = new FormData();
  form.append('file', data);
  form.append('timestamp', String(timestamp));
  form.append('api_key', key);
  form.append('signature', signature);
  form.append('folder', folder);

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    body: form,
  });

  const json = await resp.json();
  if (!resp.ok) return res.status(500).json({ error: json.error?.message || 'Yükleme başarısız' });

  return res.status(200).json({ url: json.secure_url });
});
