import React, { useState, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { Search, ChevronDown } from 'lucide-react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterPills from './components/FilterPills';
import DishCard from './components/DishCard';
import SkeletonCard from './components/SkeletonCard';
import ModelPlaceholderModal from './components/ModelPlaceholderModal';
import ProgressiveLoader from './components/ProgressiveLoader';
import TextMenu from './components/TextMenu';
import { trackEvent, trackDishInteraction } from './utils/analytics.js';
import { getAdaptiveSettings, performanceMonitor } from './utils/DeviceOptimization.js';

function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Chef's Special");
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
        setActiveCategory(category || 'MENU');
        setSearchTerm(search || '');
        window._initialScrollY = scrollY;
      } catch (e) {
        console.error('Failed to restore state', e);
      }
    }
  }, []);

  const saveMenuState = () => {
    sessionStorage.setItem('spiegel_menu_state', JSON.stringify({
      category: activeCategory,
      search: searchTerm,
      scrollY: window.scrollY
    }));
  };
  
  const lenisRef = useRef(null);

  useEffect(() => {
    const settings = getAdaptiveSettings();
    setAdaptiveSettings(settings);
    trackEvent('device_capabilities', {
      performance_tier: settings.capabilities.performanceTier,
      device_type: settings.capabilities.isMobile ? 'mobile' : 
                   settings.capabilities.isTablet ? 'tablet' : 'desktop',
      network_speed: settings.capabilities.networkSpeed
    });
    
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
    const performanceTimer = setInterval(trackPerformance, 30000);
    return () => clearInterval(performanceTimer);
  }, []);

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

  useEffect(() => {
    const loadDishes = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        const response = await fetch('/dishes.json');
        const data = await response.json();
        setDishes(data);
        if (window._initialScrollY) {
          setTimeout(() => {
            window.scrollTo({ top: window._initialScrollY, behavior: 'instant' });
            window._initialScrollY = null;
          }, 100);
        }
        if (data && data.length > 0) {
          setTimeout(() => {
            const prefetchUrls = ['/ar.html', '/external/xr/xr.js', '/external/xr/xr-slam.js'];
            const initialModels = data.filter(d => d.modelUrl).slice(0, 3).map(d => d.modelUrl);
            [...prefetchUrls, ...initialModels].forEach(url => {
              fetch(url, { mode: 'no-cors' }).catch(() => {});
            });
          }, 2000);
        }
        trackEvent('dishes_loaded', {
          total_dishes: data?.length || 0,
          load_time: Date.now() - window.performance.timing.navigationStart
        });
      } catch (error) {
        console.error('Error loading dishes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDishes();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsHeaderVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsHeaderVisible(false);
      }
      setLastScrollY(currentScrollY);
    };
    if (lenisRef.current) {
      lenisRef.current.on('scroll', handleScroll);
    } else {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (lenisRef.current) lenisRef.current.off('scroll', handleScroll);
      else window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const filteredDishes = dishes.filter(dish => {
    const isARMode = activeCategory === "Chef's Special";
    
    // In Chef's Special, we only show items with modelUrl
    if (isARMode && !dish.modelUrl) return false;
    
    // Common search filter
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          dish.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewModal = (dish, viewType) => {
    setModalState({ isOpen: true, dish, viewType });
    trackDishInteraction(dish.name, `open_${viewType}`);
  };

  const closeModal = () => {
    setModalState({ isOpen: false, dish: null, viewType: null });
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      {/* ── NEW PROFESSIONAL NAVIGATION ── */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b border-white/5 backdrop-blur-xl
          ${isHeaderVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
        style={{ backgroundColor: 'rgba(15, 15, 15, 0.85)' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <img src="/Logo.png" alt="Spiegel" className="h-8 invert opacity-80" />
            
            {/* Minimal Search Toggle or Bar */}
            <div className="relative flex-grow max-w-[200px] ml-4">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Find dish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-white/20 transition-all"
              />
            </div>
          </div>
          
          {/* Category Tabs */}
          <div className="flex items-center justify-center gap-8 overflow-x-auto scrollbar-hide">
            {["Chef's Special", 'MENU'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] tracking-[0.2em] font-medium uppercase pb-1 transition-all
                  ${activeCategory === cat ? 'text-white border-b border-white' : 'text-white/40 border-b border-transparent hover:text-white/60'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content - padding top to account for fixed nav */}
      <main className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <>
              {/* ── Branded Section Title ── */}
              <div className="mb-16 text-center animate-fadeIn">
                <h1 className="text-6xl font-script text-white opacity-90 mb-2">
                  {activeCategory === 'MENU' ? 'Menu' : "Chef's Special"}
                </h1>
                <div className="h-[1px] w-24 bg-accent mx-auto opacity-50"></div>
              </div>

              {activeCategory === 'MENU' ? (
                <div className="animate-fadeIn">
                   <TextMenu dishes={filteredDishes} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                  {filteredDishes.map((dish, index) => (
                    <ProgressiveLoader 
                      key={dish.id}
                      priority={index < 3 ? 'high' : 'normal'}
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
            </>
          )}

          {!loading && filteredDishes.length === 0 && (
            <div className="text-center py-20 text-white/40">
              <p className="text-sm tracking-widest uppercase">No dishes found</p>
            </div>
          )}
        </div>
      </main>

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