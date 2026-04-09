import React from 'react';

const VegNonVegBadge = ({ type, className = '' }) => {
  const isVeg = type === 'veg';
  const isBoth = type === 'both';
  
  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold border backdrop-blur-sm ${className}`}
      style={{
        backgroundColor: isBoth ? 'rgba(255, 255, 255, 0.1)' : (isVeg ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'),
        borderColor: isBoth ? 'rgba(255, 255, 255, 0.2)' : (isVeg ? '#16a34a' : '#dc2626'),
        color: 'white',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Indicator symbols */}
      <div className="flex gap-1 items-center">
        {(isVeg || isBoth) && (
          <div 
            className="w-2.5 h-2.5 rounded-sm flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: '#16a34a', border: '1px solid white' }}
          >
            <span className="text-[6px]">●</span>
          </div>
        )}
        {(type === 'non-veg' || isBoth) && (
          <div 
            className="w-2.5 h-2.5 rounded-sm flex items-center justify-center text-white flex-shrink-0"
            style={{ backgroundColor: '#dc2626', border: '1px solid white' }}
          >
            <span className="text-[6px]">▲</span>
          </div>
        )}
      </div>
      <span className="font-bold tracking-wide uppercase">
        {isBoth ? 'VEG & NON-VEG' : (isVeg ? 'VEG' : 'NON-VEG')}
      </span>
    </div>
  );
};

export default VegNonVegBadge;