import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { requireAuth } from '../../../../lib/admin-auth';

const POSTS_PATH = path.join(process.cwd(), 'posts');

export default requireAuth(function handler(req, res) {
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

    const filePath = path.join(POSTS_PATH, `${slug}.mdx`);
    if (fs.existsSync(filePath)) return res.status(409).json({ error: 'Bu slug zaten kullanımda' });

    const frontmatter = { title, description, date, category, image };
    Object.keys(frontmatter).forEach((k) => { if (!frontmatter[k]) delete frontmatter[k]; });

    fs.writeFileSync(filePath, matter.stringify(content || '', frontmatter));
    return res.status(201).json({ ok: true, slug });
  }

  res.status(405).end();
});
