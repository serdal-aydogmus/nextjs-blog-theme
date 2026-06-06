import { supabase } from '../../../../lib/supabase';
import { requireAuth } from '../../../../lib/admin-auth';

export default requireAuth(async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return res.status(404).json({ error: 'Yazı bulunamadı' });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    const { title, description, date, category, image, content } = req.body;

    const { error } = await supabase
      .from('posts')
      .update({ title, description, date, category, image, content: content || '', updated_at: new Date().toISOString() })
      .eq('slug', slug);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('slug', slug);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ ok: true });
  }

  res.status(405).end();
});
