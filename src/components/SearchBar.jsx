import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="sticky top-0 z-40 bg-var(--bg)/95 backdrop-blur-sm border-b border-var(--border) px-4 py-4" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Explore Menu Title */}
        <h2 
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Explore Menu
        </h2>
        
        {/* Search Input */}
        <div className="relative max-w-md">
          <Search 
            size={20} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            style={{ 
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchBar;