import React, { useEffect, useRef, useState } from 'react';

/**
 * 3D model preview component using Google's <model-viewer>.
 * AR functionality has been moved to the standalone 8th Wall AR page (public/ar.html).
 * This component is now purely a 3D card preview.
 */
const SimpleARModelViewer = ({ 
  modelSrc, 
  dishName, 
  poster,
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
      if (modelViewer) {
        modelViewer.removeEventListener('load', handleLoad);
        modelViewer.removeEventListener('error', handleError);
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
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 'inherit' }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      {/* 3D preview with seamless poster transition */}
      <model-viewer
        ref={modelViewerRef}
        src={modelSrc ? encodeURI(modelSrc) : ''}
        poster={poster || ''}
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
        loading="eager"
        reveal="auto"
        seamless-poster
        interaction-prompt="none"
        shadow-intensity="1"
        shadow-softness="1"
        tone-mapping="neutral"
        environment-image="neutral"
        exposure="1"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          backgroundColor: '#2a2a2a',
          cursor: 'grab',
          ...style
        }}
      >
        <div slot="progress-bar" style={{ display: 'none' }}></div>
        
        {isLoading && (
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              zIndex: 10
            }}
          >
            <div className="spiegel-spinner-mini" style={{
              width: '24px',
              height: '24px',
              border: '3px solid rgba(255,255,255,0.1)',
              borderLeftColor: '#ffffff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}></div>
          </div>
        )}
      </model-viewer>
    </div>
  );
};

export default SimpleARModelViewer;