import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getPosts } from '../utils/mdx-utils';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Layout, { GradientBackground } from '../components/Layout';
import { getGlobalData } from '../utils/global-data';
import SEO from '../components/SEO';

export default function Index({ posts, globalData }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Get unique categories from posts
  const categories = useMemo(() => {
    const categorySet = new Set();
    posts.forEach(post => {
      if (post.data.category) {
        categorySet.add(post.data.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [posts]);

  // Filter posts based on selected category
  const filteredPosts = useMemo(() => {
    if (!selectedCategory) return posts;
    return posts.filter(post => post.data.category === selectedCategory);
  }, [posts, selectedCategory]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <Layout>
      <SEO title={globalData.name} description={globalData.blogTitle} />
      <Header 
        name={globalData.name} 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />
      <main className="w-full">
        <h1 className="text-3xl lg:text-5xl text-center mb-12">
          {globalData.blogTitle}
        </h1>
        <ul className="w-full">
          {filteredPosts.map((post) => (
            <li
              key={post.filePath}
              className="md:first:rounded-t-lg md:last:rounded-b-lg backdrop-blur-md bg-white dark:bg-black dark:bg-opacity-60 bg-opacity-75 hover:bg-opacity-90 dark:hover:bg-opacity-75 transition border border-gray-800 dark:border-white border-opacity-10 dark:border-opacity-10 border-b-0 last:border-b hover:border-b hovered-sibling:border-t-0"
            >
              <Link
                as={`/posts/${post.filePath.replace(/\.mdx?$/, '')}`}
                href={`/posts/[slug]`}
              >
                <a className="flex items-center gap-4 p-4 sm:gap-5 sm:p-5 md:gap-6 md:p-6 focus:outline-none focus:ring-4">
                  <div className="flex-1 min-w-0">
                    {post.data.category && (
                      <span className="inline-block px-2 py-0.5 mb-2 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        {post.data.category}
                      </span>
                    )}
                    {post.data.date && (
                      <p className="uppercase mb-1 font-bold opacity-60 text-xs sm:text-sm">
                        {post.data.date}
                      </p>
                    )}
                    <h2 className="text-lg sm:text-xl md:text-2xl leading-snug">{post.data.title}</h2>
                    {post.data.description && (
                      <p className="mt-2 text-sm sm:text-base opacity-60 line-clamp-2">
                        {post.data.description}
                      </p>
                    )}
                  </div>
                  {post.data.image && (
                    <div className="flex-shrink-0 w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-40">
                      <img
                        src={post.data.image}
                        alt={post.data.title}
                        className="w-full h-full object-cover rounded-xl post-thumbnail"
                      />
                    </div>
                  )}
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Show message when no posts match filter */}
        {filteredPosts.length === 0 && selectedCategory && (
          <div className="text-center py-12">
            <p className="text-lg opacity-60">
              &quot;{selectedCategory}&quot; kategorisinde henüz gönderi bulunmuyor.
            </p>
          </div>
        )}
      </main>
      <Footer copyrightText={globalData.footerText} />
      <GradientBackground
        variant="large"
        className="fixed top-20 opacity-40 dark:opacity-60"
      />
      <GradientBackground
        variant="small"
        className="absolute bottom-0 opacity-20 dark:opacity-10"
      />
    </Layout>
  );
}

export function getStaticProps() {
  const posts = getPosts();
  const globalData = getGlobalData();

  return { props: { posts, globalData } };
}
