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
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all', 'available', 'sold' (defaults to 'all' so sold cars are never hidden)
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Live Listings state (Initialized to EMPTY array - NO fake demo cars)
  const [masterListings, setMasterListings] = useState([]);
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);

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
  }, [selectedCountry, selectedType, selectedBrand, selectedStatus, searchQuery, maxPrice, masterListings.length]);

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
      status: selectedStatus,
      query: searchQuery,
      maxPrice,
    });
    setListings(filtered);
  }, [selectedCountry, selectedType, selectedBrand, selectedStatus, searchQuery, maxPrice, masterListings]);

  // Public refresh handler for pull-to-refresh or manual reloads
  const refreshListings = useCallback(() => {
    return fetchLiveListings(true);
  }, [fetchLiveListings]);

  // Reset all active filters
  const resetFilters = () => {
    setSelectedCountry('All Middle East');
    setSelectedBrand('All');
    setSelectedType('all');
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
