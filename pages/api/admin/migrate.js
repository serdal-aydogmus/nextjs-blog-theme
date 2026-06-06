import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { supabase } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/admin-auth';

const POSTS_PATH = path.join(process.cwd(), 'posts');

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const files = fs.readdirSync(POSTS_PATH).filter((f) => /\.mdx?$/.test(f));
  const results = [];

  for (const file of files) {
    const source = fs.readFileSync(path.join(POSTS_PATH, file), 'utf8');
    const { data, content } = matter(source);
    const slug = file.replace(/\.mdx?$/, '');

    const { error } = await supabase
      .from('posts')
      .upsert(
        { slug, title: data.title, description: data.description, date: data.date, category: data.category, image: data.image, content: content.trim() },
        { onConflict: 'slug' }
      );

    results.push({ slug, ok: !error, error: error?.message });
  }

  return res.status(200).json({ results });
});
