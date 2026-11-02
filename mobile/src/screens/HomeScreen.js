import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BRANDS, COUNTRIES } from '../constants/data';
import { useApp } from '../context/AppContext';
import CarCard from '../components/CarCard';
import WebFilterCard from '../components/WebFilterCard';

export default function HomeScreen() {
  const {
    listings,
    isLoading,
    isRefreshing,
    refreshListings,
    setActiveTab,
    selectedCountry,
    setSelectedCountry,
    selectedBrand,
    setSelectedBrand,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    masterListings,
    colors,
    themeMode,
  } = useApp();

  const forSaleCount = React.useMemo(() => {
    return masterListings.filter((c) => c.type === 'buy').length;
  }, [masterListings]);

  const forRentCount = React.useMemo(() => {
    return masterListings.filter((c) => c.type === 'rent').length;
  }, [masterListings]);

  const [isExpanded, setIsExpanded] = React.useState(false);

  // Cars are instantly filtered in AppContext with 0ms delay
  const featuredCars = React.useMemo(() => {
    const featured = listings.filter((c) => c.featured);
    return featured.length > 0 ? featured : listings;
  }, [listings]);

  // Initially show top 5 cars; when user clicks "View More", expand to all listings (e.g. 7)
  const recentCars = React.useMemo(() => {
    return isExpanded ? listings : listings.slice(0, 5);
  }, [listings, isExpanded]);

  const handleQuickAction = (type) => {
    if (type === 'sell') {
      setActiveTab('sell');
    } else {
      setSelectedType(type);
      setActiveTab('browse');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bgDark }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={Boolean(isRefreshing)}
          onRefresh={refreshListings}
          tintColor={colors.primaryGold}
          colors={[colors.primaryGold]}
        />
      }
    >
      {/* 1. Hero Banner */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={themeMode === 'dark' ? ['#1F180F', '#15110A'] : ['#2B2113', '#15110A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: colors.border }]}
        >
          <View style={styles.heroBadge}>
            <Text style={[styles.heroBadgeText, { color: colors.primaryGold }]}>FREE FOREVER</Text>
          </View>

          <Text style={styles.heroTitle}>
            Buy, sell or rent a car{'\n'}
            <Text style={{ color: colors.primaryGold }}>across the Middle East</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            No listing fees. Owners, dealers and first-time sellers welcome.
          </Text>

          {/* Quick Search Input */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={colors.primaryGold} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search make, model, city..."
              placeholderTextColor="#7A6E5C"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => setActiveTab('browse')}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color="#7A6E5C" />
              </TouchableOpacity>
            )}
          </View>

          {/* Web Filter Card (Make, Country, Type, Max Price, Search) */}
          <WebFilterCard onSearch={() => setActiveTab('browse')} />
        </LinearGradient>
      </View>

      {/* 2. Quick Action Cards (Buy / Rent / Sell) */}
      <View style={styles.quickActionsGrid}>
        {/* Buy */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.88}
          onPress={() => handleQuickAction('buy')}
        >
          <LinearGradient
            colors={['#1F170D', '#2B2113']}
            style={styles.actionCardGradient}
          >
            <Ionicons name="car-sport" size={22} color={colors.primaryGold} />
            <Text style={[styles.actionTitle, { color: colors.primaryGold }]}>Buy a car</Text>
            <Text style={styles.actionSubtitle}>{forSaleCount} listed</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Rent */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.88}
          onPress={() => handleQuickAction('rent')}
        >
          <LinearGradient
            colors={['#0F3D2E', '#1F6A4C']}
            style={styles.actionCardGradient}
          >
            <Ionicons name="key" size={20} color="#FFFFFF" />
            <Text style={[styles.actionTitle, { color: '#FFFFFF' }]}>Rent a car</Text>
            <Text style={[styles.actionSubtitle, { color: 'rgba(255,255,255,0.75)' }]}>
              {forRentCount} available
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Sell */}
        <TouchableOpacity
          style={styles.actionCard}
          activeOpacity={0.88}
          onPress={() => handleQuickAction('sell')}
        >
          <LinearGradient
            colors={colors.goldGradient}
            style={styles.actionCardGradient}
          >
            <Ionicons name="pricetag" size={20} color="#15110A" />
            <Text style={[styles.actionTitle, { color: '#15110A' }]}>Sell your car</Text>
            <Text style={[styles.actionSubtitle, { color: 'rgba(21, 17, 10, 0.75)' }]}>
              Free, no fees
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* 3. Marketplace Stats Counter */}
      <View style={[styles.statsCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
        <View style={styles.statCol}>
          <Ionicons name="car-outline" size={16} color={colors.primaryGold} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{listings.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Live Listings</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statCol}>
          <Ionicons name="location-outline" size={16} color={colors.verified} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>6</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Countries</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.statCol}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.goldLight} />
          <Text style={[styles.statNumber, { color: colors.textPrimary }]}>100%</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Free listing</Text>
        </View>
      </View>

      {/* 4. Browse by Country Pills */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="earth" size={16} color={colors.primaryGold} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Browse by country</Text>
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalPills}
      >
        {COUNTRIES.map((c) => {
          const isSelected = selectedCountry === c.name;
          return (
            <TouchableOpacity
              key={c.code}
              style={[
                styles.countryPill,
                { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                isSelected && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedCountry(c.name)}
            >
              <Text style={styles.countryPillFlag}>{c.flag}</Text>
              <Text
                style={[
                  styles.countryPillName,
                  { color: colors.textSecondary },
                  isSelected && { color: '#15110A', fontWeight: '800' },
                ]}
              >
                {c.name === 'United Arab Emirates' ? 'UAE' : c.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 5. Popular Brands */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="trending-up" size={16} color={colors.primaryGold} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Popular brands</Text>
        </View>
        <TouchableOpacity onPress={() => setSelectedBrand('All')}>
          <Text style={[styles.seeAllText, { color: colors.primaryGold }]}>Reset</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandsList}
      >
        {BRANDS.map((b) => {
          const isSelected = selectedBrand === b.name;
          return (
            <TouchableOpacity
              key={b.name}
              style={styles.brandItem}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedBrand(isSelected ? 'All' : b.name);
                setActiveTab('browse');
              }}
            >
              <LinearGradient
                colors={b.gradient}
                style={[styles.brandCircle, isSelected && styles.brandCircleActive]}
              >
                <Text style={styles.brandInitial}>{b.logo}</Text>
              </LinearGradient>
              <Text style={[styles.brandName, { color: colors.textSecondary }]} numberOfLines={1}>
                {b.name}
              </Text>
              <Text style={[styles.brandCount, { color: colors.textMuted }]}>{b.count}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 6. Featured Cars Carousel */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="flash" size={16} color={colors.primaryGold} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Featured in Database</Text>
        </View>
        <TouchableOpacity onPress={() => setActiveTab('browse')}>
          <Text style={[styles.seeAllText, { color: colors.primaryGold }]}>See all</Text>
        </TouchableOpacity>
      </View>
      {isLoading ? (
        <View style={[styles.emptyCountryWrap, { backgroundColor: colors.bgCard, borderColor: colors.borderLight, paddingVertical: 32 }]}>
          <ActivityIndicator size="small" color={colors.primaryGold} />
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 8 }}>Loading live listings...</Text>
        </View>
      ) : featuredCars.length === 0 ? (
        <View style={[styles.emptyCountryWrap, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
          <Ionicons name="car-outline" size={32} color={colors.primaryGold} />
          <Text style={[styles.emptyCountryText, { color: colors.textPrimary }]}>
            No listings currently in {selectedCountry}
          </Text>
          <TouchableOpacity onPress={() => setActiveTab('sell')}>
            <Text style={{ color: colors.primaryGold, fontWeight: '700', marginTop: 4 }}>
              + Be the first to list a car in {selectedCountry}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredCarousel}
        >
          {featuredCars.map((car) => (
            <CarCard key={car.id} listing={car} compact={true} />
          ))}
        </ScrollView>
      )}

      {/* 7. Verified Listings Trust Banner */}
      <View style={styles.trustBannerWrap}>
        <View style={styles.trustBanner}>
          <View style={styles.trustIconCircle}>
            <Ionicons name="shield-checkmark" size={22} color={colors.verified} />
          </View>
          <View style={styles.trustTextWrap}>
            <Text style={styles.trustTitle}>Verified listings only</Text>
            <Text style={styles.trustSubtitle}>
              Every dealer is screened. Chat directly on WhatsApp — no middleman fees.
            </Text>
          </View>
        </View>
      </View>

      {/* 8. Just Listed */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderLeft}>
          <Ionicons name="car-sport" size={16} color={colors.primaryGold} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {selectedCountry && selectedCountry !== 'All Middle East'
              ? `Vehicles in ${selectedCountry}`
              : 'Real Vehicles from Web Database'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => setActiveTab('browse')}>
          <Text style={[styles.seeAllText, { color: colors.primaryGold }]}>See all</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.verticalList}>
        {isLoading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primaryGold} />
            <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 10 }}>Loading real vehicles...</Text>
          </View>
        ) : recentCars.length === 0 ? (
          <View style={[styles.emptyCountryWrap, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
            <Ionicons name="car-outline" size={32} color={colors.textMuted} />
            <Text style={[styles.emptyCountryText, { color: colors.textPrimary }]}>
              No listings currently available in {selectedCountry}
            </Text>
          </View>
        ) : (
          <>
            {recentCars.map((car) => (
              <CarCard key={car.id} listing={car} />
            ))}

            {/* View More / Expand and Browse All Button */}
            {listings.length > 5 && (
              <View style={styles.viewMoreSection}>
                <TouchableOpacity
                  style={[
                    styles.viewMoreBtn,
                    { backgroundColor: colors.bgCard, borderColor: colors.primaryGold },
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setIsExpanded((prev) => !prev)}
                >
                  <Ionicons
                    name={isExpanded ? 'chevron-up-circle' : 'chevron-down-circle'}
                    size={18}
                    color={colors.primaryGold}
                  />
                  <Text style={[styles.viewMoreBtnText, { color: colors.primaryGold }]}>
                    {isExpanded
                      ? 'Show Less (5 Vehicles)'
                      : `View More (${listings.length} Total Vehicles)`}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.seeAllBrowseBtn, { backgroundColor: colors.primaryGold }]}
                  activeOpacity={0.88}
                  onPress={() => setActiveTab('browse')}
                >
                  <Ionicons name="apps-outline" size={16} color="#15110A" />
                  <Text style={styles.seeAllBrowseBtnText}>
                    Browse All {listings.length} Cars in Marketplace &rarr;
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroWrapper: {
    padding: 16,
    paddingBottom: 8,
  },
  heroCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(200, 160, 76, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  heroSubtitle: {
    color: '#C2B8A3',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#15110A',
    fontWeight: '500',
  },
  searchSubmitBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  searchSubmitText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 12,
    borderRadius: 16,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginTop: 6,
  },
  actionSubtitle: {
    fontSize: 9,
    color: '#9E9484',
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderRadius: 18,
    marginHorizontal: 16,
    marginTop: 14,
    paddingVertical: 12,
  },
  statCol: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 3,
  },
  statLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 10,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '700',
  },
  horizontalPills: {
    paddingHorizontal: 16,
    gap: 8,
  },
  countryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countryPillFlag: {
    fontSize: 14,
  },
  countryPillName: {
    fontSize: 12,
    fontWeight: '600',
  },
  brandsList: {
    paddingHorizontal: 16,
    gap: 14,
  },
  brandItem: {
    alignItems: 'center',
    width: 65,
  },
  brandCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  brandCircleActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  brandInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  brandCount: {
    fontSize: 9,
    marginTop: 1,
  },
  featuredCarousel: {
    paddingHorizontal: 16,
  },
  trustBannerWrap: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 61, 46, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderRadius: 18,
    padding: 14,
  },
  trustIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trustTextWrap: {
    flex: 1,
  },
  trustTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
  },
  trustSubtitle: {
    color: '#A7F3D0',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
    opacity: 0.85,
  },
  verticalList: {
    paddingHorizontal: 16,
  },
  emptyCountryWrap: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyCountryText: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  viewMoreSection: {
    marginTop: 6,
    marginBottom: 16,
    gap: 10,
  },
  viewMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
  },
  viewMoreBtnText: {
    fontSize: 13,
    fontWeight: '800',
  },
  seeAllBrowseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
  },
  seeAllBrowseBtnText: {
    color: '#15110A',
    fontSize: 13,
    fontWeight: '800',
  },
});
