/**
 * Bounce Rate Optimization System
 * Comprehensive strategies to reduce bounce rate from 70%+ to <30%
 */

class BounceRateOptimizer {
  constructor() {
    this.metrics = {
      pageLoadStart: performance.now(),
      firstContentfulPaint: null,
      largestContentfulPaint: null,
      firstInputDelay: null,
      cumulativeLayoutShift: 0,
      timeToInteractive: null,
      modelsLoaded: 0,
      totalModels: 0,
      userInteractions: 0,
      sessionDuration: 0,
      errorCount: 0
    };
    
    this.engagementThresholds = {
      minimumTimeOnPage: 10000, // 10 seconds
      minimumInteractions: 2,
      minimumScrollDepth: 0.3 // 30% of page
    };

    this.isEngaged = false;
    this.scrollDepth = 0;
    this.maxScrollDepth = 0;
    this.sessionStartTime = Date.now();
    
    this.init();
  }

  init() {
    this.setupPerformanceMonitoring();
    this.setupEngagementTracking();
    this.setupErrorTracking();
    this.setupVisibilityTracking();
    this.setupUnloadTracking();
  }

  setupPerformanceMonitoring() {
    // Core Web Vitals monitoring
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.largestContentfulPaint = lastEntry.startTime;
        
        if (lastEntry.startTime > 2500) {
          console.warn('Poor LCP detected:', lastEntry.startTime);
          this.implementLCPOptimizations();
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
          
          if (this.metrics.firstInputDelay > 100) {
            console.warn('Poor FID detected:', this.metrics.firstInputDelay);
            this.implementFIDOptimizations();
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            this.metrics.cumulativeLayoutShift += entry.value;
          }
        });
        
