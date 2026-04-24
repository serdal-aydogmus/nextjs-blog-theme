import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/posts')
      .then((r) => {
        if (r.status === 401) { router.push('/admin/login'); return null; }
        return r.json();
      })
      .then((data) => { if (data) { setPosts(data); setLoading(false); } });
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
  };

  const handleDelete = async (slug, title) => {
    if (!confirm(`"${title}" yazısını silmek istediğinize emin misiniz?`)) return;
    const res = await fetch(`/api/admin/posts/${slug}`, { method: 'DELETE' });
    if (res.ok) setPosts((p) => p.filter((post) => post.slug !== slug));
  };

  return (
    <>
      <Head><title>Admin — Yazılar</title></Head>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Yazılar</h1>
              <Link href="/"><a className="text-sm text-indigo-500 hover:underline">← Siteye dön</a></Link>
            </div>
            <div className="flex gap-3">
              <Link href="/admin/posts/new">
                <a className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                  + Yeni Yazı
                </a>
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Çıkış
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow overflow-hidden">
            {loading ? (
              <p className="p-12 text-center text-gray-400">Yükleniyor...</p>
            ) : posts.length === 0 ? (
              <p className="p-12 text-center text-gray-400">Henüz yazı yok.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Başlık</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden md:table-cell">Tarih</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide hidden sm:table-cell">Kategori</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {posts.map((post) => (
                    <tr key={post.slug} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{post.title}</p>
                        <p className="text-xs text-gray-400 font-mono mt-0.5">{post.slug}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">{post.date}</td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        {post.category && (
                          <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                            {post.category}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Link href={`/admin/posts/${post.slug}`}>
                            <a className="text-xs px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 font-medium">
                              Düzenle
                            </a>
                          </Link>
                          <button
                            onClick={() => handleDelete(post.slug, post.title)}
                            className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 font-medium"
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
