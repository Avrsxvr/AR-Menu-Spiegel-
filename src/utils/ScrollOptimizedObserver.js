class ScrollOptimizedObserver {
  constructor() {
    this.observers = new Map();
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.pendingLoads = new Map();
    
    // Single global observer for ALL models - reduces scroll overhead
    this.globalObserver = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '150px', // Larger margin for better 3D model preparation
        threshold: [0, 0.1, 0.3] // Multiple thresholds for better control
      }
    );

    // Listen for scroll events to detect when scrolling stops
    this.setupScrollDetection();
  }

  setupScrollDetection() {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.isScrolling = true;
          clearTimeout(this.scrollTimeout);
          
          // Mark scroll as stopped after 150ms of no scrolling
          this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.processPendingLoads();
          }, 150);
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      const modelId = entry.target.dataset.modelId;
      const callback = this.observers.get(modelId);
      
      if (!callback) return;

      if (entry.isIntersecting) {
        // If scrolling, queue the load. If not scrolling, load immediately
        if (this.isScrolling) {
          this.pendingLoads.set(modelId, {
            entry,
            callback,
            priority: entry.intersectionRatio // Higher visibility = higher priority
          });
        } else {
          // Immediate load when not scrolling (preserves 3D experience)
          this.executeLoad(modelId, entry, callback);
        }
      }
    });
  }

  processPendingLoads() {
    if (this.pendingLoads.size === 0) return;

    // Sort by priority (visibility ratio) - most visible models load first
    const sortedLoads = Array.from(this.pendingLoads.entries())
      .sort(([,a], [,b]) => b.priority - a.priority);

    // Load models with staggered timing to prevent frame drops
    sortedLoads.forEach(([modelId, {entry, callback}], index) => {
      setTimeout(() => {
        this.executeLoad(modelId, entry, callback);
      }, index * 50); // 50ms stagger between loads
    });

    this.pendingLoads.clear();
  }

  executeLoad(modelId, entry, callback) {
    // Use requestIdleCallback for non-critical timing
    if (window.requestIdleCallback) {
      window.requestIdleCallback(() => {
        callback(entry);
        this.globalObserver.unobserve(entry.target);
      }, { timeout: 100 });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        callback(entry);
        this.globalObserver.unobserve(entry.target);
      }, 16); // Next frame
    }
  }

  observe(element, modelId, callback) {
    element.dataset.modelId = modelId;
    this.observers.set(modelId, callback);
    this.globalObserver.observe(element);
  }

  unobserve(element, modelId) {
    this.observers.delete(modelId);
    this.pendingLoads.delete(modelId);
    this.globalObserver.unobserve(element);
  }

  // Priority system for 3D models
  setPriority(modelId, priority) {
    if (this.pendingLoads.has(modelId)) {
      this.pendingLoads.get(modelId).priority = priority;
    }
  }

  getStatus() {
    return {
      isScrolling: this.isScrolling,
      pendingLoads: this.pendingLoads.size,
      observedElements: this.observers.size
    };
  }
}

// Create singleton - one observer for entire app
const scrollOptimizedObserver = new ScrollOptimizedObserver();

export default scrollOptimizedObserver;