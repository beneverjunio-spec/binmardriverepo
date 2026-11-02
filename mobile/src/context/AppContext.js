import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../services/api';
import { DARK_THEME, LIGHT_THEME } from '../constants/theme';

const AppContext = createContext();

/**
 * Filter an array of vehicle listings locally across all criteria.
 */
export function applyLocalFilters(allCars = [], filters = {}) {
  if (!Array.isArray(allCars)) return [];
  let result = [...allCars];

  // Country filter
  if (
    filters.country &&
    filters.country !== 'All Middle East' &&
    filters.country !== 'Any country'
  ) {
    result = result.filter(
      (c) => c.country && c.country.toLowerCase() === filters.country.toLowerCase()
    );
  }

  // Brand / Make filter
  if (filters.make && filters.make !== 'All') {
    result = result.filter(
      (c) => c.make && c.make.toLowerCase() === filters.make.toLowerCase()
    );
  }

  // Type filter ('buy' or 'rent')
  if (filters.type && filters.type !== 'all') {
    result = result.filter((c) => c.type === filters.type);
  }

  // Status filter ('all', 'available', 'sold') - Never hides sold cars unless explicitly requested
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'sold') {
      result = result.filter((c) => c.isSold || c.sale_status === 'sold');
    } else if (filters.status === 'available') {
      result = result.filter((c) => !c.isSold && c.sale_status !== 'sold');
    }
  }

  // Keyword query search (make, model, city, country, title)
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (c) =>
        (c.make && c.make.toLowerCase().includes(q)) ||
        (c.model && c.model.toLowerCase().includes(q)) ||
        (c.city && c.city.toLowerCase().includes(q)) ||
        (c.country && c.country.toLowerCase().includes(q)) ||
        (c.title && c.title.toLowerCase().includes(q))
    );
  }

  // Seller filter ('All' or specific seller name / dealership)
  if (filters.seller && filters.seller !== 'All') {
    const s = filters.seller.trim().toLowerCase();
    result = result.filter((c) => {
      const sName = (c.sellerName || c.seller_name || '').toLowerCase();
      const sEmail = (c.sellerEmail || c.seller_email || '').toLowerCase();
      return sName === s || sName.includes(s) || s.includes(sName) || sEmail === s;
    });
  }

  // Max price filter
  if (filters.maxPrice && !isNaN(Number(filters.maxPrice)) && Number(filters.maxPrice) > 0) {
    result = result.filter((c) => Number(c.price) <= Number(filters.maxPrice));
  }

  return result;
}

