import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import CarCard from '../components/CarCard';
import WebFilterCard from '../components/WebFilterCard';

export default function BrowseScreen() {
  const {
    listings,
    isLoading,
    isRefreshing,
    refreshListings,
    apiError,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedBrand,
    setSelectedBrand,
    selectedCountry,
    setSelectedCountry,
    selectedStatus,
    setSelectedStatus,
    maxPrice,
    setMaxPrice,
    resetFilters,
    colors,
  } = useApp();

  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'low', 'high'
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);

  let filteredCars = [...listings];

  // Sorting
  if (sortBy === 'low') {
    filteredCars.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'high') {
    filteredCars.sort((a, b) => b.price - a.price);
  }

  const isBrandActive = selectedBrand !== 'All';
  const isCountryActive = selectedCountry !== 'All Middle East' && selectedCountry !== 'Any country';
  const isTypeActive = selectedType !== 'all';
  const isStatusActive = selectedStatus !== 'all';
  const isPriceActive = Boolean(maxPrice && maxPrice.trim());

  const activeFilterCount =
    (isBrandActive ? 1 : 0) +
    (isCountryActive ? 1 : 0) +
    (isTypeActive ? 1 : 0) +
    (isStatusActive ? 1 : 0) +
    (isPriceActive ? 1 : 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgDark }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={Boolean(isRefreshing)}
          onRefresh={refreshListings}
          tintColor={colors.primaryGold}
          colors={[colors.primaryGold]}
        />
      }
    >
      {/* Top Search & Filter Bar */}
      <View style={[styles.topSection, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderLight }]}>
        <View style={styles.searchRow}>
          <View style={[styles.searchBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
            <Ionicons name="search" size={18} color={colors.primaryGold} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search make, model, city..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Web Filter Expand/Collapse Button */}
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              { backgroundColor: isFilterExpanded ? colors.primaryGold : colors.bgCard, borderColor: colors.border },
            ]}
            onPress={() => setIsFilterExpanded(!isFilterExpanded)}
            activeOpacity={0.8}
          >
            <Ionicons
              name="options"
              size={18}
              color={isFilterExpanded ? '#15110A' : colors.primaryGold}
            />
            {activeFilterCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: isFilterExpanded ? '#15110A' : colors.primaryGold }]}>
                <Text style={[styles.filterBadgeText, { color: isFilterExpanded ? colors.primaryGold : '#15110A' }]}>
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Web Filter Card (Make, Country, Type, Max Price) */}
        {isFilterExpanded && (
          <WebFilterCard style={styles.webFilterCard} />
        )}

        {/* Active Filter Chips Bar (Visible when card is collapsed or as quick indicators) */}
        {activeFilterCount > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.activeChipsRow}
          >
            {isBrandActive && (
              <TouchableOpacity
                style={[styles.activeChip, { borderColor: colors.primaryGold }]}
                onPress={() => setSelectedBrand('All')}
              >
                <Text style={styles.activeChipText}>Make: {selectedBrand}</Text>
                <Ionicons name="close-circle" size={14} color="#C8A04C" />
              </TouchableOpacity>
            )}

            {isCountryActive && (
              <TouchableOpacity
                style={[styles.activeChip, { borderColor: colors.primaryGold }]}
                onPress={() => setSelectedCountry('All Middle East')}
              >
                <Text style={styles.activeChipText}>Country: {selectedCountry === 'United Arab Emirates' ? 'UAE' : selectedCountry}</Text>
                <Ionicons name="close-circle" size={14} color="#C8A04C" />
              </TouchableOpacity>
            )}

            {isTypeActive && (
              <TouchableOpacity
                style={[styles.activeChip, { borderColor: colors.primaryGold }]}
                onPress={() => setSelectedType('all')}
              >
                <Text style={styles.activeChipText}>Type: {selectedType === 'buy' ? 'For sale' : 'For rent'}</Text>
                <Ionicons name="close-circle" size={14} color="#C8A04C" />
              </TouchableOpacity>
            )}

            {isStatusActive && (
              <TouchableOpacity
                style={[styles.activeChip, { borderColor: selectedStatus === 'sold' ? '#DC2626' : '#10B981' }]}
                onPress={() => setSelectedStatus('all')}
              >
                <Text style={styles.activeChipText}>
                  Status: {selectedStatus === 'sold' ? 'Sold' : 'Available'}
                </Text>
                <Ionicons
                  name="close-circle"
                  size={14}
                  color={selectedStatus === 'sold' ? '#DC2626' : '#10B981'}
                />
              </TouchableOpacity>
            )}

            {isPriceActive && (
              <TouchableOpacity
                style={[styles.activeChip, { borderColor: colors.primaryGold }]}
                onPress={() => setMaxPrice('')}
              >
                <Text style={styles.activeChipText}>Max: {maxPrice}</Text>
                <Ionicons name="close-circle" size={14} color="#C8A04C" />
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.clearAllChip} onPress={resetFilters}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* Filter Pills (All / Buy / Rent) */}
        <View style={styles.pillsRow}>
          <TouchableOpacity
            style={[
              styles.typePill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
              selectedType === 'all' && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold },
            ]}
            onPress={() => setSelectedType('all')}
          >
            <Text
              style={[
                styles.typePillText,
                { color: colors.textSecondary },
                selectedType === 'all' && { color: '#15110A', fontWeight: '800' },
              ]}
            >
              All Vehicles
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typePill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
              selectedType === 'buy' && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold },
            ]}
            onPress={() => setSelectedType('buy')}
          >
            <Text
              style={[
                styles.typePillText,
                { color: colors.textSecondary },
                selectedType === 'buy' && { color: '#15110A', fontWeight: '800' },
              ]}
            >
              For Sale
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.typePill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
              selectedType === 'rent' && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold },
            ]}
            onPress={() => setSelectedType('rent')}
          >
            <Text
              style={[
                styles.typePillText,
                { color: colors.textSecondary },
                selectedType === 'rent' && { color: '#15110A', fontWeight: '800' },
              ]}
            >
              For Rent
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Filter Row (All Statuses / Available / Sold) */}
        <View style={styles.statusPillsRow}>
          <Text style={[styles.statusGroupLabel, { color: colors.textMuted }]}>STATUS:</Text>
          <TouchableOpacity
            style={[
              styles.statusPill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
              selectedStatus === 'all' && { backgroundColor: colors.bgCardLight, borderColor: colors.primaryGold },
            ]}
            onPress={() => setSelectedStatus('all')}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: colors.textSecondary },
                selectedStatus === 'all' && { color: colors.primaryGold, fontWeight: '800' },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusPill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
              selectedStatus === 'available' && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' },
            ]}
            onPress={() => setSelectedStatus('available')}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: colors.textSecondary },
                selectedStatus === 'available' && { color: '#10B981', fontWeight: '800' },
              ]}
            >
              Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.statusPill,
              { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
              selectedStatus === 'sold' && { backgroundColor: 'rgba(220, 38, 38, 0.15)', borderColor: '#DC2626' },
            ]}
            onPress={() => setSelectedStatus('sold')}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: colors.textSecondary },
                selectedStatus === 'sold' && { color: '#DC2626', fontWeight: '800' },
              ]}
            >
              Sold
            </Text>
          </TouchableOpacity>
        </View>

        {/* Results Counter & Sort Toggle */}
        <View style={styles.resultsInfoRow}>
          <Text style={[styles.countText, { color: colors.textMuted }]}>
            {filteredCars.length} cars in {selectedCountry === 'All Middle East' ? 'Middle East' : selectedCountry}
          </Text>

          <View style={styles.sortToggleRow}>
            <TouchableOpacity
              onPress={() => setSortBy(sortBy === 'low' ? 'high' : sortBy === 'high' ? 'newest' : 'low')}
              style={styles.sortBtn}
            >
              <Ionicons name="swap-vertical" size={14} color={colors.primaryGold} />
              <Text style={[styles.sortBtnText, { color: colors.primaryGold }]}>
                {sortBy === 'low' ? 'Price: Low' : sortBy === 'high' ? 'Price: High' : 'Newest'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Car List */}
      <View style={styles.listContainer}>
        {isLoading ? (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" color={colors.primaryGold} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, marginTop: 14 }]}>
              Loading live listings...
            </Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Fetching latest vehicles from binmardrive.binmargroup.com
            </Text>
          </View>
        ) : apiError && filteredCars.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cloud-offline-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Connection Error</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              {apiError}
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: colors.primaryGold }]}
              onPress={refreshListings}
            >
              <Text style={styles.resetBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredCars.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No cars match your search</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Try clearing filters or changing search keywords.
            </Text>
            <TouchableOpacity
              style={[styles.resetBtn, { backgroundColor: colors.primaryGold }]}
              onPress={resetFilters}
            >
              <Text style={styles.resetBtnText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredCars.map((car) => <CarCard key={car.id} listing={car} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterToggleBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  webFilterCard: {
    marginTop: 10,
    marginBottom: 4,
  },
  activeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingVertical: 2,
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: 'rgba(200, 160, 76, 0.12)',
  },
  activeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C8A04C',
  },
  clearAllChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    justifyContent: 'center',
  },
  clearAllText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  typePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusPillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  statusGroupLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 4,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  activeBrandBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  activeBrandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resetBtnText: {
    color: '#15110A',
    fontSize: 13,
    fontWeight: '800',
  },
});
