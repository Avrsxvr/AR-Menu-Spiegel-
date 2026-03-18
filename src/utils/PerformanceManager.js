class ModelLoadingManager {
  constructor() {
    this.maxConcurrentLoads = this.getMaxConcurrentLoads();
    this.currentlyLoading = 0;
    this.loadQueue = [];
    this.loadedModels = new Set();
  }

  getMaxConcurrentLoads() {
    // Detect device capabilities
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isLowEnd = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
    
    if (isMobile || isLowEnd) {
      return 1; // Load one model at a time on mobile/low-end devices
    } else if (navigator.hardwareConcurrency >= 8) {
      return 3; // Desktop with good specs can handle 3 concurrent loads
    } else {
      return 2; // Mid-range devices load 2 at a time
    }
  }

  async requestLoad(modelId, loadFunction, priority = 0.5) {
    return new Promise((resolve, reject) => {
      // If already loaded, resolve immediately
      if (this.loadedModels.has(modelId)) {
        resolve();
        return;
      }

      const loadRequest = {
        modelId,
        loadFunction,
        resolve,
        reject,
        priority, // Higher priority = loads first
        timestamp: Date.now()
      };

      if (this.currentlyLoading < this.maxConcurrentLoads) {
        this.executeLoad(loadRequest);
      } else {
        // Insert based on priority (highest priority first)
        const insertIndex = this.loadQueue.findIndex(item => item.priority < priority);
        if (insertIndex === -1) {
          this.loadQueue.push(loadRequest);
        } else {
          this.loadQueue.splice(insertIndex, 0, loadRequest);
        }
      }
    });
  }

  async executeLoad(loadRequest) {
    const { modelId, loadFunction, resolve, reject } = loadRequest;
    
    this.currentlyLoading++;
    
    try {
      await loadFunction();
      this.loadedModels.add(modelId);
      resolve();
    } catch (error) {
      reject(error);
    } finally {
      this.currentlyLoading--;
      this.processQueue();
    }
  }

  processQueue() {
    if (this.loadQueue.length > 0 && this.currentlyLoading < this.maxConcurrentLoads) {
      // Always process highest priority first (already sorted by insertion)
      const nextRequest = this.loadQueue.shift();
      this.executeLoad(nextRequest);
    }
  }

  // Set priority for AR-capable models
  setPriorityForAR(modelId) {
    const request = this.loadQueue.find(item => item.modelId === modelId);
    if (request) {
      request.priority = 1.0; // Highest priority for AR models
      // Re-sort queue
      this.loadQueue.sort((a, b) => b.priority - a.priority);
    }
  }

  // Clean up loaded model from memory
  unloadModel(modelId) {
    this.loadedModels.delete(modelId);
  }

  // Get current status
  getStatus() {
    return {
      currentlyLoading: this.currentlyLoading,
      queueLength: this.loadQueue.length,
      loadedCount: this.loadedModels.size,
      maxConcurrent: this.maxConcurrentLoads
    };
  }
}

// Create singleton instance
const modelLoadingManager = new ModelLoadingManager();

export default modelLoadingManager;