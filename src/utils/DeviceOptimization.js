/**
 * Device Detection and Performance Optimization Utilities
 */

// Device capabilities detection
export const getDeviceCapabilities = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android(?=.*Tablet)|Windows NT.*Touch/i.test(userAgent);
  const isDesktop = !isMobile && !isTablet;
  
  // Performance indicators
  const cores = navigator.hardwareConcurrency || 2;
  const memory = navigator.deviceMemory || 2; // GB
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  // Performance tier classification
  let performanceTier = 'low';
  if (cores >= 8 && memory >= 8) {
    performanceTier = 'high';
  } else if (cores >= 4 && memory >= 4) {
    performanceTier = 'medium';
  }
  
  // Network speed detection
  let networkSpeed = 'slow';
  if (connection) {
    const effectiveType = connection.effectiveType;
    if (effectiveType === '4g' || connection.downlink > 10) {
      networkSpeed = 'fast';
    } else if (effectiveType === '3g' || connection.downlink > 1.5) {
      networkSpeed = 'medium';
    }
  }
  
  return {
    isMobile,
    isTablet,
    isDesktop,
    cores,
    memory,
    performanceTier,
    networkSpeed,
    connection: connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt
    } : null
  };
};

// Adaptive loading strategy based on device capabilities
export const getAdaptiveSettings = () => {
  const capabilities = getDeviceCapabilities();
  
  let settings = {
    maxConcurrentModels: 1,
    modelQuality: 'low',
    enableAR: false,
    preloadDistance: 200,
    lazyLoadDelay: 500,
    enableAnimations: false
  };
  
  // High-performance devices
  if (capabilities.performanceTier === 'high' && capabilities.networkSpeed === 'fast') {
    settings = {
      maxConcurrentModels: 3,
      modelQuality: 'high',
      enableAR: true,
      preloadDistance: 400,
      lazyLoadDelay: 100,
      enableAnimations: true
    };
  }
  // Medium-performance devices
  else if (capabilities.performanceTier === 'medium' || capabilities.networkSpeed === 'medium') {
    settings = {
      maxConcurrentModels: 2,
      modelQuality: 'medium',
      enableAR: true,
      preloadDistance: 300,
      lazyLoadDelay: 200,
      enableAnimations: true
    };
  }
  // Low-performance devices (default is already optimized)
  
  return { ...settings, capabilities };
};

// Progressive enhancement check
export const supportsWebGL = () => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch (e) {
    return false;
  }
};

// Memory pressure detection
export const isMemoryConstrained = () => {
  const capabilities = getDeviceCapabilities();
  return capabilities.memory <= 2 || capabilities.cores <= 2;
};

// 3D Model optimization settings only (no image fallbacks)
export const getModelOptimizations = (capabilities) => {
  if (capabilities.performanceTier === 'low') {
    return {
      maxPixelRatio: 1.5,
      shadowIntensity: 0.1,
      autoRotate: false,
      preload: 'lazy'
    };
  } else if (capabilities.performanceTier === 'medium') {
    return {
      maxPixelRatio: 2,
      shadowIntensity: 0.2,
      autoRotate: false,
      preload: 'auto'
    };
  } else {
    return {
      maxPixelRatio: 'auto',
      shadowIntensity: 0.3,
      autoRotate: true,
      preload: 'eager'
    };
  }
};

// Performance monitoring
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      modelLoadTimes: [],
      crashes: 0
    };
    
    this.init();
  }
  
  init() {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      // FCP
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime;
          }
        }
      }).observe({ entryTypes: ['paint'] });
      
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // CLS
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += entry.value;
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });
    }
    
    // Monitor crashes and errors
    window.addEventListener('error', () => {
      this.metrics.crashes++;
    });
    
    window.addEventListener('unhandledrejection', () => {
      this.metrics.crashes++;
    });
  }
  
  recordModelLoadTime(modelName, loadTime) {
    this.metrics.modelLoadTimes.push({ modelName, loadTime, timestamp: Date.now() });
  }
  
  getMetrics() {
    return { ...this.metrics };
  }
  
  getPerformanceInsights() {
    const avgLoadTime = this.metrics.modelLoadTimes.length > 0 
      ? this.metrics.modelLoadTimes.reduce((sum, m) => sum + m.loadTime, 0) / this.metrics.modelLoadTimes.length
      : 0;
    
    return {
      crashes: this.metrics.crashes,
      averageLoadTime: avgLoadTime,
      totalModelsLoaded: this.metrics.modelLoadTimes.length,
      performanceScore: this.metrics.crashes === 0 && avgLoadTime < 5000 ? 'good' : 
                       this.metrics.crashes <= 1 && avgLoadTime < 8000 ? 'fair' : 'poor'
    };
  }
}

// Create singleton
export const performanceMonitor = new PerformanceMonitor();