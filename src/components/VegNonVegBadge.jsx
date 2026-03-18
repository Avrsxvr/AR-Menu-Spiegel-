import React from 'react';

const VegNonVegBadge = ({ type, className = '' }) => {
  const isVeg = type === 'veg';
  
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border-2 backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: isVeg ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)',
        borderColor: isVeg ? '#16a34a' : '#dc2626',
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Veg/Non-veg indicator symbol */}
      <div 
        className="w-3 h-3 rounded-sm flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
        style={{
          backgroundColor: isVeg ? '#16a34a' : '#dc2626',
          border: '1px solid white'
        }}
      >
        {isVeg ? '●' : '▲'}
      </div>
      <span className="text-xs font-bold tracking-wide">
        {isVeg ? 'VEG' : 'NON-VEG'}
      </span>
    </div>
  );
};

export default VegNonVegBadge;