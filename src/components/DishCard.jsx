import React, { useRef } from 'react';
import SimpleARModelViewer from './SimpleARModelViewer';
import VegNonVegBadge from './VegNonVegBadge';

const DishCard = ({ dish, onViewModal, adaptiveSettings }) => {
  const cardRef = useRef(null);
  const modelViewerRef = useRef(null);

  const handleViewOnTable = () => {
    console.log('🔴 View on Table button clicked for:', dish.name);
    
    // Use the ref to activate AR directly
    if (modelViewerRef.current) {
      console.log('✅ Model viewer ref found, activating AR...');
      modelViewerRef.current.activateAR();
    } else {
      console.error('❌ Model viewer ref not available for AR activation');
    }
  };

  return (
    <article 
      ref={cardRef}
      className="rounded-2xl p-4 animate-slideUp flex flex-col h-full"
      style={{ 
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)',
        minHeight: '480px', // Fixed minimum height for consistency
        cursor: 'default' // Ensure card doesn't show pointer cursor
      }}
    >
      {/* 3D Model */}
      <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[4/3] flex-shrink-0">
        <SimpleARModelViewer
          ref={modelViewerRef}
          modelSrc={dish.modelUrl || ''}
          dishName={dish.name}
          showARButton={false}
          className="rounded-2xl"
        />
      </div>

      {/* Content - This will grow to fill available space */}
      <div className="flex flex-col flex-grow">
        {/* Text content */}
        <div className="flex-grow space-y-2 mb-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-semibold text-var(--text-primary) line-clamp-1 flex-grow">
              {dish.name}
            </h3>
            <VegNonVegBadge type={dish.type} className="flex-shrink-0" />
          </div>
          
          <p 
            className="text-sm line-clamp-2 leading-5"
            style={{ color: 'var(--text-secondary)' }}
          >
            {dish.description}
          </p>
          
          <p 
            className="text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            {dish.meta}
          </p>
        </div>
        
        {/* Price and Button - Always at bottom */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white">
              ₹{dish.price}
            </span>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleViewOnTable}
              data-track="ar_button_click"
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium focus-visible min-h-[44px]"
              style={{ 
                backgroundColor: '#ef4444', // Red color
                color: 'white',
                cursor: 'pointer',
                border: 'none',
                outline: 'none'
              }}
            >
              View on Table
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DishCard;