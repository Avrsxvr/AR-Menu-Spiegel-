import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterPills from './components/FilterPills';
import DishCard from './components/DishCard';
import SkeletonCard from './components/SkeletonCard';
import ModelPlaceholderModal from './components/ModelPlaceholderModal';
import ProgressiveLoader from './components/ProgressiveLoader';
import { trackEvent, trackDishInteraction } from './utils/analytics.js';
import { getAdaptiveSettings, performanceMonitor } from './utils/DeviceOptimization.js';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [modalState, setModalState] = useState({
    isOpen: false,
    dish: null,
    viewType: null
  });
  const [activeModelId, setActiveModelId] = useState(null);
  const [adaptiveSettings, setAdaptiveSettings] = useState(null);

  // Restore state from sessionStorage on mount
  useEffect(() => {
    const savedState = sessionStorage.getItem('spiegel_menu_state');
    if (savedState) {
      try {
        const { category, search, scrollY } = JSON.parse(savedState);
        setActiveCategory(category || 'All');
        setSearchTerm(search || '');
        // We'll handle scroll after dishes load
        window._initialScrollY = scrollY;
      } catch (e) {
        console.error('Failed to restore state', e);
      }
    }
  }, []);

  // Save state before navigating away
  const saveMenuState = () => {
    sessionStorage.setItem('spiegel_menu_state', JSON.stringify({
      category: activeCategory,
      search: searchTerm,
      scrollY: window.scrollY
    }));
  };
  
  const lenisRef = useRef(null);

  // Initialize device optimization and performance monitoring
  useEffect(() => {
    const settings = getAdaptiveSettings();
    setAdaptiveSettings(settings);
    
    // Track device capabilities for analytics
    trackEvent('device_capabilities', {
      performance_tier: settings.capabilities.performanceTier,
      device_type: settings.capabilities.isMobile ? 'mobile' : 
                   settings.capabilities.isTablet ? 'tablet' : 'desktop',
      network_speed: settings.capabilities.networkSpeed
    });
    
    // Monitor performance metrics (without fallback mode)
    const trackPerformance = () => {
      const metrics = performanceMonitor.getMetrics();
      if (metrics.crashes > 0) {
        trackEvent('performance_monitoring', {
          crashes: metrics.crashes,
          avg_load_time: metrics.modelLoadTimes.length > 0 
            ? metrics.modelLoadTimes.reduce((sum, m) => sum + m.loadTime, 0) / metrics.modelLoadTimes.length
            : 0
        });
      }
    };
    
    const performanceTimer = setInterval(trackPerformance, 30000); // Track every 30 seconds
    
    return () => clearInterval(performanceTimer);
  }, []);

  // Initialize Lenis smooth scroll with adaptive settings
  useEffect(() => {
    if (!adaptiveSettings) return;
    
    const lenis = new Lenis({
      duration: adaptiveSettings.enableAnimations ? 1.2 : 0.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [adaptiveSettings]);

  // Load dishes data
  useEffect(() => {
    const loadDishes = async () => {
      try {
        setLoading(true);
        // Simulate network delay for better UX demonstration
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await fetch('/dishes.json');
        const data = await response.json();
        setDishes(data);
        
        // Restore scroll position after dishes are rendered
        if (window._initialScrollY) {
          setTimeout(() => {
            window.scrollTo({ top: window._initialScrollY, behavior: 'instant' });
            window._initialScrollY = null;
          }, 100);
        }
        
        // 🧊 Expert Optimization: Silent Background Warm-up for AR
        if (data && data.length > 0) {
          setTimeout(() => {
            console.log('🧊 App: Warming up AR engine in background...');
            const prefetchUrls = [
              '/ar.html',
              '/external/xr/xr.js',
              '/external/xr/xr-slam.js'
            ];
            
            // Only precompute the first 3 models to save initial data
            const initialModels = data.slice(0, 3).map(d => d.modelUrl).filter(Boolean);
            
            [...prefetchUrls, ...initialModels].forEach(url => {
              fetch(url, { mode: 'no-cors' }).catch(() => {});
            });
          }, 2000); // Wait 2 seconds so we don't interfere with initial page render
        }

        // Track successful data load
        trackEvent('dishes_loaded', {
          total_dishes: data?.length || 0,
          load_time: Date.now() - window.performance.timing.navigationStart
        });
        
      } catch (error) {
        console.error('Error loading dishes:', error);
        trackEvent('dishes_load_error', {
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    loadDishes();
  }, []);

  // Handle header visibility on scroll - integrated with Lenis
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Use Lenis scroll event if available, otherwise fallback to window scroll
    if (lenisRef.current) {
      lenisRef.current.on('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    return () => {
      if (lenisRef.current) {
        lenisRef.current.off('scroll', handleScroll);
      } else {
        window.removeEventListener('scroll', handleScroll);
      }
    };
  }, [lastScrollY]);

  // Get unique categories
  const categories = [...new Set(dishes.map(dish => dish.category))];

  // Filter dishes based on active category and search term
  const filteredDishes = dishes.filter(dish => {
    const matchesCategory = activeCategory === 'All' || dish.category === activeCategory;
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Handle modal actions
  const handleViewModal = (dish, viewType) => {
    setModalState({
      isOpen: true,
      dish,
      viewType
    });
    
    // Track modal open events
    trackEvent('modal_open', { 
      dish_name: dish.name,
      modal_type: viewType 
    });
    
    // Track dish interaction
    trackDishInteraction(dish.name, `open_${viewType}`);
  };

  const closeModal = () => {
    if (modalState.dish) {
      // Track modal close
      trackEvent('modal_close', { 
        dish_name: modalState.dish.name,
        modal_type: modalState.viewType
      });
    }
    
    setModalState({
      isOpen: false,
      dish: null,
      viewType: null
    });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg)' }}>
      <Header isVisible={isHeaderVisible} />
      
      <SearchBar 
        searchTerm={searchTerm} 
        onSearchChange={(term) => {
          setSearchTerm(term);
          if (term.trim() !== '') {
            trackEvent('search', { search_term: term });
          }
        }} 
      />
      
      <FilterPills
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(category) => {
          setActiveCategory(category);
          trackEvent('filter_change', { category });
        }}
      />

      {/* Main content */}
      <main className="px-4 py-6 pt-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            // Loading skeletons
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : (
            // Progressive dishes grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDishes.map((dish, index) => (
                <ProgressiveLoader 
                  key={dish.id}
                  priority={index < 3 ? 'high' : index < 6 ? 'normal' : 'low'}
                  fallback={<SkeletonCard />}
                >
                  <DishCard
                    dish={dish}
                    onViewModal={handleViewModal}
                    adaptiveSettings={adaptiveSettings}
                    activeModelId={activeModelId}
                    onActivateModel={setActiveModelId}
                    onNavigateAR={saveMenuState}
                  />
                </ProgressiveLoader>
              ))}
            </div>
          )}


          {/* Empty state */}
          {!loading && filteredDishes.length === 0 && (
            <div className="text-center py-12">
              <p 
                className="text-lg"
                style={{ color: 'var(--text-secondary)' }}
              >
                No dishes found in this category.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <ModelPlaceholderModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        dish={modalState.dish}
        viewType={modalState.viewType}
      />
    </div>
  );
}

export default App;