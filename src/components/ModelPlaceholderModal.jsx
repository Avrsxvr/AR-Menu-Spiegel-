import React, { useEffect, useRef } from 'react';
import { X, Cuboid as Cube, Camera } from 'lucide-react';
import SimpleARModelViewer from './SimpleARModelViewer';

const ModelPlaceholderModal = ({ isOpen, onClose, dish, viewType }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Trap focus within modal
      const modal = modalRef.current;
      if (modal) {
        const focusableElements = modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      }
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isARView = viewType === 'ar';
  const title = isARView ? 'AR View' : '3D View';
  const icon = isARView ? Camera : Cube;
  const Icon = icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl p-6 animate-fadeIn"
        style={{ 
          backgroundColor: 'var(--card-bg)',
          boxShadow: 'var(--shadow-lg)'
        }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 
            id="modal-title"
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: 'var(--text-primary)' }}
          >
            <Icon size={20} style={{ color: 'var(--accent)' }} />
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors focus-visible"
            style={{ 
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'var(--border)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* AR Model Viewer */}
        <div className="space-y-4">
          {/* 3D Model Container */}
          <div 
            className="w-full h-80 rounded-xl overflow-hidden"
            style={{ 
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)'
            }}
          >
            <SimpleARModelViewer
              modelSrc={dish?.modelUrl || '/models/default-dish.glb'}
              dishName={dish?.name || 'Dish'}
              showARButton={isARView}
              className="rounded-xl"
            />
          </div>

          {/* Dish info */}
          <div className="space-y-2 text-center">
            <h3 
              className="text-lg font-semibold"
              style={{ color: 'var(--text-primary)' }}
            >
              {dish?.name}
            </h3>
            <p 
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              {isARView 
                ? 'Tap "View in AR" to place this dish on your table using your camera.'
                : 'Rotate, zoom and explore this 3D model of your dish.'
              }
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus-visible min-h-[44px]"
              style={{ 
                backgroundColor: 'var(--border)',
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#404040';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--border)';
              }}
            >
              Close
            </button>
            {!isARView && (
              <button
                onClick={() => {
                  // Switch to AR mode
                  onClose();
                  setTimeout(() => {
                    // Re-open in AR mode - you can handle this in parent component
                    console.log('Switch to AR view');
                  }, 100);
                }}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors focus-visible min-h-[44px]"
                style={{ 
                  backgroundColor: 'var(--accent)',
                  color: 'white'
                }}
              >
                Switch to AR
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPlaceholderModal;