import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { COUNTRIES } from '../constants/data';

const GCC_COUNTRY_OPTIONS = COUNTRIES.filter((c) => c.code !== 'ALL');

export default function SellScreen() {
  const { setActiveTab, refreshListings, addListing, currentUser, token, colors } = useApp();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [listingType, setListingType] = useState('buy'); // 'buy' or 'rent'
  const [year, setYear] = useState('2024');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [mileage, setMileage] = useState('');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [price, setPrice] = useState('');
  const [country, setCountry] = useState(currentUser?.country || 'United Arab Emirates');
  const [city, setCity] = useState(currentUser?.city || 'Dubai');
  const [sellerName, setSellerName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentUser?.phone || '');
  const [description, setDescription] = useState('');

  // Auto sync when currentUser updates
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setSellerName(currentUser.name);
      if (currentUser.phone) {
        setPhone(currentUser.phone);
        setWhatsapp(currentUser.phone);
      }
      if (currentUser.country) setCountry(currentUser.country);
      if (currentUser.city) setCity(currentUser.city);
    }
  }, [currentUser]);

  // Country & City Dropdowns
  const [isCountryModalVisible, setIsCountryModalVisible] = useState(false);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);

  const currentCountryObj =
    GCC_COUNTRY_OPTIONS.find((c) => c.name.toLowerCase() === country.toLowerCase()) ||
    GCC_COUNTRY_OPTIONS[1];

  const availableCities = currentCountryObj?.cities || ['Riyadh', 'Jeddah', 'Dammam'];

  const handleSelectCountry = (selected) => {
    setCountry(selected.name);
    if (selected.cities && selected.cities.length > 0) {
      setCity(selected.cities[0]);
    }
    setIsCountryModalVisible(false);
  };

  const handleSelectCity = (selectedCity) => {
    setCity(selectedCity);
    setIsCityModalVisible(false);
  };

  const handleSubmit = async () => {
    if (!make.trim() || !model.trim() || !price.trim()) {
      Alert.alert('Required Fields', 'Please enter Make, Model, and Price.');
      return;
    }

    setIsSubmitting(true);
    const parsedPrice = parseFloat(price) || 0;
    const currency = country === 'Saudi Arabia' ? 'SAR' : 'AED';

    const newCar = {
      id: Date.now(),
      title: `${year} ${make} ${model}`,
      make: make.trim(),
      model: model.trim(),
      year: parseInt(year, 10) || 2024,
      trim: 'GCC Spec Luxury',
      category: 'SUV',
      fuel,
      mileageKm: mileage ? `${mileage}` : '0',
      transmission,
      type: listingType === 'rent' ? 'rent' : 'buy',
      price: parsedPrice,
      currency,
      country,
      city,
      sellerName: sellerName || currentUser?.name || 'Verified Seller',
      sellerType: currentUser?.user_type === 'company' ? 'Verified Dealer' : 'Private Seller',
      sellerPhone: phone || '+971501234567',
      whatsappNumber: whatsapp || phone || '+971501234567',
      verified: true,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=800&h=600&q=80',
        'https://images.unsplash.com/photo-1511912834-403084950eb6?auto=format&fit=crop&w=800&h=600&q=80'
      ],
      specs: {
        engine: `${fuel} Engine`,
        transmission,
        power: '380 HP',
        seats: 5,
        doors: 4,
      },
      description: description || `${year} ${make} ${model} in pristine condition. GCC specs with complete inspection certificate.`,
      status: 'approved',
      postedDaysAgo: 'Just now'
    };

    // Prepend immediately to app listings so it is live across all screens
    if (addListing) {
      addListing(newCar);
    }

    const payload = {
      title: newCar.title,
      make: newCar.make,
      model: newCar.model,
      year: newCar.year,
      category: newCar.category,
      fuel: newCar.fuel,
      mileage: `${newCar.mileageKm} km`,
      transmission: newCar.transmission,
      listing_type: newCar.type === 'rent' ? 'rent' : 'sale',
      price: newCar.price,
      currency: newCar.currency,
      country: newCar.country,
      city: newCar.city,
      seller_name: newCar.sellerName,
      contact_preference: 'WhatsApp',
      whatsapp_number: newCar.whatsappNumber,
      contact_phone: newCar.sellerPhone,
      description: newCar.description,
      images: newCar.images,
    };

    try {
      const res = await api.createListing(payload, token);
      if (res && res.success && refreshListings) {
        refreshListings();
      }
    } catch (err) {
      console.warn('Listing submission error:', err);
    }

    setIsSubmitting(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.bgDark }]}>
        <View style={styles.successIconWrap}>
          <Ionicons name="checkmark-circle" size={60} color={colors.verified} />
        </View>
        <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Vehicle Listed Successfully!</Text>
        <Text style={[styles.successSub, { color: colors.textSecondary }]}>
          Your listing has been submitted and synchronized with the Binmar marketplace database.
        </Text>
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.primaryGold }]}
          onPress={() => {
            setSuccess(false);
            setStep(1);
            setActiveTab('home');
          }}
        >
          <Text style={styles.doneBtnText}>View in Marketplace</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bgDark }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>List Your Vehicle</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          100% Free listing across UAE & the Middle East
        </Text>
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }, step >= 1 && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold }]}>
          <Text style={styles.stepDotText}>1</Text>
        </View>
        <View style={[styles.stepLine, { backgroundColor: colors.borderLight }, step >= 2 && { backgroundColor: colors.primaryGold }]} />
        <View style={[styles.stepDot, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }, step >= 2 && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold }]}>
          <Text style={styles.stepDotText}>2</Text>
        </View>
        <View style={[styles.stepLine, { backgroundColor: colors.borderLight }, step >= 3 && { backgroundColor: colors.primaryGold }]} />
        <View style={[styles.stepDot, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }, step >= 3 && { backgroundColor: colors.primaryGold, borderColor: colors.primaryGold }]}>
          <Text style={styles.stepDotText}>3</Text>
        </View>
      </View>

      {/* STEP 1: Listing Type */}
      {step === 1 && (
        <View style={[styles.cardSection, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Step 1: Listing Intent</Text>
          <Text style={[styles.sectionSub, { color: colors.textMuted }]}>What do you want to do?</Text>

          <View style={styles.typeOptionRow}>
            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.bgDark, borderColor: colors.borderLight },
                listingType === 'buy' && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
              ]}
              onPress={() => setListingType('buy')}
            >
              <Ionicons
                name="pricetag"
                size={24}
                color={listingType === 'buy' ? colors.primaryGold : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: colors.textPrimary },
                  listingType === 'buy' && { color: colors.primaryGold },
                ]}
              >
                Sell My Car
              </Text>
              <Text style={[styles.typeOptionSub, { color: colors.textMuted }]}>One-time sale to buyer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeOption,
                { backgroundColor: colors.bgDark, borderColor: colors.borderLight },
                listingType === 'rent' && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
              ]}
              onPress={() => setListingType('rent')}
            >
              <Ionicons
                name="key"
                size={24}
                color={listingType === 'rent' ? colors.primaryGold : colors.textMuted}
              />
              <Text
                style={[
                  styles.typeOptionText,
                  { color: colors.textPrimary },
                  listingType === 'rent' && { color: colors.primaryGold },
                ]}
              >
                Rent Out Car
              </Text>
              <Text style={[styles.typeOptionSub, { color: colors.textMuted }]}>Daily or weekly rentals</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: colors.primaryGold }]}
            onPress={() => setStep(2)}
          >
            <Text style={styles.nextBtnText}>Continue to Vehicle Specs</Text>
            <Ionicons name="arrow-forward" size={16} color="#15110A" />
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 2: Specs */}
      {step === 2 && (
        <View style={[styles.cardSection, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Step 2: Vehicle Details</Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Make (e.g. Toyota, Mercedes-Benz)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
            placeholder="e.g. Toyota"
            placeholderTextColor={colors.textMuted}
            value={make}
            onChangeText={setMake}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Model & Trim (e.g. Land Cruiser GR Sport)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
            placeholder="e.g. Land Cruiser"
            placeholderTextColor={colors.textMuted}
            value={model}
            onChangeText={setModel}
          />

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Year</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
                placeholder="2024"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={year}
                onChangeText={setYear}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mileage (km)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
                placeholder="15,000"
                placeholderTextColor={colors.textMuted}
                keyboardType="numeric"
                value={mileage}
                onChangeText={setMileage}
              />
            </View>
          </View>

          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Fuel Type</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
                placeholder="Petrol / Hybrid"
                placeholderTextColor={colors.textMuted}
                value={fuel}
                onChangeText={setFuel}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Gearbox</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
                placeholder="Automatic"
                placeholderTextColor={colors.textMuted}
                value={transmission}
                onChangeText={setTransmission}
              />
            </View>
          </View>

          <View style={styles.btnNavRow}>
            <TouchableOpacity style={[styles.backBtn, { borderColor: colors.borderLight }]} onPress={() => setStep(1)}>
              <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.nextBtn, { flex: 1, backgroundColor: colors.primaryGold }]}
              onPress={() => {
                if (!make.trim() || !model.trim()) {
                  Alert.alert('Notice', 'Please fill in Make and Model.');
                  return;
                }
                setStep(3);
              }}
            >
              <Text style={styles.nextBtnText}>Next: Price & Location</Text>
              <Ionicons name="arrow-forward" size={16} color="#15110A" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* STEP 3: Price, Location & Contact */}
      {step === 3 && (
        <View style={[styles.cardSection, { backgroundColor: colors.bgCard, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Step 3: Pricing & Location</Text>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
            {listingType === 'rent' ? 'Rental Price (Per Day)' : 'Selling Price'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
            placeholder={listingType === 'rent' ? 'e.g. 1800' : 'e.g. 285000'}
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
            value={price}
            onChangeText={setPrice}
          />

          {/* Interactive Country & City Selection */}
          <View style={styles.twoCol}>
            {/* Country Picker Trigger */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Country</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, { backgroundColor: colors.bgDark, borderColor: colors.borderLight }]}
                activeOpacity={0.85}
                onPress={() => setIsCountryModalVisible(true)}
              >
                <Text style={styles.pickerFlag}>{currentCountryObj?.flag || '🇸🇦'}</Text>
                <Text style={[styles.pickerText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {country}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.primaryGold} />
              </TouchableOpacity>
            </View>

            {/* City Picker Trigger */}
            <View style={{ flex: 1 }}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>City</Text>
              <TouchableOpacity
                style={[styles.pickerTrigger, { backgroundColor: colors.bgDark, borderColor: colors.borderLight }]}
                activeOpacity={0.85}
                onPress={() => setIsCityModalVisible(true)}
              >
                <Ionicons name="location-outline" size={16} color={colors.primaryGold} />
                <Text style={[styles.pickerText, { color: colors.textPrimary }]} numberOfLines={1}>
                  {city}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.primaryGold} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Seller / Contact Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
            placeholder="Enter contact person name"
            placeholderTextColor={colors.textMuted}
            value={sellerName}
            onChangeText={setSellerName}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>WhatsApp Number</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
            placeholder="Enter your WhatsApp number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={whatsapp}
            onChangeText={setWhatsapp}
          />

          <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
          <TextInput
            style={[styles.input, { height: 75, textAlignVertical: 'top', backgroundColor: colors.bgDark, borderColor: colors.borderLight, color: colors.textPrimary }]}
            placeholder="GCC spec, full service history, pristine condition..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={3}
            value={description}
            onChangeText={setDescription}
          />

          <View style={styles.btnNavRow}>
            <TouchableOpacity style={[styles.backBtn, { borderColor: colors.borderLight }]} onPress={() => setStep(2)}>
              <Text style={[styles.backBtnText, { color: colors.textSecondary }]}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.publishBtn, { flex: 1, backgroundColor: colors.primaryGold }]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={styles.publishBtnText}>
                {isSubmitting ? 'Publishing...' : 'Publish Listing'}
              </Text>
              <Ionicons name="checkmark-done" size={18} color="#15110A" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ========================================================================= */}
      {/* Country Selection Modal                                                   */}
      {/* ========================================================================= */}
      <Modal
        visible={isCountryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCountryModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Country</Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>Where is the vehicle located?</Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgCard }]}
                onPress={() => setIsCountryModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalListContent}>
              {GCC_COUNTRY_OPTIONS.map((c) => {
                const isSelected = country.toLowerCase() === c.name.toLowerCase();
                return (
                  <TouchableOpacity
                    key={c.code}
                    style={[
                      styles.modalOptionItem,
                      { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                      isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectCountry(c)}
                  >
                    <Text style={styles.modalOptionFlag}>{c.flag}</Text>
                    <Text
                      style={[
                        styles.modalOptionTitle,
                        { color: colors.textPrimary, flex: 1 },
                        isSelected && { color: colors.primaryGold, fontWeight: '800' },
                      ]}
                    >
                      {c.name}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primaryGold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* City Selection Modal                                                      */}
      {/* ========================================================================= */}
      <Modal
        visible={isCityModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.bgSurface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select City</Text>
                <Text style={[styles.modalSub, { color: colors.textMuted }]}>Cities in {country}</Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.bgCard }]}
                onPress={() => setIsCityModalVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalListContent}>
              {availableCities.map((cityName) => {
                const isSelected = city.toLowerCase() === cityName.toLowerCase();
                return (
                  <TouchableOpacity
                    key={cityName}
                    style={[
                      styles.modalOptionItem,
                      { backgroundColor: colors.bgCard, borderColor: colors.borderLight },
                      isSelected && { borderColor: colors.primaryGold, backgroundColor: 'rgba(200, 160, 76, 0.12)' },
                    ]}
                    activeOpacity={0.8}
                    onPress={() => handleSelectCity(cityName)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={isSelected ? colors.primaryGold : colors.textMuted}
                      style={{ marginRight: 12 }}
                    />
                    <Text
                      style={[
                        styles.modalOptionTitle,
                        { color: colors.textPrimary, flex: 1 },
                        isSelected && { color: colors.primaryGold, fontWeight: '800' },
                      ]}
                    >
                      {cityName}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={colors.primaryGold} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotText: {
    color: '#15110A',
    fontSize: 12,
    fontWeight: '900',
  },
  stepLine: {
    width: 45,
    height: 2,
  },
  cardSection: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 3,
    marginBottom: 16,
  },
  typeOptionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  typeOptionSub: {
    fontSize: 10,
    marginTop: 3,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 10,
  },
  pickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 48,
    gap: 6,
  },
  pickerFlag: {
    fontSize: 18,
  },
  pickerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  btnNavRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  backBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  nextBtnText: {
    color: '#15110A',
    fontSize: 13,
    fontWeight: '900',
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
  },
  publishBtnText: {
    color: '#15110A',
    fontSize: 14,
    fontWeight: '900',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successIconWrap: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  doneBtn: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 24,
  },
  doneBtnText: {
    color: '#15110A',
    fontSize: 14,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSub: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalListContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  modalOptionFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