export function AppProvider({ children }) {
  // Theme state
  const [themeMode, setThemeMode] = useState('dark');
  const colors = themeMode === 'dark' ? DARK_THEME : LIGHT_THEME;

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Navigation tab state
  const [activeTab, setActiveTab] = useState('home');

  // Filter state
  const [selectedCountry, setSelectedCountry] = useState('All Middle East');
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'buy', 'rent'
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedSeller, setSelectedSeller] = useState('All'); // 'All' or specific seller / dealership
  const [registeredSellers, setRegisteredSellers] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'available', 'sold' (defaults to 'all' so sold cars are never hidden)
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Live Listings state (Initialized to EMPTY array - NO fake demo cars)
  const [masterListings, setMasterListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Load registered dealers and sellers from backend API
  useEffect(() => {
    let active = true;
    async function loadSellers() {
      try {
        const sellers = await api.getSellers();
        if (active && Array.isArray(sellers) && sellers.length > 0) {
          setRegisteredSellers(sellers);
        }
      } catch (e) {
        // Fallback handled gracefully
      }
    }
    loadSellers();
    return () => { active = false; };
  }, []);

  // Compute comprehensive list of seller options combining registered dealers & active car sellers
  const sellerOptions = React.useMemo(() => {
    const map = new Map();
    (registeredSellers || []).forEach((s) => {
      const name = (s.company_name || s.name || '').trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: s.id || name, name, company_name: name });
      }
    });
    (masterListings || []).forEach((l) => {
      const name = (l.sellerName || l.seller_name || '').trim();
      if (name && !map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), { id: l.seller_id || name, name, company_name: name });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [registeredSellers, masterListings]);

  // Favorites (Saved cars) - Starts empty, never hardcodes demo car IDs
  const [favorites, setFavorites] = useState([]);

  // Selected listing for Car Detail Modal
  const [selectedListing, setSelectedListing] = useState(null);

  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  // Request counter to prevent race conditions
  const reqIdRef = useRef(0);

  /**
   * Fetch real listings from the live website API.
   */
  const fetchLiveListings = useCallback(async (isRefresh = false) => {
    const curReqId = ++reqIdRef.current;
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setApiError(null);

    try {
      const realCars = await api.getListings({});
      // Guard against race conditions if another request completed
      if (curReqId === reqIdRef.current) {
        setMasterListings(realCars);
        setListings(
          applyLocalFilters(realCars, {
            country: selectedCountry,
            type: selectedType,
            make: selectedBrand,
            seller: selectedSeller,
            status: selectedStatus,
            query: searchQuery,
            maxPrice,
          })
        );
        setApiError(null);
      }
    } catch (err) {
      if (curReqId === reqIdRef.current) {
        console.warn('[AppContext] Live listings fetch failed:', err.message);
        setApiError(err.message || 'Unable to connect to live server');
        // Do NOT replace with demo cars. Keep honest empty state or previous real data.
        if (masterListings.length === 0) {
          setMasterListings([]);
          setListings([]);
        }
      }
    } finally {
      if (curReqId === reqIdRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [selectedCountry, selectedType, selectedBrand, selectedSeller, selectedStatus, searchQuery, maxPrice, masterListings.length]);

  // Initial load on app launch
  useEffect(() => {
    fetchLiveListings(false);
  }, []);

  // Update active filtered listings instantly when any filter changes
  useEffect(() => {
    const filtered = applyLocalFilters(masterListings, {
      country: selectedCountry,
      type: selectedType,
      make: selectedBrand,
      seller: selectedSeller,
      status: selectedStatus,
      query: searchQuery,
      maxPrice,
    });
    setListings(filtered);
  }, [selectedCountry, selectedType, selectedBrand, selectedSeller, selectedStatus, searchQuery, maxPrice, masterListings]);

  // Public refresh handler for pull-to-refresh or manual reloads
  const refreshListings = useCallback(() => {
    return fetchLiveListings(true);
  }, [fetchLiveListings]);

  // Reset all active filters
  const resetFilters = () => {
    setSelectedCountry('All Middle East');
    setSelectedBrand('All');
    setSelectedType('all');
    setSelectedSeller('All');
    setSelectedStatus('all');
    setMaxPrice('');
    setSearchQuery('');
  };

  // Favorites management
  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };
  const isFavorite = (id) => favorites.includes(id);

  // Detail Modal management
  const openListingDetails = (listing) => {
    setSelectedListing(listing);
  };
  const closeListingDetails = () => {
    setSelectedListing(null);
  };

  // Local listings mutation helpers (synced with state)
  const addListing = (newCar) => {
    setMasterListings((prev) => [newCar, ...prev]);
  };

  const updateListingPrice = (id, newPrice) => {
    setMasterListings((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, price: Number(newPrice) } : item
      )
    );
  };

  const deleteListing = (id) => {
    setMasterListings((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleListingSold = (id) => {
    const updater = (item) => {
      if (item.id === id) {
        const nextIsSold = !item.isSold;
        return {
          ...item,
          sale_status: nextIsSold ? 'sold' : 'available',
          isSold: nextIsSold,
          status: item.status || 'approved', // Preserve moderation status
        };
      }
      return item;
    };
    setMasterListings((prev) => prev.map(updater));
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        colors,
        toggleTheme,
        activeTab,
        setActiveTab,
        selectedCountry,
        setSelectedCountry,
        isCountryModalOpen,
        setIsCountryModalOpen,
        masterListings,
        listings,
        isLoading,
        isRefreshing,
        apiError,
        searchQuery,
        setSearchQuery,
        selectedType,
        setSelectedType,
        selectedBrand,
        setSelectedBrand,
        selectedSeller,
        setSelectedSeller,
        registeredSellers,
        sellerOptions,
        selectedStatus,
        setSelectedStatus,
        maxPrice,
        setMaxPrice,
        resetFilters,
        favorites,
        toggleFavorite,
        isFavorite,
        selectedListing,
        openListingDetails,
        closeListingDetails,
        currentUser,
        setCurrentUser,
        token,
        setToken,
        refreshListings,
        addListing,
        updateListingPrice,
        deleteListing,
        toggleListingSold,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
