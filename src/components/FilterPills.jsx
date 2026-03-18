import React from 'react';

const FilterPills = ({ categories, activeCategory, onCategoryChange }) => {
  const allCategories = ['All', ...categories];

  return (
    <div 
      className="sticky z-30 bg-var(--bg)/95 backdrop-blur-sm px-4 py-4 border-b"
      style={{ 
        backgroundColor: 'var(--bg)', 
        borderColor: 'var(--border)',
        top: '140px' // Approximate height of SearchBar with title and input
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 focus-visible
                min-h-[44px] flex items-center justify-center
                ${activeCategory === category 
                  ? 'text-white shadow-md' 
                  : 'text-var(--text-secondary) hover:text-var(--text-primary)'
                }
              `}
              style={{
                backgroundColor: activeCategory === category 
                  ? 'var(--accent)' 
                  : 'var(--card-bg)',
                color: activeCategory === category 
                  ? 'white' 
                  : 'var(--text-secondary)'
              }}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPills;