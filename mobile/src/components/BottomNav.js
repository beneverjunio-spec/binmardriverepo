import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';

export default function BottomNav() {
  const { activeTab, setActiveTab, favorites, colors } = useApp();

  return (
    <View style={[styles.navContainer, { backgroundColor: colors.bgSurface, borderTopColor: colors.borderLight }]}>
      {/* 1. Home */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.8}
        onPress={() => setActiveTab('home')}
      >
        <Ionicons
          name={activeTab === 'home' ? 'home' : 'home-outline'}
          size={22}
          color={activeTab === 'home' ? colors.primaryGold : colors.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'home' ? colors.primaryGold : colors.textMuted },
            activeTab === 'home' && styles.tabLabelActive,
          ]}
        >
          Home
        </Text>
        {activeTab === 'home' && <View style={[styles.activeBar, { backgroundColor: colors.primaryGold }]} />}
      </TouchableOpacity>

      {/* 2. Buy / Browse */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.8}
        onPress={() => setActiveTab('browse')}
      >
        <Ionicons
          name={activeTab === 'browse' ? 'search' : 'search-outline'}
          size={22}
          color={activeTab === 'browse' ? colors.primaryGold : colors.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'browse' ? colors.primaryGold : colors.textMuted },
            activeTab === 'browse' && styles.tabLabelActive,
          ]}
        >
          Buy
        </Text>
        {activeTab === 'browse' && <View style={[styles.activeBar, { backgroundColor: colors.primaryGold }]} />}
      </TouchableOpacity>

      {/* 3. Center Elevated Gold '+' Sell Button */}
      <View style={styles.centerButtonContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => setActiveTab('sell')}
        >
          <LinearGradient
            colors={colors.goldGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.centerFab, activeTab === 'sell' && styles.centerFabActive]}
          >
            <Ionicons name="add" size={30} color="#15110A" />
          </LinearGradient>
        </TouchableOpacity>
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'sell' ? colors.primaryGold : colors.textMuted, marginTop: 4 },
            activeTab === 'sell' && styles.tabLabelActive,
          ]}
        >
          Sell
        </Text>
      </View>

      {/* 4. Saved / Favorites */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.8}
        onPress={() => setActiveTab('favorites')}
      >
        <View style={styles.iconWithBadge}>
          <Ionicons
            name={activeTab === 'favorites' ? 'heart' : 'heart-outline'}
            size={22}
            color={activeTab === 'favorites' ? colors.primaryGold : colors.textMuted}
          />
          {favorites.length > 0 && (
            <View style={[styles.favBadge, { backgroundColor: colors.primaryGold }]}>
              <Text style={styles.favBadgeText}>{favorites.length}</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'favorites' ? colors.primaryGold : colors.textMuted },
            activeTab === 'favorites' && styles.tabLabelActive,
          ]}
        >
          Saved
        </Text>
        {activeTab === 'favorites' && <View style={[styles.activeBar, { backgroundColor: colors.primaryGold }]} />}
      </TouchableOpacity>

      {/* 5. Profile */}
      <TouchableOpacity
        style={styles.tabButton}
        activeOpacity={0.8}
        onPress={() => setActiveTab('profile')}
      >
        <Ionicons
          name={activeTab === 'profile' ? 'person' : 'person-outline'}
          size={22}
          color={activeTab === 'profile' ? colors.primaryGold : colors.textMuted}
        />
        <Text
          style={[
            styles.tabLabel,
            { color: activeTab === 'profile' ? colors.primaryGold : colors.textMuted },
            activeTab === 'profile' && styles.tabLabelActive,
          ]}
        >
          Profile
        </Text>
        {activeTab === 'profile' && <View style={[styles.activeBar, { backgroundColor: colors.primaryGold }]} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 6,
    position: 'relative',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: -12,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C8A04C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 8,
  },
  centerFabActive: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.05 }],
  },
  iconWithBadge: {
    position: 'relative',
  },
  favBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  favBadgeText: {
    color: '#15110A',
    fontSize: 9,
    fontWeight: '900',
  },
});
