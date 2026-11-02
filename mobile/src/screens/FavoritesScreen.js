import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import CarCard from '../components/CarCard';

export default function FavoritesScreen() {
  const { masterListings, listings, favorites, setActiveTab, colors } = useApp();

  const allCars = masterListings && masterListings.length > 0 ? masterListings : listings;
  const savedCars = allCars.filter((c) => favorites.includes(c.id));

  return (
    <View style={[styles.container, { backgroundColor: colors.bgDark }]}>
      <View style={[styles.header, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderLight }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Saved Cars</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            {savedCars.length} {savedCars.length === 1 ? 'vehicle' : 'vehicles'} in your wishlist
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {savedCars.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
              <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Your Wishlist is Empty</Text>
            <Text style={[styles.emptySub, { color: colors.textMuted }]}>
              Tap the heart icon on any vehicle to save it for quick access and price tracking.
            </Text>
            <TouchableOpacity
              style={[styles.exploreBtn, { backgroundColor: colors.primaryGold }]}
              activeOpacity={0.85}
              onPress={() => setActiveTab('browse')}
            >
              <Text style={styles.exploreBtnText}>Browse Available Cars</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedCars.map((car) => <CarCard key={car.id} listing={car} />)
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  exploreBtn: {
    marginTop: 22,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
  },
  exploreBtnText: {
    color: '#15110A',
    fontSize: 13,
    fontWeight: '900',
  },
});
