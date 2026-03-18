import React, { useState, useEffect } from 'react';
import { getAdaptiveSettings } from '../utils/DeviceOptimization.js';

const ProgressiveLoader = ({ children, fallback, priority = 'normal' }) => {
  const [isReady, setIsReady] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const adaptiveSettings = getAdaptiveSettings();
    setSettings(adaptiveSettings);
    
    // Immediate load for high priority content
    if (priority === 'high') {
      setIsReady(true);
      return;
    }
    
    // Progressive loading based on device capabilities
    const delay = priority === 'low' ? adaptiveSettings.lazyLoadDelay * 2 : adaptiveSettings.lazyLoadDelay;
    
    const timer = setTimeout(() => {
      setIsReady(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [priority]);

  if (!isReady || !settings) {
    return fallback || (
      <div className="animate-pulse bg-gray-200 rounded-lg" style={{ minHeight: '200px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500 text-sm">Loading...</div>
        </div>
      </div>
    );
  }

  return React.cloneElement(children, { adaptiveSettings: settings });
};

export default ProgressiveLoader;