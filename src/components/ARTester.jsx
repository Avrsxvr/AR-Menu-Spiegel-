import React, { useRef, useEffect } from 'react';

const ARTester = () => {
  const testModelRef = useRef(null);

  const testAR = () => {
    console.log('🧪 Testing AR activation...');
    const modelViewer = testModelRef.current;
    
    if (modelViewer) {
      console.log('Model viewer element:', modelViewer);
      console.log('Available methods:', Object.getOwnPropertyNames(modelViewer));
      console.log('activateAR method type:', typeof modelViewer.activateAR);
      
      if (typeof modelViewer.activateAR === 'function') {
        modelViewer.activateAR()
          .then(() => console.log('✅ AR activated successfully'))
          .catch(err => console.error('❌ AR failed:', err));
      } else {
        console.error('❌ activateAR not available');
      }
    } else {
      console.error('❌ No model viewer reference');
    }
  };

  useEffect(() => {
    console.log('🔍 Checking model-viewer registration...');
    console.log('customElements:', customElements);
    console.log('model-viewer defined:', customElements.get('model-viewer'));
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      zIndex: 1000, 
      background: 'white', 
      padding: '10px',
      border: '2px solid red',
      borderRadius: '8px'
    }}>
      <h4>AR Tester</h4>
      <div style={{ width: '200px', height: '150px', marginBottom: '10px' }}>
        <model-viewer
          ref={testModelRef}
          src="/Models/Bong Kebab.glb"
          camera-controls
          ar
          ar-modes="webxr scene-viewer quick-look"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#333'
          }}
        ></model-viewer>
      </div>
      <button 
        onClick={testAR}
        style={{
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test AR
      </button>
    </div>
  );
};

export default ARTester;