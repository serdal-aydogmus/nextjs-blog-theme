import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { requireAuth } from '../../../../lib/admin-auth';

const POSTS_PATH = path.join(process.cwd(), 'posts');

export default requireAuth(function handler(req, res) {
  const { slug } = req.query;
  const filePath = path.join(POSTS_PATH, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Yazı bulunamadı' });

  if (req.method === 'GET') {
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(source);
    return res.status(200).json({ slug, ...data, content: content.trim() });
  }

  if (req.method === 'PUT') {
    const { title, description, date, category, image, content } = req.body;
    const frontmatter = { title, description, date, category, image };
    Object.keys(frontmatter).forEach((k) => { if (!frontmatter[k]) delete frontmatter[k]; });

    fs.writeFileSync(filePath, matter.stringify(content || '', frontmatter));
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    fs.unlinkSync(filePath);
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
});
