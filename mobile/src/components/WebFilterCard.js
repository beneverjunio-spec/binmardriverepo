import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { VEHICLE_MAKES, COUNTRIES, getCountryCurrency } from '../constants/data';

export default function WebFilterCard({ onSearch, style }) {
  const {
    selectedBrand,
    setSelectedBrand,
    selectedCountry,
    setSelectedCountry,
    selectedType,
    setSelectedType,
    selectedSeller,
    setSelectedSeller,
    sellerOptions,
    maxPrice,
    setMaxPrice,
    setActiveTab,
    refreshListings,
    resetFilters,
    colors,
  } = useApp();

  // Modal selector states
  const [activeModal, setActiveModal] = useState(null); // 'make', 'country', 'type', 'seller', null
  const [sellerSearch, setSellerSearch] = useState('');

  const currency = getCountryCurrency(selectedCountry);

  const isFilterActive =
    selectedBrand !== 'All' ||
    (selectedCountry !== 'All Middle East' && selectedCountry !== 'Any country') ||
    selectedType !== 'all' ||
    (selectedSeller && selectedSeller !== 'All') ||
    Boolean(maxPrice && maxPrice.trim());

  const handleSearch = () => {
    refreshListings();
    if (setActiveTab) {
      setActiveTab('browse');
    }
    if (onSearch) {
      onSearch();
    }
  };

  // Type labels helper
  const getTypeLabel = (type) => {
    if (type === 'buy') return 'For sale';
    if (type === 'rent') return 'For rent';
    return 'Buy or rent';
  };

  // Country label helper
  const getCountryLabel = (country) => {
    if (!country || country === 'All Middle East' || country === 'Any country') {
      return 'Any country';
    }
    if (country === 'United Arab Emirates') return 'UAE';
    return country;
  };

  return (
    <View style={[styles.cardContainer, style]}>
      {/* Filter Grid (Make, Country, Type, Seller, Max Price) */}
      <View style={styles.grid}>
        {/* 1. MAKE */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>MAKE</Text>
          <TouchableOpacity
            style={styles.selectBox}
            activeOpacity={0.8}
            onPress={() => setActiveModal('make')}
          >
            <Text
              style={[
                styles.selectBoxText,
                selectedBrand !== 'All' && styles.selectBoxTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedBrand === 'All' ? 'Any make' : selectedBrand}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7A6E5C" />
          </TouchableOpacity>
        </View>

        {/* 2. COUNTRY */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>COUNTRY</Text>
          <TouchableOpacity
            style={styles.selectBox}
            activeOpacity={0.8}
            onPress={() => setActiveModal('country')}
          >
            <Text
              style={[
                styles.selectBoxText,
                selectedCountry !== 'All Middle East' && styles.selectBoxTextActive,
              ]}
              numberOfLines={1}
            >
              {getCountryLabel(selectedCountry)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7A6E5C" />
          </TouchableOpacity>
        </View>

        {/* 3. TYPE */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>TYPE</Text>
          <TouchableOpacity
            style={styles.selectBox}
            activeOpacity={0.8}
            onPress={() => setActiveModal('type')}
          >
            <Text
              style={[
                styles.selectBoxText,
                selectedType !== 'all' && styles.selectBoxTextActive,
              ]}
              numberOfLines={1}
            >
              {getTypeLabel(selectedType)}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7A6E5C" />
          </TouchableOpacity>
        </View>

        {/* 4. SELLER (Matches Web Marketplace Filter) */}
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>SELLER</Text>
          <TouchableOpacity
            style={styles.selectBox}
            activeOpacity={0.8}
            onPress={() => {
              setSellerSearch('');
              setActiveModal('seller');
            }}
          >
            <Text
              style={[
                styles.selectBoxText,
                selectedSeller !== 'All' && styles.selectBoxTextActive,
              ]}
              numberOfLines={1}
            >
              {selectedSeller === 'All' ? 'Any seller' : selectedSeller}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#7A6E5C" />
          </TouchableOpacity>
        </View>

        {/* 5. MAX PRICE (Full Width) */}
        <View style={styles.fieldColFull}>
          <Text style={styles.fieldLabel} numberOfLines={1}>
            MAX PRICE {selectedCountry && selectedCountry !== 'All Middle East' ? `(${currency})` : ''}
          </Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.textInput}
              placeholder={
                selectedCountry && selectedCountry !== 'All Middle East'
                  ? `Max in ${currency}`
                  : 'Any price'
              }
              placeholderTextColor="#9E9484"
              value={maxPrice}
              onChangeText={setMaxPrice}
              keyboardType="numeric"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            {Boolean(maxPrice) && (
              <TouchableOpacity
                onPress={() => setMaxPrice('')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close-circle" size={16} color="#9E9484" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Search Button */}
      <TouchableOpacity
        style={styles.searchButtonWrap}
        activeOpacity={0.85}
        onPress={handleSearch}
      >
        <LinearGradient
          colors={['#E6C674', '#C8A04C', '#A8842F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.searchButton}
        >
          <Text style={styles.searchButtonText}>Search</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Active filters summary & Reset button */}
      {isFilterActive && (
        <View style={styles.resetRow}>
          <Text style={styles.activeFiltersLabel}>Filters applied</Text>
          <TouchableOpacity
            style={styles.resetBtn}
            activeOpacity={0.7}
            onPress={resetFilters}
          >
            <Ionicons name="refresh-outline" size={13} color="#C8A04C" />
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 1. MAKE SELECTOR MODAL */}
      <Modal
        visible={activeModal === 'make'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Make</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Choose vehicle manufacturer</Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgCard }]}
                onPress={() => setActiveModal(null)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalList}>
              {/* Option: Any make */}
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                  selectedBrand === 'All' && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                ]}
                onPress={() => {
                  setSelectedBrand('All');
                  setActiveModal(null);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    { color: colors.textPrimary },
                    selectedBrand === 'All' && { color: colors.primaryGold, fontWeight: '800' },
                  ]}
                >
                  Any make
                </Text>
                {selectedBrand === 'All' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primaryGold} />
                )}
              </TouchableOpacity>

              {/* Specific makes */}
              {VEHICLE_MAKES.map((make) => {
                const isSelected = selectedBrand.toLowerCase() === make.toLowerCase();
                return (
                  <TouchableOpacity
                    key={make}
                    style={[
                      styles.modalItem,
                      { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                      isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                    ]}
                    onPress={() => {
                      setSelectedBrand(make);
                      setActiveModal(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: colors.textPrimary },
                        isSelected && { color: colors.primaryGold, fontWeight: '800' },
                      ]}
                    >
                      {make}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primaryGold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. COUNTRY SELECTOR MODAL */}
      <Modal
        visible={activeModal === 'country'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Country</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Browse cars in GCC countries</Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgCard }]}
                onPress={() => setActiveModal(null)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalList}>
              {COUNTRIES.map((c) => {
                const isSelected =
                  (c.code === 'ALL' && (selectedCountry === 'All Middle East' || selectedCountry === 'Any country')) ||
                  selectedCountry === c.name;
                const displayLabel = c.code === 'ALL' ? 'Any country' : c.name;

                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.modalItem,
                      { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                      isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                    ]}
                    onPress={() => {
                      setSelectedCountry(c.name);
                      setActiveModal(null);
                    }}
                  >
                    <View style={styles.countryModalRow}>
                      <Text style={styles.modalFlag}>{c.flag}</Text>
                      <Text
                        style={[
                          styles.modalItemText,
                          { color: colors.textPrimary },
                          isSelected && { color: colors.primaryGold, fontWeight: '800' },
                        ]}
                      >
                        {displayLabel}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primaryGold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 3. TYPE SELECTOR MODAL */}
      <Modal
        visible={activeModal === 'type'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Type</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Choose buy, rent or all vehicles</Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgCard }]}
                onPress={() => setActiveModal(null)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalList}>
              {[
                { key: 'all', label: 'Buy or rent', desc: 'All vehicles' },
                { key: 'buy', label: 'For sale', desc: 'Vehicles available for purchase' },
                { key: 'rent', label: 'For rent', desc: 'Vehicles available for daily/monthly rental' },
              ].map((item) => {
                const isSelected = selectedType === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.modalItem,
                      { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                      isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                    ]}
                    onPress={() => {
                      setSelectedType(item.key);
                      setActiveModal(null);
                    }}
                  >
                    <View>
                      <Text
                        style={[
                          styles.modalItemText,
                          { color: colors.textPrimary },
                          isSelected && { color: colors.primaryGold, fontWeight: '800' },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={[styles.modalDescText, { color: colors.textMuted }]}>
                        {item.desc}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={colors.primaryGold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* 4. SELLER SELECTOR MODAL */}
      <Modal
        visible={activeModal === 'seller'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderLight }]}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Seller</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>Browse by verified dealers & private sellers</Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgCard }]}
                onPress={() => setActiveModal(null)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Quick search inside seller modal */}
            {sellerOptions && sellerOptions.length > 3 && (
              <View style={[styles.modalSearchBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="search" size={16} color={colors.textMuted} style={{ marginRight: 6 }} />
                <TextInput
                  style={[styles.modalSearchInput, { color: colors.textPrimary }]}
                  placeholder="Search seller or dealership..."
                  placeholderTextColor={colors.textMuted}
                  value={sellerSearch}
                  onChangeText={setSellerSearch}
                />
                {Boolean(sellerSearch) && (
                  <TouchableOpacity onPress={() => setSellerSearch('')}>
                    <Ionicons name="close-circle" size={16} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            <ScrollView contentContainerStyle={styles.modalList}>
              {/* Option: Any seller */}
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                  selectedSeller === 'All' && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                ]}
                onPress={() => {
                  setSelectedSeller('All');
                  setActiveModal(null);
                }}
              >
                <View style={styles.sellerModalRow}>
                  <View style={[styles.sellerIconBox, { backgroundColor: 'rgba(200, 160, 76, 0.15)' }]}>
                    <Ionicons name="people-outline" size={18} color={colors.primaryGold} />
                  </View>
                  <View>
                    <Text
                      style={[
                        styles.modalItemText,
                        { color: colors.textPrimary },
                        selectedSeller === 'All' && { color: colors.primaryGold, fontWeight: '800' },
                      ]}
                    >
                      Any seller
                    </Text>
                    <Text style={[styles.modalDescText, { color: colors.textMuted }]}>
                      All registered dealers & private sellers
                    </Text>
                  </View>
                </View>
                {selectedSeller === 'All' && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primaryGold} />
                )}
              </TouchableOpacity>

              {/* Specific registered sellers & listing sellers */}
              {(sellerOptions || [])
                .filter((s) => {
                  if (!sellerSearch.trim()) return true;
                  const q = sellerSearch.toLowerCase().trim();
                  return (
                    (s.name && s.name.toLowerCase().includes(q)) ||
                    (s.company_name && s.company_name.toLowerCase().includes(q))
                  );
                })
                .map((seller) => {
                  const sellerVal = seller.company_name || seller.name;
                  const isSelected = selectedSeller.toLowerCase() === sellerVal.toLowerCase();
                  return (
                    <TouchableOpacity
                      key={seller.id || sellerVal}
                      style={[
                        styles.modalItem,
                        { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                        isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                      ]}
                      onPress={() => {
                        setSelectedSeller(sellerVal);
                        setActiveModal(null);
                      }}
                    >
                      <View style={styles.sellerModalRow}>
                        <View style={[styles.sellerIconBox, { backgroundColor: 'rgba(200, 160, 76, 0.15)' }]}>
                          <Ionicons name="business-outline" size={18} color={colors.primaryGold} />
                        </View>
                        <View>
                          <Text
                            style={[
                              styles.modalItemText,
                              { color: colors.textPrimary },
                              isSelected && { color: colors.primaryGold, fontWeight: '800' },
                            ]}
                          >
                            {sellerVal}
                          </Text>
                          <Text style={[styles.modalDescText, { color: colors.textMuted }]}>
                            Verified Partner Dealership
                          </Text>
                        </View>
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primaryGold} />
                      )}
                    </TouchableOpacity>
                  );
                })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  fieldCol: {
    width: '48.5%',
    marginBottom: 12,
  },
  fieldColFull: {
    width: '100%',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B604D',
    letterSpacing: 0.8,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2D9CC',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  selectBoxText: {
    fontSize: 13,
    color: '#6B604D',
    fontWeight: '500',
    flex: 1,
  },
  selectBoxTextActive: {
    color: '#15110A',
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2D9CC',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 42,
  },
  textInput: {
    flex: 1,
    fontSize: 13,
    color: '#15110A',
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  searchButtonWrap: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 2,
  },
  searchButton: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  searchButtonText: {
    color: '#15110A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  resetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
  },
  activeFiltersLabel: {
    fontSize: 11,
    color: '#8A7E6C',
    fontWeight: '600',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  resetBtnText: {
    fontSize: 11,
    color: '#A8842F',
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    maxHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 13,
    padding: 0,
    margin: 0,
  },
  modalList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  countryModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerModalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sellerIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalFlag: {
    fontSize: 20,
    marginRight: 10,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalDescText: {
    fontSize: 11,
    marginTop: 2,
  },
});
