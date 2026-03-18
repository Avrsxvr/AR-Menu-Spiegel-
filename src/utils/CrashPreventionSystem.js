/**
 * Advanced Device Crash Prevention System
 * Prevents crashes on low-end devices and provides adaptive loading
 */

class CrashPreventionSystem {
  constructor() {
    this.deviceMetrics = this.analyzeDeviceCapabilities();
    this.memoryPressure = 0;
    this.performanceScore = 100;
    this.crashRisk = 'low';
    this.activeModels = new Set();
    this.modelQueue = [];
    this.maxConcurrentModels = this.calculateMaxModels();
    this.emergencyMode = false;
    
    this.init();
  }

  init() {
    this.setupMemoryMonitoring();
    this.setupPerformanceMonitoring();
    this.setupEmergencyMode();
    this.setupGracefulDegradation();
  }

  analyzeDeviceCapabilities() {
    const capabilities = {
      // CPU metrics
      cores: navigator.hardwareConcurrency || 2,
      
      // Memory metrics
      memory: navigator.deviceMemory || 2, // GB
      
      // GPU metrics (estimated)
      webglRenderer: this.getWebGLRenderer(),
      maxTextureSize: this.getMaxTextureSize(),
      
      // Network metrics
      connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
      
      // Platform detection
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      isAndroid: /Android/i.test(navigator.userAgent),
      isLowEnd: false,
      
      // Browser capabilities
      supportsWebGL2: this.checkWebGL2Support(),
      supportsWebXR: this.checkWebXRSupport(),
      supportsOffscreenCanvas: typeof OffscreenCanvas !== 'undefined'
    };

    // Determine if this is a low-end device
    capabilities.isLowEnd = (
      capabilities.cores < 4 ||
      capabilities.memory < 3 ||
      (capabilities.connection && capabilities.connection.effectiveType === 'slow-2g') ||
      this.isKnownLowEndDevice()
    );

    return capabilities;
  }

