import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';

const SimpleARModelViewer = forwardRef(({ 
  modelSrc, 
  dishName, 
  showARButton = true,
  className = "",
  style = {}
}, ref) => {
  const modelViewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  // Enhanced AR activation
  const activateAR = async () => {
    const modelViewer = modelViewerRef.current;
    console.log('🚀 Attempting to activate AR for:', dishName);
    
    if (!modelViewer) {
      console.error('❌ No model viewer reference available');
      return;
    }
    
    // Wait for model to be loaded before activating AR
    if (isLoading) {
      console.log('⏳ Model still loading, waiting...');
      await new Promise(resolve => {
        const checkLoaded = () => {
          if (!isLoading) {
            resolve();
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }
    
    try {
      console.log('✅ Activating AR for:', dishName);
      if (typeof modelViewer.activateAR === 'function') {
        await modelViewer.activateAR();
        console.log('🎯 AR activated successfully for:', dishName);
      } else {
        console.error('❌ activateAR method not available on model-viewer');
      }
    } catch (error) {
      console.error('❌ AR activation failed for', dishName, ':', error);
    }
  };

  // Expose activateAR method to parent components
  useImperativeHandle(ref, () => ({
    activateAR: activateAR
  }));

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer || !modelSrc) return;

    setIsLoading(true);

    // Fallback timeout to ensure loading overlay disappears
    const fallbackTimeout = setTimeout(() => {
      console.log('⏰ Fallback timeout: removing loading overlay for', dishName);
      setIsLoading(false);
    }, 5000); // 5 second fallback

    const handleLoad = () => {
      console.log('✅ Model loaded successfully:', dishName);
      
      try {
        if (modelViewer.model && modelViewer.model.materials) {
          // Adjust materials to reduce extreme shininess
          const material = modelViewer.model.materials[0];
          if (material && material.pbrMetallicRoughness) {
            material.pbrMetallicRoughness.setRoughnessFactor(0.4);
            material.pbrMetallicRoughness.setMetallicFactor(0.9);
            console.log('✓ Material properties updated (Roughness: 0.4)');
          }
        }

        // Ensure the camera target is centered on the model
        modelViewer.cameraTarget = 'auto auto auto';

        // Use auto-framing to fit the model perfectly in the container
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
      console.log('🎯 Model ready for display:', dishName);
      clearTimeout(fallbackTimeout);
      setIsLoading(false);
    };

    // Add multiple event listeners to ensure loading state clears
    modelViewer.addEventListener('load', handleLoad);
    modelViewer.addEventListener('error', handleError);
    modelViewer.addEventListener('model-visibility', handleModelReady);
    modelViewer.addEventListener('progress', (event) => {
      if (event.detail.totalProgress === 1) {
        handleModelReady();
      }
    });

    // Cleanup
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
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Transparent loading overlay */}
      {isLoading && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: 10,
            borderRadius: '12px'
          }}
        >
          Loading model...
        </div>
      )}
      
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
        ar
        ar-modes="scene-viewer webxr quick-look"
        ar-scale="auto"
        ar-placement="floor"
        bounds="tight"
        camera-target="auto auto auto"
        loading="eager"
        reveal="auto"
        max-pixel-ratio="2"
        seamless-poster
        xr-environment
        interaction-prompt="none"
        shadow-intensity="1"
        shadow-softness="0.5"
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
});

export default SimpleARModelViewer;