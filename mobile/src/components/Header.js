import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { selectedCountry, setIsCountryModalOpen, themeMode, toggleTheme, colors } = useApp();

  return (
    <View style={[styles.headerContainer, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderLight }]}>
      {/* Top row with Logo, Theme toggle and Notification */}
      <View style={styles.topRow}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
          <View style={styles.titleWrap}>
            <Text style={[styles.logoTextBinmar, { color: colors.textPrimary }]}>BINMAR</Text>
            <Text style={[styles.logoTextDrive, { color: colors.primaryGold }]}>DRIVE</Text>
          </View>
        </View>

        <View style={styles.actionsRight}>
          {/* Theme Toggle Button (Dark / Light) */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.bgCardLight, borderColor: colors.borderLight }]}
            activeOpacity={0.8}
            onPress={toggleTheme}
          >
            <Ionicons
              name={themeMode === 'dark' ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={themeMode === 'dark' ? '#FBBF24' : colors.primaryGold}
            />
          </TouchableOpacity>

          {/* Notification Button */}
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: colors.bgCardLight, borderColor: colors.borderLight }]}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textSecondary} />
            <View style={[styles.notifBadge, { borderColor: colors.bgSurface }]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Country Selector Bar */}
      <TouchableOpacity
        style={[styles.locationBar, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
        activeOpacity={0.85}
        onPress={() => setIsCountryModalOpen(true)}
      >
        <Ionicons name="location-sharp" size={18} color={colors.primaryGold} />
        <View style={styles.locationTextWrap}>
          <Text style={[styles.locationSub, { color: colors.textMuted }]}>BROWSE IN</Text>
          <Text style={[styles.locationMain, { color: colors.textPrimary }]}>{selectedCountry}</Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    marginRight: 8,
    borderRadius: 18,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoTextBinmar: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  logoTextDrive: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
    marginLeft: 3,
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  locationSub: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  locationMain: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
});
