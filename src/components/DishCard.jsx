import React from 'react';
import SimpleARModelViewer from './SimpleARModelViewer';
import VegNonVegBadge from './VegNonVegBadge';

const DishCard = ({ dish, onViewModal, adaptiveSettings, activeModelId, onActivateModel, onNavigateAR }) => {
  const isModelActive = activeModelId === dish.id;

  const handlePreviewTap = (e) => {
    if (e) e.stopPropagation();
    // Activate this card's 3D model if not already active
    if (!isModelActive && dish.modelUrl) {
      onActivateModel(dish.id);
    }
  };

  const handleInteractionStart = () => {
    if (!isModelActive && dish.modelUrl) {
      onActivateModel(dish.id);
    }
  };

  const handleViewOnTable = (e) => {
    e.stopPropagation();
    console.log('🔴 View on Table clicked for:', dish.name);

    if (!dish.modelUrl) {
      alert('AR model is not available for this dish yet.');
      return;
    }

    if (onNavigateAR) onNavigateAR();

    const arPageUrl =
      '/ar.html?model=' +
      encodeURIComponent(dish.modelUrl) +
      '&name=' +
      encodeURIComponent(dish.name);

    window.location.href = arPageUrl;
  };

  return (
    <article 
      className="rounded-2xl p-4 animate-slideUp flex flex-col h-full"
      style={{ 
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)',
        minHeight: '480px',
        cursor: 'default'
      }}
    >
      {/* Preview area — image by default, 3D model on tap or drag */}
      <div
        className="relative mb-4 overflow-hidden rounded-2xl aspect-[4/3] flex-shrink-0"
        onPointerDown={handleInteractionStart}
        onClick={dish.modelUrl ? handlePreviewTap : undefined}
        style={{ cursor: dish.modelUrl ? 'pointer' : 'default' }}
      >
        {isModelActive && dish.modelUrl ? (
          /* ── 3D Model (loaded only for this card) ── */
          <>
            <SimpleARModelViewer
              modelSrc={dish.modelUrl}
              dishName={dish.name}
              poster={dish.posterImage || dish.image}
              className="rounded-2xl"
            />
            {/* Active 3D badge */}
            <div
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                color: '#fff',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: '8px',
                zIndex: 12,
                pointerEvents: 'none',
                border: '1px solid rgba(255,255,255,0.12)'
              }}
            >
              🧊 3D Active
            </div>
          </>
        ) : (
          /* ── Dish image (lightweight default) ── */
          <>
            <img
              src={dish.posterImage || dish.image}
              alt={dish.name}
              loading="lazy"
              style={{
                width: '100%',
                height: '100%',
                objectFit: dish.posterImage ? 'contain' : 'cover',
                display: 'block',
                borderRadius: '12px',
                backgroundColor: '#2a2a2a'
              }}
            />
            {/* "Tap for 3D" overlay badge */}
            {dish.modelUrl && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  background: 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '5px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  pointerEvents: 'none'
                }}
              >
                <span style={{ fontSize: '13px' }}>🧊</span> Tap for 3D
              </div>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
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
        
        {/* Price + Action */}
        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white">
              ₹{dish.price}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleViewOnTable}
              data-track="ar_button_click"
              disabled={!dish.modelUrl}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium focus-visible min-h-[44px]"
              style={{ 
                backgroundColor: dish.modelUrl ? '#ef4444' : '#6b7280',
                color: 'white',
                cursor: dish.modelUrl ? 'pointer' : 'not-allowed',
                border: 'none',
                outline: 'none',
                opacity: dish.modelUrl ? 1 : 0.6
              }}
            >
              {dish.modelUrl ? 'View on Table' : 'AR Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

export default DishCard;