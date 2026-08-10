import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Button from '../components/Button';
import Input from '../components/Input';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';

const BUSINESS_TYPES = ['Sole Proprietorship', 'Partnership', 'LLP', 'Private Limited'];
const BUSINESS_CATEGORIES = ['Restaurant', 'Cafe', 'Cloud Kitchen', 'Food Truck', 'Hotel', 'Bakery'];
const BUSINESS_SUB_CATEGORIES = [
  'Multi-cuisine',
  'North Indian',
  'South Indian',
  'Chinese',
  'Fast Food',
  'Desserts',
];
const TRANSACTION_PROFILES = ['CONTROLLED', 'HIGH', 'LOW'];

const initialForm = {
  ownerName: '',
  restaurantName: '',
  email: '',
  phone: '',
  cuisineType: '',
  password: '',
  confirmPassword: '',
  businessType: BUSINESS_TYPES[0],
  businessCategory: BUSINESS_CATEGORIES[0],
  businessSubCategory: BUSINESS_SUB_CATEGORIES[0],
  address: '',
  city: '',
  state: '',
  pincode: '',
  pan: '',
  gstin: '',
  bankAccountNumber: '',
  ifsc: '',
  transactionProfile: TRANSACTION_PROFILES[0],
  tableCount: '1',
};

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validateStep = (s) => {
    if (s === 0) {
      if (!form.ownerName.trim()) return 'Owner name is required.';
      if (!form.restaurantName.trim()) return 'Restaurant name is required.';
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Enter a valid email address.';
      if (String(form.phone).replace(/\D/g, '').length < 10) return 'Enter a valid phone number.';
      if (form.password.length < 8) return 'Password must be at least 8 characters long.';
      if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    }
    if (s === 1) {
      if (!form.address.trim()) return 'Address is required.';
      if (!form.city.trim()) return 'City is required.';
      if (!form.state.trim()) return 'State is required.';
      if (!/^\d{4,6}$/.test(form.pincode)) return 'Enter a valid pincode.';
    }
    if (s === 2) {
      if (!form.pan.trim()) return 'PAN is required.';
      if (!form.bankAccountNumber.trim()) return 'Bank account number is required.';
      if (!form.ifsc.trim()) return 'IFSC code is required.';
      const tables = Number(form.tableCount);
      if (!Number.isInteger(tables) || tables < 1) {
        return 'Table count must be a positive number.';
      }
    }
    return null;
  };

  const onNext = () => {
    const err = validateStep(step);
    if (err) return setError(err);
    setError(null);
    setStep((s) => s + 1);
  };

  const onBack = () => {
    setError(null);
    setStep((s) => s - 1);
  };

  const onSubmit = async () => {
    const err = validateStep(2);
    if (err) return setError(err);
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        tableCount: Number(form.tableCount),
        phone: String(form.phone).trim(),
        pincode: String(form.pincode).trim(),
      };
      await register(payload);
      // signedIn — navigation switches to the app automatically
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.page} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={styles.spacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.progress}>
            <Text style={styles.progressLabel}>Step {step + 1} of 3</Text>
            <View style={styles.dots}>
              {[0, 1, 2].map((i) => (
                <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
              ))}
            </View>
            <Text style={styles.progressHint}>
              {step === 0
                ? 'Account & restaurant details'
                : step === 1
                ? 'Business details'
                : 'KYC, bank & table count'}
            </Text>
          </View>

          <View style={styles.card}>
            {step === 0 && (
              <>
                <Input
                  label="Owner Name"
                  placeholder="e.g. Rahul Sharma"
                  value={form.ownerName}
                  onChangeText={(v) => set('ownerName', v)}
                />
                <Input
                  label="Restaurant Name"
                  placeholder="e.g. The Spice Route"
                  value={form.restaurantName}
                  onChangeText={(v) => set('restaurantName', v)}
                />
                <Input
                  label="Email"
                  placeholder="you@restaurant.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email}
                  onChangeText={(v) => set('email', v)}
                />
                <Input
                  label="Phone"
                  placeholder="10-digit mobile number"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(v) => set('phone', v)}
                />
                <Input
                  label="Cuisine (optional)"
                  placeholder="e.g. North Indian"
                  value={form.cuisineType}
                  onChangeText={(v) => set('cuisineType', v)}
                />
                <Input
                  label="Password"
                  placeholder="Min 8 characters"
                  secureTextEntry
                  value={form.password}
                  onChangeText={(v) => set('password', v)}
                />
                <Input
                  label="Confirm Password"
                  placeholder="Repeat password"
                  secureTextEntry
                  value={form.confirmPassword}
                  onChangeText={(v) => set('confirmPassword', v)}
                />
              </>
            )}
            {step === 1 && (
              <>
                <Input
                  label="Address"
                  placeholder="Street, area, landmark"
                  value={form.address}
                  onChangeText={(v) => set('address', v)}
                />
                <View style={styles.row}>
                  <Input
                    label="City"
                    placeholder="e.g. Pune"
                    style={styles.rowHalf}
                    value={form.city}
                    onChangeText={(v) => set('city', v)}
                  />
                  <Input
                    label="State"
                    placeholder="e.g. Maharashtra"
                    style={styles.rowHalf}
                    value={form.state}
                    onChangeText={(v) => set('state', v)}
                  />
                </View>
                <Input
                  label="Pincode"
                  placeholder="6-digit pincode"
                  keyboardType="number-pad"
                  value={form.pincode}
                  onChangeText={(v) => set('pincode', v)}
                />
                <SelectRow label="Business Type">
                  <Picker selectedValue={form.businessType} onValueChange={(v) => set('businessType', v)}>
                    {BUSINESS_TYPES.map((o) => (
                      <Picker.Item key={o} label={o} value={o} />
                    ))}
                  </Picker>
                </SelectRow>
                <SelectRow label="Business Category">
                  <Picker selectedValue={form.businessCategory} onValueChange={(v) => set('businessCategory', v)}>
                    {BUSINESS_CATEGORIES.map((o) => (
                      <Picker.Item key={o} label={o} value={o} />
                    ))}
                  </Picker>
                </SelectRow>
                <SelectRow label="Business Sub Category">
                  <Picker selectedValue={form.businessSubCategory} onValueChange={(v) => set('businessSubCategory', v)}>
                    {BUSINESS_SUB_CATEGORIES.map((o) => (
                      <Picker.Item key={o} label={o} value={o} />
                    ))}
                  </Picker>
                </SelectRow>
                <SelectRow label="Transaction Profile">
                  <Picker
                    selectedValue={form.transactionProfile}
                    onValueChange={(v) => set('transactionProfile', v)}
                  >
                    {TRANSACTION_PROFILES.map((o) => (
                      <Picker.Item key={o} label={o} value={o} />
                    ))}
                  </Picker>
                </SelectRow>
              </>
            )}
            {step === 2 && (
              <>
                <Input
                  label="PAN"
                  placeholder="e.g. ABCDE1234F"
                  autoCapitalize="characters"
                  value={form.pan}
                  onChangeText={(v) => set('pan', v)}
                />
                <Input
                  label="GSTIN (optional)"
                  placeholder="e.g. 27ABCDE1234F1Z5"
                  autoCapitalize="characters"
                  value={form.gstin}
                  onChangeText={(v) => set('gstin', v)}
                />
                <View style={styles.row}>
                  <Input
                    label="Bank Account Number"
                    placeholder="Account number"
                    style={styles.rowHalf}
                    keyboardType="number-pad"
                    value={form.bankAccountNumber}
                    onChangeText={(v) => set('bankAccountNumber', v)}
                  />
                  <Input
                    label="IFSC Code"
                    placeholder="e.g. SBIN0001234"
                    style={styles.rowHalf}
                    autoCapitalize="characters"
                    value={form.ifsc}
                    onChangeText={(v) => set('ifsc', v)}
                  />
                </View>
                <Input
                  label="Number of Tables"
                  placeholder="e.g. 10"
                  keyboardType="number-pad"
                  value={form.tableCount}
                  onChangeText={(v) => set('tableCount', v)}
                />
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <View style={styles.actions}>
            {step > 0 && (
              <Button title="Back" variant="secondary" onPress={onBack} style={styles.actionBtn} />
            )}
            {step < 2 ? (
              <Button
                title="Continue"
                onPress={onNext}
                style={[styles.actionBtn, step === 0 && styles.actionFull]}
              />
            ) : (
              <Button
                title="Create Account"
                onPress={onSubmit}
                loading={submitting}
                style={[styles.actionBtn, styles.actionFull]}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SelectRow({ label, children }) {
  return (
    <View style={styles.selectWrap}>
      <Text style={styles.selectLabel}>{label}</Text>
      <View style={styles.selectBox}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: {
    width: 36,
  },
  headerTitle: {
    ...typography.title,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  progress: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLabel: {
    ...typography.label,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  progressHint: {
    ...typography.labelSm,
    color: colors.textMuted,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowHalf: {
    flex: 1,
  },
  selectWrap: {
    gap: 6,
  },
  selectLabel: {
    ...typography.label,
    color: colors.textSecondary,
  },
  selectBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    backgroundColor: colors.input,
    overflow: 'hidden',
  },
  error: {
    ...typography.labelSm,
    color: colors.danger,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
  },
  actionFull: {
    flex: 2,
  },
});