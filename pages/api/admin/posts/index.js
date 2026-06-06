import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { requireAuth } from '../../../../lib/admin-auth';
import { ghCreateFile, ghGetFile } from '../../../../lib/github-posts';

const POSTS_PATH = path.join(process.cwd(), 'posts');

export default requireAuth(async function handler(req, res) {
  if (req.method === 'GET') {
    const files = fs.readdirSync(POSTS_PATH).filter((f) => /\.mdx?$/.test(f));
    const posts = files.map((file) => {
      const source = fs.readFileSync(path.join(POSTS_PATH, file), 'utf8');
      const { data } = matter(source);
      return { slug: file.replace(/\.mdx?$/, ''), ...data };
    });
    return res.status(200).json(posts);
  }

  if (req.method === 'POST') {
    const { slug, title, description, date, category, image, content } = req.body;
    if (!slug || !title) return res.status(400).json({ error: 'slug ve title zorunludur' });

    const existing = await ghGetFile(slug);
    if (existing) return res.status(409).json({ error: 'Bu slug zaten kullanımda' });

    const frontmatter = { title, description, date, category, image };
    Object.keys(frontmatter).forEach((k) => { if (!frontmatter[k]) delete frontmatter[k]; });
    const fileContent = matter.stringify(content || '', frontmatter);

    const resp = await ghCreateFile(slug, fileContent);
    if (!resp.ok) {
      const err = await resp.json();
      return res.status(500).json({ error: err.message || 'GitHub yazma hatası' });
    }

    return res.status(201).json({ ok: true, slug });
  }

  res.status(405).end();
});
