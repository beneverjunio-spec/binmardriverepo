import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../constants/data';
import { useApp } from '../context/AppContext';

export default function CountrySelectorModal() {
  const { isCountryModalOpen, setIsCountryModalOpen, selectedCountry, setSelectedCountry, colors } = useApp();

  const handleSelect = (name) => {
    setSelectedCountry(name);
    setIsCountryModalOpen(false);
  };

  return (
    <Modal
      visible={isCountryModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsCountryModalOpen(false)}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContainer, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.borderLight }]}>
            <View>
              <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>Select Country</Text>
              <Text style={[styles.sheetSubtitle, { color: colors.textMuted }]}>Browse cars across Middle East</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.bgCard }]}
              onPress={() => setIsCountryModalOpen(false)}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Countries list */}
          <ScrollView contentContainerStyle={styles.listContent}>
            {COUNTRIES.map((c) => {
              const isSelected = selectedCountry === c.name;
              return (
                <TouchableOpacity
                  key={c.code}
                  style={[
                    styles.countryItem,
                    { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                    isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => handleSelect(c.name)}
                >
                  <Text style={styles.flag}>{c.flag}</Text>
                  <View style={styles.countryTextWrap}>
                    <Text
                      style={[
                        styles.countryName,
                        { color: colors.textPrimary },
                        isSelected && { color: colors.primaryGold, fontWeight: '800' },
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text style={[styles.citiesText, { color: colors.textMuted }]}>
                      {c.cities.join(' • ')}
                    </Text>
                  </View>

                  {isSelected ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.primaryGold} />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  flag: {
    fontSize: 26,
    marginRight: 14,
  },
  countryTextWrap: {
    flex: 1,
  },
  countryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  citiesText: {
    fontSize: 11,
    marginTop: 2,
  },
});