        if (this.metrics.cumulativeLayoutShift > 0.1) {
          console.warn('Poor CLS detected:', this.metrics.cumulativeLayoutShift);
          this.implementCLSOptimizations();
        }
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    }

    // Time to Interactive estimation
    setTimeout(() => {
      this.metrics.timeToInteractive = performance.now() - this.metrics.pageLoadStart;
      
      if (this.metrics.timeToInteractive > 5000) {
        console.warn('Slow TTI detected:', this.metrics.timeToInteractive);
        this.implementTTIOptimizations();
      }
    }, 1000);
  }

  setupEngagementTracking() {
    // Scroll depth tracking
    const trackScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      this.scrollDepth = scrollTop / documentHeight;
      this.maxScrollDepth = Math.max(this.maxScrollDepth, this.scrollDepth);
      
      if (this.maxScrollDepth > this.engagementThresholds.minimumScrollDepth) {
        this.markEngagement('scroll_depth');
      }
    };

    // Throttled scroll tracking
    let scrollTimeout = null;
    window.addEventListener('scroll', () => {
      if (scrollTimeout) return;
      scrollTimeout = setTimeout(() => {
        trackScroll();
        scrollTimeout = null;
      }, 100);
    });

    // Click tracking
    document.addEventListener('click', (e) => {
      this.metrics.userInteractions++;
      
      if (this.metrics.userInteractions >= this.engagementThresholds.minimumInteractions) {
        this.markEngagement('interactions');
      }

      // Track specific engagement actions
      const target = e.target.closest('[data-track]');
      if (target) {
        this.trackEngagementAction(target.dataset.track);
      }
    });

    // Time on page tracking
    setInterval(() => {
      this.metrics.sessionDuration = Date.now() - this.sessionStartTime;
      
      if (this.metrics.sessionDuration > this.engagementThresholds.minimumTimeOnPage && !this.isEngaged) {
        this.markEngagement('time_on_page');
      }
    }, 1000);

    // Model loading success tracking
    window.addEventListener('modelLoaded', (e) => {
      this.metrics.modelsLoaded++;
      this.trackModelLoadingSuccess(e.detail.dishName);
    });

    // Touch and gesture tracking for mobile
    let touchStartTime = 0;
    document.addEventListener('touchstart', () => {
      touchStartTime = Date.now();
    });

    document.addEventListener('touchend', () => {
      const touchDuration = Date.now() - touchStartTime;
      if (touchDuration > 100) { // Meaningful touch interaction
        this.metrics.userInteractions++;
      }
    });
  }

  setupErrorTracking() {
    // JavaScript errors
    window.addEventListener('error', (e) => {
      this.metrics.errorCount++;
      this.trackError('javascript', e.message, e.filename, e.lineno);
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (e) => {
      this.metrics.errorCount++;
      this.trackError('promise_rejection', e.reason);
    });

    // Model loading errors
    window.addEventListener('modelError', (e) => {
      this.metrics.errorCount++;
      this.trackError('model_loading', e.detail.dishName, e.detail.error);
    });
  }

  setupVisibilityTracking() {
    let visibilityStartTime = Date.now();
    let totalVisibleTime = 0;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page became hidden
        totalVisibleTime += Date.now() - visibilityStartTime;
      } else {
        // Page became visible
        visibilityStartTime = Date.now();
      }
    });

    // Track actual visible time vs total time
    setInterval(() => {
      if (!document.hidden) {
        const currentVisibleTime = totalVisibleTime + (Date.now() - visibilityStartTime);
        const totalTime = Date.now() - this.sessionStartTime;
        const visibilityRatio = currentVisibleTime / totalTime;
        
        if (visibilityRatio < 0.7) {
          // User is multitasking or page is backgrounded
          this.implementVisibilityOptimizations();
        }
      }
    }, 5000);
  }

  setupUnloadTracking() {
    const sendBounceData = () => {
      const bounceData = this.calculateBounceMetrics();
      
      // Send beacon data
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/bounce-metrics', JSON.stringify(bounceData));
      }
      
      // Also send to analytics
      if (window.gtag) {
        window.gtag('event', 'session_end', {
          session_duration: bounceData.sessionDuration,
          scroll_depth: bounceData.maxScrollDepth,
          interactions: bounceData.userInteractions,
          models_loaded: bounceData.modelsLoaded,
          is_bounce: bounceData.isBounce,
          engagement_score: bounceData.engagementScore
        });
      }
    };

    // Track page unload
    window.addEventListener('beforeunload', sendBounceData);
    window.addEventListener('pagehide', sendBounceData);
    
    // Visibility API fallback
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        sendBounceData();
      }
    });
  }

  markEngagement(reason) {
    if (!this.isEngaged) {
      this.isEngaged = true;
      console.log('✅ User engagement detected:', reason);
      
      // Track engagement milestone
      if (window.gtag) {
        window.gtag('event', 'user_engaged', {
          engagement_reason: reason,
          time_to_engagement: Date.now() - this.sessionStartTime,
          session_duration: this.metrics.sessionDuration
        });
      }
    }
  }

  trackEngagementAction(action) {
    console.log('📊 Engagement action:', action);
    
    if (window.gtag) {
      window.gtag('event', 'engagement_action', {
        action: action,
        session_duration: Date.now() - this.sessionStartTime
      });
    }
  }

  trackModelLoadingSuccess(dishName) {
    console.log('🎯 Model loaded successfully:', dishName);
    
    if (window.gtag) {
      window.gtag('event', 'model_load_success', {
        dish_name: dishName,
        models_loaded: this.metrics.modelsLoaded,
        session_duration: Date.now() - this.sessionStartTime
      });
    }
  }

  trackError(type, message, filename = '', line = 0) {
    console.error('❌ Error tracked:', type, message);
    
    if (window.gtag) {
      window.gtag('event', 'error_occurred', {
        error_type: type,
        error_message: message,
        filename: filename,
        line_number: line,
        error_count: this.metrics.errorCount
      });
    }
  }

  implementLCPOptimizations() {
    // Optimize image loading
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      if (img.getBoundingClientRect().top < window.innerHeight * 2) {
        img.loading = 'eager';
      }
    });

    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.as = 'fetch';
    preloadLink.href = '/dishes.json';
    document.head.appendChild(preloadLink);
  }

  implementFIDOptimizations() {
    // Defer non-critical JavaScript
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        // Load non-critical features
        this.loadNonCriticalFeatures();
      });
    } else {
      setTimeout(() => this.loadNonCriticalFeatures(), 100);
    }
  }

  implementCLSOptimizations() {
    // Add aspect ratios to prevent layout shifts
    const modelContainers = document.querySelectorAll('.model-container');
    modelContainers.forEach(container => {
      if (!container.style.aspectRatio) {
        container.style.aspectRatio = '4/3';
      }
    });
  }

  implementTTIOptimizations() {
    // Show loading indicators immediately
    const loadingIndicators = document.querySelectorAll('.loading-placeholder');
    loadingIndicators.forEach(indicator => {
      indicator.style.display = 'flex';
    });

    // Progressive enhancement
    this.enableProgressiveEnhancement();
  }

  implementVisibilityOptimizations() {
    // Pause non-essential animations when page is not visible
    if (document.hidden) {
      this.pauseAnimations();
    } else {
      this.resumeAnimations();
    }
  }

  loadNonCriticalFeatures() {
    // Load analytics after critical content
    if (!window.gtag && window.dataLayer) {
      const script = document.createElement('script');
      script.src = 'https://www.googletagmanager.com/gtag/js?id=G-PWJLN5LFME';
      script.async = true;
      document.head.appendChild(script);
    }
  }

  enableProgressiveEnhancement() {
    // Enable features progressively based on device capabilities
    const isLowEndDevice = navigator.hardwareConcurrency < 4 || navigator.deviceMemory < 4;
    
    if (isLowEndDevice) {
      // Reduce visual effects for low-end devices
      document.body.classList.add('reduced-motion');
      
      // Limit concurrent model loading
      this.metrics.maxConcurrentModels = 2;
    }
  }

  pauseAnimations() {
    document.body.style.animationPlayState = 'paused';
  }

  resumeAnimations() {
    document.body.style.animationPlayState = 'running';
  }

  calculateBounceMetrics() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    
    // Calculate engagement score (0-100)
    let engagementScore = 0;
    
    // Time factor (0-30 points)
    engagementScore += Math.min(30, (sessionDuration / 1000) * 2);
    
    // Interaction factor (0-25 points)
    engagementScore += Math.min(25, this.metrics.userInteractions * 5);
    
    // Scroll depth factor (0-20 points)
    engagementScore += this.maxScrollDepth * 20;
    
    // Model loading factor (0-15 points)
    if (this.metrics.totalModels > 0) {
      engagementScore += (this.metrics.modelsLoaded / this.metrics.totalModels) * 15;
    }
    
    // Error penalty (-10 points)
    engagementScore -= Math.min(10, this.metrics.errorCount * 2);
    
    // Performance bonus (0-10 points)
    if (this.metrics.largestContentfulPaint && this.metrics.largestContentfulPaint < 2500) {
      engagementScore += 5;
    }
    if (this.metrics.firstInputDelay && this.metrics.firstInputDelay < 100) {
      engagementScore += 5;
    }

    const isBounce = !this.isEngaged && sessionDuration < 30000; // Less than 30 seconds with no engagement

    return {
      sessionDuration,
      maxScrollDepth: this.maxScrollDepth,
      userInteractions: this.metrics.userInteractions,
      modelsLoaded: this.metrics.modelsLoaded,
      totalModels: this.metrics.totalModels,
      errorCount: this.metrics.errorCount,
      engagementScore: Math.round(engagementScore),
      isBounce,
      performanceMetrics: {
        lcp: this.metrics.largestContentfulPaint,
        fid: this.metrics.firstInputDelay,
        cls: this.metrics.cumulativeLayoutShift,
        tti: this.metrics.timeToInteractive
      }
    };
  }

  // Public methods for manual tracking
  setTotalModels(count) {
    this.metrics.totalModels = count;
  }

  trackModelLoadStart(dishName) {
    console.log('🔄 Model loading started:', dishName);
  }

  trackModelLoadSuccess(dishName) {
    this.metrics.modelsLoaded++;
    window.dispatchEvent(new CustomEvent('modelLoaded', { 
      detail: { dishName } 
    }));
  }

  trackModelLoadError(dishName, error) {
    window.dispatchEvent(new CustomEvent('modelError', { 
      detail: { dishName, error } 
    }));
  }

  getEngagementStatus() {
    return {
      isEngaged: this.isEngaged,
      sessionDuration: Date.now() - this.sessionStartTime,
      scrollDepth: this.maxScrollDepth,
      interactions: this.metrics.userInteractions,
      modelsLoaded: this.metrics.modelsLoaded
    };
  }
}

// Create global instance
const bounceRateOptimizer = new BounceRateOptimizer();

export default bounceRateOptimizer;