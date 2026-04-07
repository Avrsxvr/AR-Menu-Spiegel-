import React, { useEffect, useRef, useState } from 'react';

/**
 * 3D model preview component using Google's <model-viewer>.
 * AR functionality has been moved to the standalone 8th Wall AR page (public/ar.html).
 * This component is now purely a 3D card preview.
 */
const SimpleARModelViewer = ({ 
  modelSrc, 
  dishName, 
  className = "",
  style = {}
}) => {
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer || !modelSrc) return;

    setIsLoading(true);

    // Fallback timeout to ensure loading overlay disappears
    const fallbackTimeout = setTimeout(() => {
      console.log('⏰ Fallback timeout: removing loading overlay for', dishName);
      setIsLoading(false);
    }, 5000);

    const handleLoad = () => {
      console.log('✅ Model loaded successfully:', dishName);
      
      try {
        if (modelViewer.model && modelViewer.model.materials) {
          const material = modelViewer.model.materials[0];
          if (material && material.pbrMetallicRoughness) {
            material.pbrMetallicRoughness.setRoughnessFactor(0.4);
            material.pbrMetallicRoughness.setMetallicFactor(0.9);
          }
        }

        modelViewer.cameraTarget = 'auto auto auto';

        requestAnimationFrame(() => {
          if (typeof modelViewer.updateFraming === 'function') {
            modelViewer.updateFraming();
          }
          modelViewer.cameraOrbit = '0deg 75deg auto';
        });
      } catch (e) {
        console.warn('Error adjusting camera/materials:', e);
      }

      clearTimeout(fallbackTimeout);
      setIsLoading(false);
    };

    const handleError = (event) => {
      console.error('❌ Model loading error for:', dishName, event);
      clearTimeout(fallbackTimeout);
      setIsLoading(false);
    };

    const handleModelReady = () => {
      clearTimeout(fallbackTimeout);
      setIsLoading(false);
    };

    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('model-visibility', handleModelReady);
    modelViewer.addEventListener('progress', (event) => {
      if (event.detail.totalProgress === 1) {
        handleModelReady();
      }
    });

    return () => {
      clearTimeout(fallbackTimeout);
      if (modelViewer) {
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
        modelViewer.removeEventListener('model-visibility', handleModelReady);
        modelViewer.removeEventListener('progress', handleModelReady);
      }
    };
  }, [modelSrc, dishName]);

  if (!modelSrc) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
        <span>No model available</span>
      </div>
    );
  }

  return (
    <div 
      style={{ width: '100%', height: '100%', position: 'relative' }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            color: '#ffffff',
            zIndex: 10,
            borderRadius: '16px'
          }}
        >
          <div className="spiegel-spinner-mini" style={{
            width: '24px',
            height: '24px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderLeftColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            marginBottom: '12px'
          }}></div>
          <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.02em' }}>Loading 3D...</span>
        </div>
      )}
      
      {/* 3D preview only – no AR attributes */}
      <model-viewer
        ref={modelViewerRef}
        src={modelSrc ? encodeURI(modelSrc) : ''}
        alt={`3D ${dishName} Model`}
        camera-controls
        interaction-policy="always-allow"
        touch-action="none"
        disable-pan="false"
        disable-zoom="false"
        auto-rotate
        auto-rotate-delay="0"
        rotation-per-second="30deg"
        bounds="tight"
        camera-target="auto auto auto"
        loading="lazy"
        reveal="auto"
        max-pixel-ratio="1"
        seamless-poster
        interaction-prompt="none"
        shadow-intensity="0.5"
        shadow-softness="1"
        tone-mapping="neutral"
        environment-image="neutral"
        exposure="0.8"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          ...style
        }}
      >
      </model-viewer>
    </div>
  );
};

export default SimpleARModelViewer;