import { supabase } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/admin-auth';

export default requireAuth(async function handler(req, res) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select('slug, title, description, date, category, image')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'POST') {
    const { slug, title, description, date, category, image, content } = req.body;
    if (!slug || !title) return res.status(400).json({ error: 'slug ve title zorunludur' });

    const { error } = await supabase
      .from('posts')
      .insert({ slug, title, description, date, category, image, content: content || '' });

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Bu slug zaten kullanımda' });
      return res.status(500).json({ error: error.message });
    }

    return res.status(201).json({ ok: true, slug });
  }

  res.status(405).end();
});