  getWebGLRenderer() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'unknown';
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
      return 'webgl-supported';
    } catch (e) {
      return 'webgl-unsupported';
    }
  }

  getMaxTextureSize() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 0;
      return gl.getParameter(gl.MAX_TEXTURE_SIZE);
    } catch (e) {
      return 0;
    }
  }

  checkWebGL2Support() {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch (e) {
      return false;
    }
  }

  checkWebXRSupport() {
    return 'xr' in navigator && 'isSessionSupported' in navigator.xr;
  }

  isKnownLowEndDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const lowEndPatterns = [
      /android.*2\./,
      /android.*3\./,
      /android.*4\.0/,
      /android.*4\.1/,
      /android.*4\.2/,
      /android.*4\.3/,
      'android 4.4',
      'android 5.0',
      'android 5.1',
      /iphone.*os [4-8]_/,
      /ipad.*os [4-8]_/,
      'blackberry',
      'nokia',
      'windows phone',
      'opera mini'
    ];

    return lowEndPatterns.some(pattern => {
      if (typeof pattern === 'string') {
        return userAgent.includes(pattern);
      }
      return pattern.test(userAgent);
    });
  }

  calculateMaxModels() {
    if (this.deviceMetrics.isLowEnd) {
      return 1; // Only 1 model at a time for low-end devices
    }
    
    if (this.deviceMetrics.cores >= 6 && this.deviceMetrics.memory >= 6) {
      return 4; // High-end devices can handle 4 models
    }
    
    if (this.deviceMetrics.cores >= 4 && this.deviceMetrics.memory >= 4) {
      return 3; // Mid-range devices can handle 3 models
    }
    
    return 2; // Default for most devices
  }

  setupMemoryMonitoring() {
    // Use Performance API to monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = performance.memory;
        const usedMemory = memInfo.usedJSHeapSize;
        const totalMemory = memInfo.totalJSHeapSize;
        const memoryUsagePercent = (usedMemory / totalMemory) * 100;
        
        this.memoryPressure = memoryUsagePercent;
        
        if (memoryUsagePercent > 85) {
          this.handleHighMemoryPressure();
        } else if (memoryUsagePercent > 95) {
          this.activateEmergencyMode();
        }
      }, 2000);
    }

    // Monitor for memory-related errors
    window.addEventListener('error', (e) => {
      if (e.message.includes('memory') || e.message.includes('heap')) {
        this.handleMemoryError(e);
      }
    });
  }

  setupPerformanceMonitoring() {
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Update performance score based on FPS
        if (fps < 20) {
          this.performanceScore = Math.max(0, this.performanceScore - 10);
          this.crashRisk = 'high';
        } else if (fps < 30) {
          this.performanceScore = Math.max(0, this.performanceScore - 5);
          this.crashRisk = 'medium';
        } else if (fps > 40) {
          this.performanceScore = Math.min(100, this.performanceScore + 1);
          this.crashRisk = 'low';
        }
        
        if (this.performanceScore < 30) {
          this.activateEmergencyMode();
        }
      }
      
      requestAnimationFrame(measureFPS);
    };
    
    requestAnimationFrame(measureFPS);
  }

  setupEmergencyMode() {
    // Detect when the browser is struggling
    let longTaskCount = 0;
    
    if ('PerformanceObserver' in window) {
      const longTaskObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > 50) { // Tasks longer than 50ms
            longTaskCount++;
            
            if (longTaskCount > 3) {
              this.activateEmergencyMode();
            }
          }
        });
      });
      
      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // Long task API not supported
      }
    }

    // Monitor for unresponsive script warnings
    let scriptWarningCount = 0;
    
    window.addEventListener('error', (e) => {
      if (e.message.includes('script') && e.message.includes('unresponsive')) {
        scriptWarningCount++;
        
        if (scriptWarningCount > 2) {
          this.activateEmergencyMode();
        }
      }
    });
  }

  setupGracefulDegradation() {
    // Progressive degradation based on device capabilities
    const degradationLevels = {
      level1: { // Minor optimizations
        reduceAnimations: true,
        lowerTextureQuality: true
      },
      level2: { // Moderate optimizations
        disableAutoRotate: true,
        reduceShadowQuality: true,
        limitConcurrentModels: 2
      },
      level3: { // Aggressive optimizations
        disableEnvironmentLighting: true,
        limitConcurrentModels: 1,
        useSimplifiedShaders: true
      },
      level4: { // Emergency mode
        disableAllAnimations: true,
        limitConcurrentModels: 1,
        useLowestQuality: true,
        showWarningMessage: true
      }
    };

    // Apply initial degradation based on device
    if (this.deviceMetrics.isLowEnd) {
      this.applyDegradation(degradationLevels.level2);
    }
  }

  handleHighMemoryPressure() {
    console.warn('🚨 High memory pressure detected:', this.memoryPressure.toFixed(1) + '%');
    
    // Unload oldest models
    const modelsToUnload = Math.ceil(this.activeModels.size * 0.5);
    let unloaded = 0;
    
    for (const modelId of this.activeModels) {
      if (unloaded >= modelsToUnload) break;
      
      this.unloadModel(modelId);
      unloaded++;
    }
    
    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }
    
    // Trigger browser cleanup
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Browser will perform cleanup during idle time
      });
    }
  }

  handleMemoryError(error) {
    console.error('💥 Memory error detected:', error.message);
    
    // Immediately activate emergency mode
    this.activateEmergencyMode();
    
    // Clear all models
    this.clearAllModels();
    
    // Show user warning
    this.showMemoryWarning();
  }

  activateEmergencyMode() {
    if (this.emergencyMode) return;
    
    console.warn('🚨 EMERGENCY MODE ACTIVATED');
    this.emergencyMode = true;
    
    // Drastically reduce resource usage
    this.maxConcurrentModels = 1;
    
    // Clear all but the most recent model
    const activeModelIds = Array.from(this.activeModels);
    for (let i = 0; i < activeModelIds.length - 1; i++) {
      this.unloadModel(activeModelIds[i]);
    }
    
    // Disable all animations
    document.body.classList.add('emergency-mode');
    
    // Show warning to user
    this.showEmergencyWarning();
    
    // Track emergency activation
    if (window.gtag) {
      window.gtag('event', 'emergency_mode_activated', {
        memory_pressure: this.memoryPressure,
        performance_score: this.performanceScore,
        crash_risk: this.crashRisk,
        device_memory: this.deviceMetrics.memory,
        device_cores: this.deviceMetrics.cores
      });
    }
  }

  canLoadModel(modelId) {
    // Check if we can safely load another model
    if (this.emergencyMode && this.activeModels.size >= 1) {
      return false;
    }
    
    if (this.activeModels.size >= this.maxConcurrentModels) {
      return false;
    }
    
    if (this.memoryPressure > 80) {
      return false;
    }
    
    if (this.performanceScore < 50) {
      return false;
    }
    
    return true;
  }

  requestModelLoad(modelId, loadFunction) {
    if (this.canLoadModel(modelId)) {
      // Load immediately
      this.loadModel(modelId, loadFunction);
    } else {
      // Queue for later
      this.modelQueue.push({ modelId, loadFunction });
    }
  }

  loadModel(modelId, loadFunction) {
    this.activeModels.add(modelId);
    
    try {
      loadFunction();
      
      // Monitor this specific model
      this.monitorModel(modelId);
      
    } catch (error) {
      console.error('Model loading failed:', error);
      this.activeModels.delete(modelId);
      this.handleModelError(modelId, error);
    }
  }

  unloadModel(modelId) {
    console.log('🗑️ Unloading model:', modelId);
    
    this.activeModels.delete(modelId);
    
    // Find and remove the model viewer element
    const modelElement = document.querySelector(`[data-model-id="${modelId}"]`);
    if (modelElement && modelElement.src) {
      modelElement.src = '';
    }
    
    // Process queue if space available
    this.processQueue();
  }

  processQueue() {
    if (this.modelQueue.length > 0 && this.canLoadModel()) {
      const next = this.modelQueue.shift();
      this.loadModel(next.modelId, next.loadFunction);
    }
  }

  monitorModel(modelId) {
    // Set timeout for model loading
    const timeout = this.deviceMetrics.isLowEnd ? 15000 : 10000;
    
    const timeoutId = setTimeout(() => {
      console.warn('⏱️ Model loading timeout:', modelId);
      this.unloadModel(modelId);
      this.handleModelTimeout(modelId);
    }, timeout);
    
    // Clear timeout when model loads successfully
    const checkLoaded = setInterval(() => {
      const modelElement = document.querySelector(`[data-model-id="${modelId}"]`);
      if (modelElement && modelElement.loaded) {
        clearTimeout(timeoutId);
        clearInterval(checkLoaded);
      }
    }, 1000);
  }

  handleModelError(modelId, error) {
    console.error('Model error:', modelId, error);
    
    // Track error
    if (window.gtag) {
      window.gtag('event', 'model_load_error', {
        model_id: modelId,
        error_message: error.message,
        memory_pressure: this.memoryPressure,
        active_models: this.activeModels.size
      });
    }
    
    // Consider emergency mode if too many errors
    this.errorCount = (this.errorCount || 0) + 1;
    if (this.errorCount > 3) {
      this.activateEmergencyMode();
    }
  }

  handleModelTimeout(modelId) {
    console.warn('Model timeout:', modelId);
    
    // Track timeout
    if (window.gtag) {
      window.gtag('event', 'model_load_timeout', {
        model_id: modelId,
        device_type: this.deviceMetrics.isMobile ? 'mobile' : 'desktop',
        is_low_end: this.deviceMetrics.isLowEnd
      });
    }
  }

  clearAllModels() {
    console.log('🗑️ Clearing all models');
    
    // Clear all active models
    for (const modelId of this.activeModels) {
      this.unloadModel(modelId);
    }
    
    // Clear the queue
    this.modelQueue = [];
    
    // Force cleanup
    if (window.gc) {
      window.gc();
    }
  }

  showEmergencyWarning() {
    // Create warning overlay
    const warning = document.createElement('div');
    warning.id = 'emergency-warning';
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #ff6b6b;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideDown 0.3s ease;
    `;
    warning.innerHTML = '⚠️ Performance mode activated for better stability';
    
    document.body.appendChild(warning);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 5000);
  }

  showMemoryWarning() {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    warning.innerHTML = '🚨 Low memory detected. Some models may not load.';
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 7000);
  }

  applyDegradation(level) {
    console.log('📉 Applying performance degradation:', level);
    
    // Apply CSS classes for degradation
    if (level.reduceAnimations) {
      document.body.classList.add('reduced-animations');
    }
    
    if (level.disableAnimations) {
      document.body.classList.add('no-animations');
    }
    
    if (level.limitConcurrentModels) {
      this.maxConcurrentModels = level.limitConcurrentModels;
    }
  }

  getStatus() {
    return {
      emergencyMode: this.emergencyMode,
      memoryPressure: this.memoryPressure,
      performanceScore: this.performanceScore,
      crashRisk: this.crashRisk,
      activeModels: this.activeModels.size,
      maxConcurrentModels: this.maxConcurrentModels,
      queueLength: this.modelQueue.length,
      deviceCapabilities: this.deviceMetrics
    };
  }
}

// Create global instance
const crashPreventionSystem = new CrashPreventionSystem();

export default crashPreventionSystem;