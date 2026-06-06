import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { requireAuth } from '../../../../lib/admin-auth';
import { ghGetFile, ghUpdateFile, ghDeleteFile } from '../../../../lib/github-posts';

const POSTS_PATH = path.join(process.cwd(), 'posts');

export default requireAuth(async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    const filePath = path.join(POSTS_PATH, `${slug}.mdx`);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Yazı bulunamadı' });
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(source);
    return res.status(200).json({ slug, ...data, content: content.trim() });
  }

  if (req.method === 'PUT') {
    const { title, description, date, category, image, content } = req.body;

    const ghFile = await ghGetFile(slug);
    if (!ghFile) return res.status(404).json({ error: 'Yazı bulunamadı' });

    const frontmatter = { title, description, date, category, image };
    Object.keys(frontmatter).forEach((k) => { if (!frontmatter[k]) delete frontmatter[k]; });
    const fileContent = matter.stringify(content || '', frontmatter);

    const resp = await ghUpdateFile(slug, fileContent, ghFile.sha);
    if (!resp.ok) {
      const err = await resp.json();
      return res.status(500).json({ error: err.message || 'GitHub yazma hatası' });
    }

    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const ghFile = await ghGetFile(slug);
    if (!ghFile) return res.status(404).json({ error: 'Yazı bulunamadı' });

    const resp = await ghDeleteFile(slug, ghFile.sha);
    if (!resp.ok) {
      const err = await resp.json();
      return res.status(500).json({ error: err.message || 'GitHub silme hatası' });
    }

    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
});
