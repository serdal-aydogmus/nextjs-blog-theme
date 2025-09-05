import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Header({ name, categories = [], selectedCategory, onCategoryChange }) {
  const router = useRouter();

  const handleCategoryClick = (category) => {
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <header className="pt-20 pb-12">
      <div className="w-12 h-12 rounded-full block mx-auto mb-4 bg-gradient-conic from-gradient-3 to-gradient-4" style={{ display: 'none' }} />
      <p className="text-2xl dark:text-white text-center mb-8">
        <Link href="/">
          <a>{name}</a>
        </Link>
      </p>
      
      {/* Category Navigation */}
      {categories.length > 0 && (
        <nav className="flex flex-wrap justify-center gap-2 md:gap-4 px-4">
          <button
            onClick={() => handleCategoryClick(null)}
            className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base transition-all duration-200 ${
              !selectedCategory
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Tümü
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`px-3 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base transition-all duration-200 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {category}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
