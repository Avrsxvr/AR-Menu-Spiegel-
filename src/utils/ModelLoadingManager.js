// Global model loading manager to prevent resource exhaustion
class ModelLoadingManager {
  constructor() {
    this.loadingQueue = [];
    this.currentlyLoading = new Set();
    this.maxConcurrentLoads = 2; // Limit concurrent model loads
    this.loadedModels = new Map(); // Cache loaded models
    this.failedModels = new Set(); // Track failed models
  }

  async loadModel(modelSrc, priority = 0) {
    // Check if already failed
    if (this.failedModels.has(modelSrc)) {
      throw new Error('Model previously failed to load');
    }

    // Check if already loaded/loading
    if (this.loadedModels.has(modelSrc)) {
      return this.loadedModels.get(modelSrc);
    }

    if (this.currentlyLoading.has(modelSrc)) {
      // Wait for existing load
      return this.waitForLoad(modelSrc);
    }

    return new Promise((resolve, reject) => {
      this.loadingQueue.push({
        modelSrc,
        priority,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.currentlyLoading.size >= this.maxConcurrentLoads) {
      return;
    }

    // Sort by priority (higher priority first)
    this.loadingQueue.sort((a, b) => b.priority - a.priority);

    const nextLoad = this.loadingQueue.shift();
    if (!nextLoad) return;

    const { modelSrc, resolve, reject } = nextLoad;
    this.currentlyLoading.add(modelSrc);

    try {
      // Simulate model validation/preload
      const response = await fetch(modelSrc, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Model not found: ${response.status}`);
      }

      // Check file size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) { // 10MB limit
        throw new Error('Model file too large');
      }

      this.loadedModels.set(modelSrc, { status: 'loaded', timestamp: Date.now() });
      resolve(true);
    } catch (error) {
      console.warn('Model loading failed:', modelSrc, error.message);
      this.failedModels.add(modelSrc);
      reject(error);
    } finally {
      this.currentlyLoading.delete(modelSrc);
      // Process next in queue
      setTimeout(() => this.processQueue(), 100);
    }
  }

  waitForLoad(modelSrc) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.loadedModels.has(modelSrc)) {
          clearInterval(checkInterval);
          resolve(this.loadedModels.get(modelSrc));
        } else if (this.failedModels.has(modelSrc) || !this.currentlyLoading.has(modelSrc)) {
          clearInterval(checkInterval);
          reject(new Error('Model loading failed or cancelled'));
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Model loading timeout'));
      }, 30000);
    });
  }

  // Cleanup old models from cache
  cleanup() {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [modelSrc, data] of this.loadedModels.entries()) {
      if (now - data.timestamp > maxAge) {
        this.loadedModels.delete(modelSrc);
      }
    }
  }

  // Reset failed models (for retry)
  resetFailedModel(modelSrc) {
    this.failedModels.delete(modelSrc);
  }
}

// Global singleton instance
const modelManager = new ModelLoadingManager();

// Cleanup every 5 minutes
setInterval(() => modelManager.cleanup(), 5 * 60 * 1000);

export default modelManager;