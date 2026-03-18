/**
 * Utility functions for Analytics tracking (Google Analytics + Vercel Analytics)
 * This file provides a unified interface for tracking events across multiple analytics platforms
 */

import { track as vercelTrack } from '@vercel/analytics';

/**
 * Track a custom event in both Google Analytics and Vercel Analytics
 * @param {string} eventName - Name of the event to track
 * @param {Object} eventParams - Parameters to include with the event
 */
export const trackEvent = (eventName, eventParams = {}) => {
  // Track with Google Analytics
  if (window.gtag) {
    window.gtag('event', eventName, eventParams);
  } else {
    console.warn('Google Analytics not loaded');
  }
  
  // Track with Vercel Analytics (if available)
  try {
    vercelTrack(eventName, eventParams);
  } catch (error) {
    // Silently handle Vercel Analytics errors
    console.debug('Vercel Analytics event error:', error);
  }
};

/**
 * Track page views
 * @param {string} pagePath - Path of the page being viewed
 * @param {string} pageTitle - Title of the page
 */
export const trackPageView = (pagePath, pageTitle) => {
  trackEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle,
  });
};

/**
 * Track AR activations
 * @param {string} dishName - Name of the dish being viewed in AR
 */
export const trackARActivation = (dishName) => {
  trackEvent('ar_activation', {
    dish_name: dishName,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Track when 3D models are successfully loaded
 * @param {string} modelName - Name of the model that was loaded
 * @param {number} loadTime - Time taken to load the model in milliseconds
 */
export const trackModelLoad = (modelName, loadTime) => {
  trackEvent('model_load', {
    model_name: modelName,
    load_time: loadTime,
  });
};

/**
 * Track errors in the application
 * @param {string} errorCategory - Category of error (e.g., 'ar', 'model', 'network')
 * @param {string} errorMessage - Specific error message
 */
export const trackError = (errorCategory, errorMessage) => {
  trackEvent('error', {
    error_category: errorCategory,
    error_message: errorMessage,
  });
};

/**
 * Track user interactions with dishes
 * @param {string} dishName - Name of the dish interacted with
 * @param {string} interactionType - Type of interaction (e.g., 'view', 'click', 'zoom')
 */
export const trackDishInteraction = (dishName, interactionType) => {
  trackEvent('dish_interaction', {
    dish_name: dishName,
    interaction_type: interactionType,
  });
};