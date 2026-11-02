import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

export default function CarCard({ listing, compact = false }) {
  const { isFavorite, toggleFavorite, openListingDetails, colors } = useApp();
  const liked = isFavorite(listing.id);

  const formattedPrice = new Intl.NumberFormat('en-US').format(listing.price);

  const currency =
    listing.currency ||
    (listing.country === 'Saudi Arabia'
      ? 'SAR'
      : listing.country === 'Qatar'
      ? 'QAR'
      : listing.country === 'Kuwait'
      ? 'KWD'
      : listing.country === 'Oman'
      ? 'OMR'
      : listing.country === 'Bahrain'
      ? 'BHD'
      : 'AED');

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
        compact && styles.cardCompact,
      ]}
      activeOpacity={0.92}
      onPress={() => openListingDetails(listing)}
    >
      {/* Top Image & Floating Badges */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: listing.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Top Badges */}
        <View style={styles.topBadgesRow}>
          <View style={styles.leftBadges}>
            {listing.isSold ? (
              <View style={styles.soldBadge}>
                <Ionicons name="pricetag" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.soldBadgeText}>SOLD</Text>
              </View>
            ) : (
              <>
                {listing.featured && (
                  <View style={[styles.featuredBadge, { backgroundColor: colors.primaryGold }]}>
                    <Text style={styles.featuredText}>FEATURED</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.typeBadge,
                    listing.type === 'rent' ? styles.rentBadge : styles.saleBadge,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      listing.type === 'rent' ? styles.rentText : styles.saleText,
                    ]}
                  >
                    {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Action Buttons: Share & Favorite */}
          <View style={styles.cardActionsRight}>
            <TouchableOpacity
              style={styles.favBtn}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                const url = `https://binmardrive.com/listing/${listing.id}`;
                Share.share({
                  title: `${listing.isSold ? '[SOLD] ' : ''}${listing.year} ${listing.make} ${listing.model}`,
                  message: `Check out this ${listing.year} ${listing.make} ${listing.model} (${currency} ${formattedPrice}) on Binmar Drive: ${url}`,
                  url: url,
                });
              }}
            >
              <Ionicons name="share-social-outline" size={15} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.favBtn, liked && styles.favBtnActive]}
              activeOpacity={0.8}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(listing.id);
              }}
            >
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Verified Badge */}
        {listing.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.verified} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Details Body */}
      <View style={styles.body}>
        {/* Title and Price */}
        <View style={styles.titlePriceRow}>
          <View style={styles.titleWrap}>
            <Text style={[styles.carTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {listing.year} {listing.make} {listing.model}
            </Text>
            {listing.trim ? (
              <Text style={[styles.carTrim, { color: colors.textMuted }]} numberOfLines={1}>
                {listing.trim}
              </Text>
            ) : null}
          </View>

          <View style={styles.priceWrap}>
            {listing.isSold ? (
              <View style={styles.soldPriceCol}>
                <Text style={[styles.priceText, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                  {currency} {formattedPrice}
                </Text>
                <Text style={[styles.soldSmallText, { color: '#EF4444' }]}>Sold</Text>
              </View>
            ) : (
              <>
                <Text style={[styles.priceText, { color: colors.primaryGold }]}>{currency} {formattedPrice}</Text>
                {listing.type === 'rent' && (
                  <Text style={[styles.perDayText, { color: colors.textMuted }]}>per day</Text>
                )}
              </>
            )}
          </View>
        </View>

        {/* Specs Row */}
        <View style={styles.specsRow}>
          <View style={styles.specItem}>
            <Ionicons name="speedometer-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>{listing.mileageKm} km</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="color-filter-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>{listing.fuel}</Text>
          </View>
          <View style={styles.specItem}>
            <Ionicons name="settings-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.specText, { color: colors.textSecondary }]}>Auto</Text>
          </View>
        </View>

        {/* Footer with Location and Time */}
        <View style={[styles.footerRow, { borderTopColor: colors.borderLight }]}>
          <View style={styles.locationWrap}>
            <Ionicons name="location-outline" size={12} color={colors.primaryGold} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {listing.city}
            </Text>
          </View>
          <Text style={[styles.timeText, { color: colors.textMuted }]}>{listing.postedDaysAgo || 'Recently'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  cardCompact: {
    width: 250,
    marginRight: 14,
    marginBottom: 0,
  },
  imageContainer: {
    width: '100%',
    height: 155,
    position: 'relative',
    backgroundColor: '#1E1A14',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  featuredBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  featuredText: {
    color: '#15110A',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  saleBadge: {
    backgroundColor: '#15110A',
  },
  rentBadge: {
    backgroundColor: '#FFFFFF',
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  saleText: {
    color: '#FFFFFF',
  },
  rentText: {
    color: '#15110A',
  },
  cardActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: {
    backgroundColor: '#EF4444',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  verifiedText: {
    color: '#15110A',
    fontSize: 10,
    fontWeight: '700',
  },
  body: {
    padding: 12,
  },
  titlePriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleWrap: {
    flex: 1,
    marginRight: 8,
  },
  carTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  carTrim: {
    fontSize: 11,
    marginTop: 2,
  },
  priceWrap: {
    alignItems: 'flex-end',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
  },
  perDayText: {
    fontSize: 10,
  },
  specsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specText: {
    fontSize: 11,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 10,
  },
  soldBadge: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },
  soldBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  soldPriceCol: {
    alignItems: 'flex-end',
    gap: 1,
  },
  soldSmallText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
