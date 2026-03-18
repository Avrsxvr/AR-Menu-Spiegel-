# 3D/AR Integration Guide

This document outlines how to integrate actual 3D and AR functionality into the AR Menu UI application.

## 🎯 Integration Points

### 1. ModelPlaceholderModal Component

**Location**: `src/components/ModelPlaceholderModal.jsx`

**Current Props**:
```jsx
{
  isOpen: boolean,
  onClose: function,
  dish: object,
  viewType: '3d' | 'ar'
}
```

**Future Props for Integration**:
```jsx
{
  isOpen: boolean,
  onClose: function,
  dish: object,
  viewType: '3d' | 'ar',
  modelGlbUrl: string,    // URL to GLB/GLTF model
  modelUsdzUrl: string,   // URL to USDZ model for iOS AR
  thumbnailUrl?: string,  // Optional model thumbnail
  loadingState?: string   // 'loading' | 'loaded' | 'error'
}
```

### 2. Dish Data Structure

**Location**: `public/dishes.json`

**Add these fields to each dish object**:
```json
{
  "id": "chicken-tikka",
  "name": "Chicken Tikka",
  // ... existing fields ...
  "models": {
    "glb": "https://your-cdn.com/models/chicken-tikka.glb",
    "usdz": "https://your-cdn.com/models/chicken-tikka.usdz",
    "thumbnail": "https://your-cdn.com/thumbnails/chicken-tikka-3d.jpg"
  }
}
```

## 🛠 Recommended Libraries

### For 3D Viewer
- **Three.js** with React Three Fiber
- **@react-three/drei** for helpers
- **@react-three/fiber** for React integration

```bash
npm install three @react-three/fiber @react-three/drei
```

### For AR (WebXR)
- **@react-three/xr** for WebXR support
- **model-viewer** web component (Google)
- **AR.js** for marker-based AR

```bash
npm install @react-three/xr
# OR
npm install @google/model-viewer
```

## 📱 Implementation Examples

### 3D Model Viewer Component

```jsx
import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

const Model3D = ({ modelUrl }) => {
  const { scene } = useGLTF(modelUrl);
  return <primitive object={scene} />;
};

const Model3DViewer = ({ modelUrl, dish }) => {
  return (
    <Canvas style={{ height: '300px' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Suspense fallback={<mesh><boxGeometry /></mesh>}>
        <Model3D modelUrl={modelUrl} />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
};
```

### AR Model Viewer Component

```jsx
import React from 'react';

const ARModelViewer = ({ modelGlbUrl, modelUsdzUrl, dish }) => {
  return (
    <model-viewer
      src={modelGlbUrl}
      ios-src={modelUsdzUrl}
      alt={dish.name}
      ar
      ar-modes="webxr scene-viewer quick-look"
      camera-controls
      auto-rotate
      style={{
        width: '100%',
        height: '300px'
      }}
    />
  );
};
```

### Updated Modal Component Structure

```jsx
import React from 'react';
import Model3DViewer from './Model3DViewer';
import ARModelViewer from './ARModelViewer';

const ModelViewerModal = ({ isOpen, onClose, dish, viewType }) => {
  const is3D = viewType === '3d';
  const isAR = viewType === 'ar';

  if (!isOpen || !dish?.models) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{is3D ? '3D View' : 'AR View'}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="model-container">
          {is3D && (
            <Model3DViewer 
              modelUrl={dish.models.glb} 
              dish={dish}
            />
          )}
          
          {isAR && (
            <ARModelViewer
              modelGlbUrl={dish.models.glb}
              modelUsdzUrl={dish.models.usdz}
              dish={dish}
            />
          )}
        </div>
        
        <div className="model-controls">
          <button onClick={onClose}>Close</button>
          {isAR && (
            <button className="ar-button">
              Place in AR
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
```

## 🔄 Migration Steps

1. **Install Dependencies**:
   ```bash
   npm install three @react-three/fiber @react-three/drei @google/model-viewer
   ```

2. **Update Dish Data**:
   - Add model URLs to `dishes.json`
   - Host 3D models on CDN (GLB for web, USDZ for iOS)

3. **Create Model Components**:
   - `Model3DViewer.jsx` for 3D rotation/zoom
   - `ARModelViewer.jsx` for AR placement

4. **Replace Modal Component**:
   - Update `ModelPlaceholderModal.jsx` with actual viewers
   - Add loading states and error handling

5. **Add Model Loading**:
   - Implement progressive loading
   - Add model caching for performance

6. **Test AR Features**:
   - Test on iOS Safari (Quick Look)
   - Test on Android Chrome (Scene Viewer)
   - Verify WebXR compatibility

## 📦 Model Requirements

### File Formats
- **GLB/GLTF**: Web 3D standard, good compression
- **USDZ**: iOS AR Quick Look support
- **FBX**: Alternative for complex models

### Optimization
- Keep models under 5MB for mobile
- Use texture compression (KTX2, AVIF)
- Optimize polygon count (< 10k triangles)
- Include LOD (Level of Detail) versions

### Hosting
- Use CDN for fast global delivery
- Enable GZIP compression
- Set proper CORS headers
- Consider progressive loading

## 🎯 Performance Considerations

- **Lazy Load Models**: Only load when modal opens
- **Model Caching**: Cache loaded models in memory
- **Progressive Enhancement**: Fall back to images if WebGL unavailable
- **Loading States**: Show spinners during model loading
- **Error Handling**: Graceful fallbacks for failed loads

## 📱 Mobile Optimizations

- **Memory Management**: Dispose of models when modal closes
- **Touch Controls**: Optimize for touch interactions
- **AR Features**: Detect AR capability before showing buttons
- **Performance**: Monitor FPS and adjust quality

## 🔒 Security Notes

- Validate model file types before loading
- Sanitize model URLs from external sources
- Use HTTPS for all model resources
- Consider file size limits to prevent abuse

This integration guide provides a clear path from the current placeholder implementation to a fully functional 3D/AR menu experience.