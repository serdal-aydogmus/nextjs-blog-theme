import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import PostForm from '../../../components/admin/PostForm';

export default function EditPost() {
  const [post, setPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/admin/posts/${slug}`)
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        if (!r.ok) { router.push('/admin'); return null; }
        return r.json();
      })
      .then((data) => { if (data) setPost(data); });
  }, [slug]);

  const handleSave = async (data) => {
    setSaving(true);
    setError('');

    const res = await fetch(`/api/admin/posts/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    setSaving(false);

    if (res.ok) {
      router.push('/admin');
    } else {
      const err = await res.json();
      setError(err.error || 'Kaydedilemedi');
    }
  };

  if (!post) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-gray-400">Yükleniyor...</p>
    </div>
  );

  return (
    <>
      <Head><title>Düzenle — {post.title}</title></Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/admin">
              <a className="text-sm text-indigo-500 hover:underline">← Yazılar</a>
            </Link>
            <span className="text-gray-300">/</span>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Düzenle</h1>
          </div>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
            <PostForm initial={post} onSave={handleSave} saving={saving} />
          </div>
        </div>
      </div>
    </>
  );
}
