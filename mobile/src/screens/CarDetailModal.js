import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function CarDetailModal() {
  const { selectedListing, closeListingDetails, isFavorite, toggleFavorite, colors } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!selectedListing) return null;

  const liked = isFavorite(selectedListing.id);
  const formattedPrice = new Intl.NumberFormat('en-US').format(selectedListing.price);
  const images = selectedListing.images || [];

  const shareUrl = `https://binmardrive.com/listing/${selectedListing.id}`;
  const shareTitle = `${selectedListing.year} ${selectedListing.make} ${selectedListing.model} on Binmar Drive`;
  const shareMessage = `Check out this ${selectedListing.year} ${selectedListing.make} ${selectedListing.model} (${selectedListing.currency || 'AED'} ${formattedPrice}) in ${selectedListing.city || 'Dubai'}, ${selectedListing.country || 'UAE'} on Binmar Drive: ${shareUrl}`;

  const handleNativeShare = async () => {
    try {
      await Share.share({
        title: shareTitle,
        message: shareMessage,
        url: shareUrl,
      });
    } catch (err) {
      console.log('Share error:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (Clipboard && Clipboard.setStringAsync) {
        await Clipboard.setStringAsync(shareUrl);
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } catch (err) {
      console.log('Copy error:', err);
    }
  };

  const handleShareWhatsApp = () => {
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`);
  };

  const handleShareFacebook = () => {
    Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  };

  const handleShareTwitter = () => {
    Linking.openURL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`);
  };

  const handleShareTelegram = () => {
    Linking.openURL(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`);
  };

  const handleWhatsApp = () => {
    const phone = (selectedListing.whatsappNumber || selectedListing.sellerPhone || '+971501234567').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Hi, I'm interested in the ${selectedListing.year} ${selectedListing.make} ${selectedListing.model} listed on Binmar Drive (Ref: ${selectedListing.id}). Is it still available?`);
    Linking.openURL(`https://wa.me/${phone}?text=${message}`);
  };

  const handleCall = () => {
    const phone = (selectedListing.sellerPhone || '+971501234567').replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phone}`);
  };

  return (
    <Modal
      visible={!!selectedListing}
      animationType="slide"
      onRequestClose={closeListingDetails}
    >
      <View style={[styles.container, { backgroundColor: colors.bgDark }]}>
        {/* Scrollable details */}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Gallery with image counter */}
          <View style={styles.galleryWrap}>
            <Image
              source={{ uri: images[activeImageIndex] || images[0] }}
              style={styles.mainImage}
              resizeMode="cover"
            />

            {/* Top Bar with Back, Share, and Fav */}
            <View style={styles.topFloatBar}>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={closeListingDetails}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.topRightActions}>
                {/* Share Button */}
                <TouchableOpacity
                  style={styles.circleBtn}
                  onPress={() => setIsShareModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="share-social-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Favorite Button */}
                <TouchableOpacity
                  style={[styles.circleBtn, liked && styles.circleBtnLiked]}
                  onPress={() => toggleFavorite(selectedListing.id)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={liked ? 'heart' : 'heart-outline'}
                    size={20}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Gallery Counter */}
            <View style={styles.counterBadge}>
              <Text style={styles.counterText}>
                {activeImageIndex + 1} / {images.length || 1}
              </Text>
            </View>
          </View>

          {/* Thumbnail Bar */}
          {images.length > 1 && (
            <ScrollView
              horizontal
              style={[styles.thumbsRow, { backgroundColor: colors.bgSurface, borderBottomColor: colors.borderLight, borderBottomWidth: 1 }]}
              showsHorizontalScrollIndicator={false}
            >
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbWrap,
                    activeImageIndex === idx && { borderColor: colors.primaryGold },
                  ]}
                  onPress={() => setActiveImageIndex(idx)}
                >
                  <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Vehicle Information */}
          <View style={styles.detailsBody}>
            {/* Badges */}
            <View style={styles.badgesRow}>
              {selectedListing.isSold ? (
                <View style={styles.soldModalBadge}>
                  <Ionicons name="pricetag" size={12} color="#FFFFFF" style={{ marginRight: 5 }} />
                  <Text style={styles.soldModalBadgeText}>SOLD</Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.typeBadge,
                    selectedListing.type === 'rent'
                      ? { backgroundColor: colors.primaryGold }
                      : { backgroundColor: '#15110A' },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeBadgeText,
                      selectedListing.type === 'rent' ? { color: '#15110A' } : { color: '#FFFFFF' },
                    ]}
                  >
                    {selectedListing.type === 'rent' ? 'For Rent' : 'For Sale'}
                  </Text>
                </View>
              )}

              {selectedListing.verified && (
                <View style={[styles.verifiedBadge, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                  <Ionicons name="shield-checkmark" size={13} color={colors.verified} />
                  <Text style={[styles.verifiedText, { color: colors.verified }]}>Verified Dealer</Text>
                </View>
              )}
            </View>

            {/* Title & Trim */}
            <Text style={[styles.carHeading, { color: colors.textPrimary }]}>
              {selectedListing.year} {selectedListing.make} {selectedListing.model}
            </Text>
            {selectedListing.trim ? (
              <Text style={[styles.carTrimHeading, { color: colors.textMuted }]}>{selectedListing.trim}</Text>
            ) : null}

            {/* Price Box */}
            <View style={[styles.priceCard, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
              <View>
                {selectedListing.isSold ? (
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={styles.soldPricePill}>
                        <Text style={styles.soldPricePillText}>SOLD</Text>
                      </View>
                      <Text style={[styles.priceValue, { color: colors.textMuted, textDecorationLine: 'line-through' }]}>
                        {selectedListing.currency || (selectedListing.country === 'Saudi Arabia' ? 'SAR' : (selectedListing.country === 'Qatar' ? 'QAR' : (selectedListing.country === 'Kuwait' ? 'KWD' : 'AED')))} {formattedPrice}
                      </Text>
                    </View>
                    <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700', marginTop: 4 }}>
                      This vehicle is no longer available for purchase
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.priceValue, { color: colors.primaryGold }]}>
                    {selectedListing.currency || (selectedListing.country === 'Saudi Arabia' ? 'SAR' : (selectedListing.country === 'Qatar' ? 'QAR' : (selectedListing.country === 'Kuwait' ? 'KWD' : 'AED')))} {formattedPrice}
                    {selectedListing.type === 'rent' && <Text style={[styles.perDaySuffix, { color: colors.textMuted }]}> / day</Text>}
                  </Text>
                )}
              </View>
              <View style={[styles.locationTag, { backgroundColor: colors.bgCardLight }]}>
                <Ionicons name="location" size={14} color={colors.primaryGold} />
                <Text style={[styles.locationTagText, { color: colors.textSecondary }]}>
                  {selectedListing.city}, {selectedListing.country}
                </Text>
              </View>
            </View>

            {/* Key Specs Grid */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Overview & Specifications</Text>
            <View style={styles.specsGrid}>
              <View style={[styles.specBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="speedometer-outline" size={20} color={colors.primaryGold} />
                <Text style={[styles.specBoxLabel, { color: colors.textMuted }]}>Mileage</Text>
                <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>{selectedListing.mileageKm || '0'} km</Text>
              </View>

              <View style={[styles.specBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="flame-outline" size={20} color={colors.primaryGold} />
                <Text style={[styles.specBoxLabel, { color: colors.textMuted }]}>Engine</Text>
                <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
                  {selectedListing.specs?.engine || '3.5L V6'}
                </Text>
              </View>

              <View style={[styles.specBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="flash-outline" size={20} color={colors.primaryGold} />
                <Text style={[styles.specBoxLabel, { color: colors.textMuted }]}>Power</Text>
                <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
                  {selectedListing.specs?.power || '400+ HP'}
                </Text>
              </View>

              <View style={[styles.specBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="settings-outline" size={20} color={colors.primaryGold} />
                <Text style={[styles.specBoxLabel, { color: colors.textMuted }]}>Transmission</Text>
                <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
                  {selectedListing.transmission || 'Automatic'}
                </Text>
              </View>

              <View style={[styles.specBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="color-filter-outline" size={20} color={colors.primaryGold} />
                <Text style={[styles.specBoxLabel, { color: colors.textMuted }]}>Fuel</Text>
                <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>{selectedListing.fuel || 'Petrol'}</Text>
              </View>

              <View style={[styles.specBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="people-outline" size={20} color={colors.primaryGold} />
                <Text style={[styles.specBoxLabel, { color: colors.textMuted }]}>Seats</Text>
                <Text style={[styles.specBoxValue, { color: colors.textPrimary }]}>
                  {selectedListing.specs?.seats ? `${selectedListing.specs.seats} Seats` : '5 Seats'}
                </Text>
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Vehicle Description</Text>
            <View style={[styles.descCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
              <Text style={[styles.descText, { color: colors.textSecondary }]}>
                {selectedListing.description ||
                  'No additional description provided. Contact seller for complete maintenance logs, inspection certificate, and warranty information.'}
              </Text>
            </View>

            {/* Seller Contact Card */}
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Seller Information</Text>
            <View style={[styles.sellerCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
              <View style={[styles.sellerAvatar, { backgroundColor: colors.primaryGold }]}>
                <Text style={styles.sellerAvatarText}>
                  {(selectedListing.sellerName || 'B')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.sellerInfo}>
                <Text style={[styles.sellerName, { color: colors.textPrimary }]}>{selectedListing.sellerName || 'Verified Seller'}</Text>
                <Text style={[styles.sellerRole, { color: colors.textMuted }]}>
                  {selectedListing.sellerType || 'Dealer'} • {selectedListing.city}
                </Text>
              </View>
              <View style={styles.verifiedIconWrap}>
                <Ionicons name="checkmark-circle" size={20} color={colors.verified} />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom CTA Row: WhatsApp & Call */}
        <View style={[styles.bottomBar, { backgroundColor: colors.bgSurface, borderTopColor: colors.borderLight }]}>
          {selectedListing.isSold ? (
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.soldNoticeBox, { backgroundColor: colors.bgCardLight, borderColor: colors.border }]}>
                <Ionicons name="lock-closed" size={16} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={[styles.soldNoticeText, { color: colors.textSecondary }]}>Vehicle Sold</Text>
              </View>

              <TouchableOpacity
                style={[styles.whatsappButton, { flex: 1, backgroundColor: '#374151' }]}
                activeOpacity={0.85}
                onPress={() => {
                  const phone = (selectedListing.whatsappNumber || selectedListing.sellerPhone || '+971501234567').replace(/[^0-9]/g, '');
                  const message = encodeURIComponent(`Hi, I saw the ${selectedListing.year} ${selectedListing.make} ${selectedListing.model} on Binmar Drive. Since it is sold, do you have similar vehicles available?`);
                  Linking.openURL(`https://wa.me/${phone}?text=${message}`);
                }}
              >
                <Ionicons name="logo-whatsapp" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.whatsappButtonText}>Ask for Similar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.callButton, { backgroundColor: colors.bgCardLight, borderColor: colors.border }]}
                activeOpacity={0.85}
                onPress={handleCall}
              >
                <Ionicons name="call" size={18} color={colors.textPrimary} />
                <Text style={[styles.callButtonText, { color: colors.textPrimary }]}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.whatsappButton}
                activeOpacity={0.85}
                onPress={handleWhatsApp}
              >
                <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                <Text style={styles.whatsappButtonText}>Chat on WhatsApp</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Social Media & Link Share Modal */}
        <Modal
          visible={isShareModalOpen}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsShareModalOpen(false)}
        >
          <View style={styles.shareOverlay}>
            <TouchableOpacity
              style={styles.shareBackdrop}
              activeOpacity={1}
              onPress={() => setIsShareModalOpen(false)}
            />
            <View style={[styles.shareSheet, { backgroundColor: colors.bgSurface, borderTopColor: colors.border }]}>
              <View style={styles.sheetDragBar} />

              {/* Header */}
              <View style={[styles.shareHeader, { borderBottomColor: colors.borderLight }]}>
                <View style={styles.shareHeaderLeft}>
                  <Ionicons name="share-social" size={20} color={colors.primaryGold} />
                  <Text style={[styles.shareTitle, { color: colors.textPrimary }]}>Share Vehicle</Text>
                </View>
                <TouchableOpacity
                  style={[styles.shareCloseBtn, { backgroundColor: colors.bgCard }]}
                  onPress={() => setIsShareModalOpen(false)}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Vehicle Mini Preview */}
              <View style={[styles.vehiclePreviewCard, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Image
                  source={{ uri: images[0] }}
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.previewInfo}>
                  <Text style={[styles.previewTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                    {selectedListing.year} {selectedListing.make} {selectedListing.model}
                  </Text>
                  <Text style={[styles.previewPrice, { color: colors.primaryGold }]}>
                    {selectedListing.currency || 'AED'} {formattedPrice}
                  </Text>
                  <Text style={[styles.previewSub, { color: colors.textMuted }]} numberOfLines={1}>
                    {selectedListing.city || 'Dubai'}, {selectedListing.country || 'UAE'}
                  </Text>
                </View>
              </View>

              {/* Link Copy Box */}
              <Text style={[styles.shareSectionLabel, { color: colors.textSecondary }]}>VEHICLE LINK</Text>
              <View style={[styles.linkBox, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
                <Ionicons name="link-outline" size={16} color={colors.primaryGold} style={{ marginRight: 8 }} />
                <Text style={[styles.linkText, { color: colors.textMuted }]} numberOfLines={1}>
                  {shareUrl}
                </Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copiedLink && styles.copyBtnSuccess]}
                  onPress={handleCopyLink}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name={copiedLink ? 'checkmark' : 'copy-outline'}
                    size={14}
                    color={copiedLink ? '#FFFFFF' : '#15110A'}
                  />
                  <Text style={[styles.copyBtnText, copiedLink && { color: '#FFFFFF' }]}>
                    {copiedLink ? 'Copied!' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Social Media Sharing Channels */}
              <Text style={[styles.shareSectionLabel, { color: colors.textSecondary }]}>SHARE TO SOCIAL MEDIA</Text>
              <View style={styles.socialGrid}>
                {/* WhatsApp */}
                <TouchableOpacity
                  style={styles.socialCol}
                  onPress={handleShareWhatsApp}
                  activeOpacity={0.8}
                >
                  <View style={[styles.socialIconWrap, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>WhatsApp</Text>
                </TouchableOpacity>

                {/* Facebook */}
                <TouchableOpacity
                  style={styles.socialCol}
                  onPress={handleShareFacebook}
                  activeOpacity={0.8}
                >
                  <View style={[styles.socialIconWrap, { backgroundColor: '#1877F2' }]}>
                    <Ionicons name="logo-facebook" size={24} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>Facebook</Text>
                </TouchableOpacity>

                {/* X / Twitter */}
                <TouchableOpacity
                  style={styles.socialCol}
                  onPress={handleShareTwitter}
                  activeOpacity={0.8}
                >
                  <View style={[styles.socialIconWrap, { backgroundColor: '#111111', borderWidth: 1, borderColor: '#333333' }]}>
                    <Ionicons name="logo-twitter" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>X</Text>
                </TouchableOpacity>

                {/* Telegram */}
                <TouchableOpacity
                  style={styles.socialCol}
                  onPress={handleShareTelegram}
                  activeOpacity={0.8}
                >
                  <View style={[styles.socialIconWrap, { backgroundColor: '#0088CC' }]}>
                    <Ionicons name="paper-plane" size={20} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>Telegram</Text>
                </TouchableOpacity>

                {/* System Share (More) */}
                <TouchableOpacity
                  style={styles.socialCol}
                  onPress={handleNativeShare}
                  activeOpacity={0.8}
                >
                  <View style={[styles.socialIconWrap, { backgroundColor: colors.primaryGold }]}>
                    <Ionicons name="share-outline" size={22} color="#15110A" />
                  </View>
                  <Text style={[styles.socialLabel, { color: colors.textPrimary }]}>More</Text>
                </TouchableOpacity>
              </View>

              {/* Quick System Share Button */}
              <TouchableOpacity
                style={[styles.systemShareBtn, { backgroundColor: colors.bgCard, borderColor: colors.border }]}
                onPress={handleNativeShare}
                activeOpacity={0.8}
              >
                <Ionicons name="share-social-outline" size={18} color={colors.primaryGold} />
                <Text style={[styles.systemShareText, { color: colors.textPrimary }]}>
                  More sharing options (AirDrop, Messages, etc.)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  galleryWrap: {
    width: '100%',
    height: 280,
    position: 'relative',
    backgroundColor: '#1E1A14',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  topFloatBar: {
    position: 'absolute',
    top: 45,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnLiked: {
    backgroundColor: '#EF4444',
  },
  counterBadge: {
    position: 'absolute',
    bottom: 14,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  thumbsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  thumbWrap: {
    width: 60,
    height: 44,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  detailsBody: {
    padding: 18,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '700',
  },
  carHeading: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  carTrimHeading: {
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  priceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginVertical: 16,
  },
  priceLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  perDaySuffix: {
    fontSize: 13,
    fontWeight: '500',
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  locationTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 10,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specBox: {
    width: (width - 36 - 10) / 2,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  specBoxLabel: {
    fontSize: 11,
    marginTop: 6,
  },
  specBoxValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  descCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  descText: {
    fontSize: 13,
    lineHeight: 20,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sellerAvatarText: {
    color: '#15110A',
    fontSize: 20,
    fontWeight: '900',
  },
  sellerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  sellerRole: {
    fontSize: 11,
    marginTop: 2,
  },
  verifiedIconWrap: {
    marginLeft: 8,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 52,
  },
  callButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  whatsappButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#25D366',
    borderRadius: 16,
    height: 52,
    shadowColor: '#25D366',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  topRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shareOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  shareBackdrop: {
    flex: 1,
  },
  shareSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 38 : 24,
    paddingTop: 8,
  },
  sheetDragBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  shareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  shareHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shareTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  shareCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehiclePreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginTop: 14,
    marginBottom: 16,
    gap: 12,
  },
  previewImage: {
    width: 60,
    height: 50,
    borderRadius: 8,
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewPrice: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  previewSub: {
    fontSize: 11,
    marginTop: 2,
  },
  shareSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  linkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    marginBottom: 18,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C8A04C',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  copyBtnSuccess: {
    backgroundColor: '#10B981',
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15110A',
  },
  socialGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  socialCol: {
    alignItems: 'center',
    width: 60,
  },
  socialIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  socialLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  systemShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  systemShareText: {
    fontSize: 12,
    fontWeight: '700',
  },
  soldModalBadge: {
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  soldModalBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  soldPricePill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  soldPricePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  soldNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  soldNoticeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
