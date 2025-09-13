import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getPosts } from '../utils/mdx-utils';

import Footer from '../components/Footer';
import Header from '../components/Header';
import Layout, { GradientBackground } from '../components/Layout';
import ArrowIcon from '../components/ArrowIcon';
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
              className="md:first:rounded-t-lg md:last:rounded-b-lg backdrop-blur-lg bg-white dark:bg-black dark:bg-opacity-30 bg-opacity-10 hover:bg-opacity-20 dark:hover:bg-opacity-50 transition border border-gray-800 dark:border-white border-opacity-10 dark:border-opacity-10 border-b-0 last:border-b hover:border-b hovered-sibling:border-t-0 relative"
            >
              {/* Category tag in top-right corner */}
              {post.data.category && (
                <div className="absolute top-4 right-4 md:top-6 md:right-6">
                  <span className="inline-block px-2 py-1 md:px-3 md:py-1 text-xs md:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    {post.data.category}
                  </span>
                </div>
              )}
              
              <Link
                as={`/posts/${post.filePath.replace(/\.mdx?$/, '')}`}
                href={`/posts/[slug]`}
              >
                <a className="py-6 lg:py-10 px-4 sm:px-6 lg:px-16 pr-16 sm:pr-20 md:pr-24 block focus:outline-none focus:ring-4">
                  {post.data.date && (
                    <p className="uppercase mb-3 font-bold opacity-60 text-sm sm:text-base">
                      {post.data.date}
                    </p>
                  )}
                  <h2 className="text-xl sm:text-2xl md:text-3xl pr-2 sm:pr-4 leading-tight">{post.data.title}</h2>
                  {post.data.description && (
                    <p className="mt-3 text-base sm:text-lg opacity-60 pr-2 sm:pr-4">
                      {post.data.description}
                    </p>
                  )}
                  <ArrowIcon className="mt-4" />
                </a>
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Show message when no posts match filter */}
        {filteredPosts.length === 0 && selectedCategory && (
          <div className="text-center py-12">
            <p className="text-lg opacity-60">
              "{selectedCategory}" kategorisinde henüz gönderi bulunmuyor.
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
