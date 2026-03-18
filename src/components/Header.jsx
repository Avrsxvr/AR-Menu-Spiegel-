import React from 'react';
import { Menu } from 'lucide-react';

const Header = ({ isVisible = true }) => {
  return (
    <header 
      className="bg-var(--bg) border-b border-var(--border) px-4 py-4"
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center">
          <img 
            src="/Images/Logo.png" 
            alt="Spiegel" 
            className="h-11 w-auto object-contain"
            style={{ maxHeight: '44px' }}
          />
        </div>
        
        <button
          className="p-2 rounded-lg transition-colors focus-visible bg-var(--card-bg)/50 hover:bg-var(--card-bg)"
          style={{ backgroundColor: 'var(--card-bg)' }}
          aria-label="Open menu"
        >
          <Menu size={24} color="var(--text-primary)" />
        </button>
      </div>
    </header>
  );
};

export default Header;