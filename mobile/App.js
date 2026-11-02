import React from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppProvider, useApp } from './src/context/AppContext';
import { COLORS } from './src/constants/theme';

import Header from './src/components/Header';
import BottomNav from './src/components/BottomNav';
import CountrySelectorModal from './src/components/CountrySelectorModal';

import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import SellScreen from './src/screens/SellScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import CarDetailModal from './src/screens/CarDetailModal';

function MainNavigator() {
  const { activeTab, colors, themeMode } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgSurface }]}>
      <StatusBar
        style={themeMode === 'dark' ? 'light' : 'dark'}
        backgroundColor={colors.bgSurface}
      />

      {/* Top Header */}
      <Header />

      {/* Screen Router */}
      <View style={[styles.screenContainer, { backgroundColor: colors.bgDark }]}>
        {activeTab === 'home' && <HomeScreen />}
        {activeTab === 'browse' && <BrowseScreen />}
        {activeTab === 'sell' && <SellScreen />}
        {activeTab === 'favorites' && <FavoritesScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </View>

      {/* Bottom Luxury 5-Tab Bar */}
      <BottomNav />

      {/* Modals */}
      <CarDetailModal />
      <CountrySelectorModal />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.binmarInk,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 440 : '100%',
    alignSelf: 'center',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: 'rgba(200, 160, 76, 0.25)',
        }
      : {}),
  },
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
