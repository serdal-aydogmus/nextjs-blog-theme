import { useState, useMemo, useRef } from 'react';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import remarkGfm from 'remark-gfm';
import rehypePrism from '@mapbox/rehype-prism';
import { getPosts } from '../utils/mdx-utils';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Layout, { GradientBackground } from '../components/Layout';
import { getGlobalData } from '../utils/global-data';
import SEO from '../components/SEO';

export default function Index({ posts, globalData }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [openSlug, setOpenSlug] = useState(null);
  const cardRefs = useRef({});

  const closeCard = (slug) => {
    const el = cardRefs.current[slug];
    const absoluteTop = el ? el.getBoundingClientRect().top + window.scrollY : null;
    setOpenSlug(null);
    if (absoluteTop !== null) {
      setTimeout(() => {
        window.scrollTo({ top: absoluteTop - 24, behavior: 'smooth' });
      }, 30);
    }
  };

  const categories = useMemo(() => {
    const set = new Set();
    posts.forEach(p => { if (p.data.category) set.add(p.data.category); });
    return Array.from(set).sort();
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter(p => p.data.category === selectedCategory);
  }, [posts, selectedCategory]);

  const toggle = (slug) => setOpenSlug(prev => prev === slug ? null : slug);

  return (
    <Layout>
      <SEO title={globalData.name} description={globalData.blogTitle} />
      <Header
        name={globalData.name}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />
      <main className="w-full">
        <h1 className="text-3xl lg:text-5xl text-center mb-12">{globalData.blogTitle}</h1>
        <ul className="w-full">
          {filteredPosts.map((post) => {
            const slug = post.filePath.replace(/\.mdx?$/, '');
            const isOpen = openSlug === slug;

            return (
              <li
                key={post.filePath}
                ref={el => { cardRefs.current[slug] = el; }}
                className={`md:first:rounded-t-lg md:last:rounded-b-lg backdrop-blur-md bg-white dark:bg-black dark:bg-opacity-60 bg-opacity-75 border border-gray-800 dark:border-white border-opacity-10 dark:border-opacity-10 border-b-0 last:border-b hovered-sibling:border-t-0 transition-all duration-500 ${
                  openSlug && !isOpen ? 'opacity-30 blur-sm pointer-events-none' : ''
                }`}
              >
                {/* Summary — click to toggle */}
                <div
                  onClick={() => toggle(slug)}
                  className="flex items-stretch gap-4 p-4 sm:gap-5 sm:p-5 md:gap-6 md:p-6 cursor-pointer select-none"
                >
                  <div className="flex-1 min-w-0 flex flex-col">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.data.date && (
                        <p className="uppercase font-bold opacity-60 text-xs sm:text-sm">{post.data.date}</p>
                      )}
                      {post.data.category && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {post.data.category}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl leading-snug">{post.data.title}</h2>
                    {post.data.description && (
                      <p className="mt-2 text-sm sm:text-base opacity-60 flex-1 overflow-hidden">
                        {post.data.description}
                      </p>
                    )}
                  </div>
                  {post.data.image && (
                    <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 self-center">
                      <img
                        src={post.data.image}
                        alt={post.data.title}
                        className="w-full h-full object-cover rounded-xl post-thumbnail"
                      />
                    </div>
                  )}
                </div>

                {/* Expand indicator — only shown when collapsed */}
                {!isOpen && (
                  <div className="flex justify-center pb-3 -mt-1 opacity-40 hover:opacity-70 transition-opacity pointer-events-none">
                    <svg viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-5 text-gray-500 dark:text-gray-400">
                      <polyline points="4 4 20 16 36 4" />
                    </svg>
                  </div>
                )}

                {/* Expandable content */}
                <div className="accordion-content" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 md:px-10 pt-6 pb-4 border-t border-gray-200 dark:border-gray-700">
                      <article className="prose dark:prose-dark max-w-none prose-sm sm:prose-base">
                        {post.mdxSource && <MDXRemote {...post.mdxSource} />}
                      </article>
                    </div>
                    <div className="flex justify-center py-5">
                      <button
                        onClick={() => closeCard(slug)}
                        aria-label="Kapat"
                        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-500 dark:text-gray-300"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {filteredPosts.length === 0 && selectedCategory && (
          <div className="text-center py-12">
            <p className="text-lg opacity-60">
              &quot;{selectedCategory}&quot; kategorisinde henüz gönderi bulunmuyor.
            </p>
          </div>
        )}
      </main>
      <Footer copyrightText={globalData.footerText} />
      <GradientBackground variant="large" className="fixed top-20 opacity-40 dark:opacity-60" />
      <GradientBackground variant="small" className="absolute bottom-0 opacity-20 dark:opacity-10" />
    </Layout>
  );
}

export async function getStaticProps() {
  const posts = getPosts();
  const globalData = getGlobalData();

  const postsWithContent = await Promise.all(
    posts.map(async (post) => {
      const mdxSource = await serialize(post.content || '', {
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [rehypePrism],
        },
      });
      return { ...post, mdxSource };
    })
  );

  return { props: { posts: postsWithContent, globalData } };
}
