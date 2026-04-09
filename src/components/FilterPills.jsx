import React from 'react';

const FilterPills = ({ activeCategory, onCategoryChange }) => {
  const mainCategories = ['MENU', "Chef's Special"];

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
        <div className="flex gap-4 justify-center">
          {mainCategories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`
                flex-shrink-0 px-8 py-2 rounded-full text-sm font-semibold tracking-widest transition-all duration-300
                min-h-[48px] flex items-center justify-center uppercase
                ${activeCategory === category 
                  ? 'text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' 
                  : 'text-var(--text-secondary) hover:text-white border border-white/10'
                }
              `}
              style={{
                backgroundColor: activeCategory === category 
                  ? 'var(--accent)' 
                  : 'rgba(255,255,255,0.03)',
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