import React from 'react';

const SkeletonCard = () => {
  return (
    <article 
      className="rounded-2xl p-4"
      style={{ 
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)'
      }}
    >
      {/* Image skeleton */}
      <div 
        className="w-full aspect-[4/3] rounded-2xl skeleton mb-4"
        style={{ backgroundColor: 'var(--border)' }}
      />
      
      {/* Content skeleton */}
      <div className="space-y-2">
        {/* Title skeleton */}
        <div 
          className="h-5 skeleton rounded w-3/4"
          style={{ backgroundColor: 'var(--border)' }}
        />
        
        {/* Description skeleton */}
        <div className="space-y-1">
          <div 
            className="h-4 skeleton rounded w-full"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <div 
            className="h-4 skeleton rounded w-2/3"
            style={{ backgroundColor: 'var(--border)' }}
          />
        </div>
        
        {/* Meta skeleton */}
        <div 
          className="h-3 skeleton rounded w-1/2"
          style={{ backgroundColor: 'var(--border)' }}
        />
        
        {/* Price skeleton */}
        <div className="flex items-center justify-between pt-2">
          <div 
            className="h-6 skeleton rounded w-16"
            style={{ backgroundColor: 'var(--border)' }}
          />
        </div>
        
        {/* Buttons skeleton */}
        <div className="flex gap-2 pt-2">
          <div 
            className="flex-1 h-11 skeleton rounded-lg"
            style={{ backgroundColor: 'var(--border)' }}
          />
          <div 
            className="flex-1 h-11 skeleton rounded-lg"
            style={{ backgroundColor: 'var(--border)' }}
          />
        </div>
      </div>
    </article>
  );
};

export default SkeletonCard;