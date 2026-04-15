import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminHeader } from '../components/AdminHeader';
import type { AdminCouponStackParamList } from '../../../navigation/types';
import { adminUi } from '../../../theme/adminUi';
import { generateCouponBatch } from '../../../api/coupons';
import { isApiError, userFacingApiMessage } from '../../../api/client';
import { randomBatchDisplayNumber } from './couponGenerationUtils';

type Nav = NativeStackNavigationProp<
  AdminCouponStackParamList,
  'AdminCouponGenerate'
>;

const SLAB_OPTIONS = [500, 1000, 2000, 5000, 10000] as const;

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    n,
  );
}

export function AdminCouponGenerateScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [slabPts, setSlabPts] = useState<number | null>(null);
  const [slabOpen, setSlabOpen] = useState(false);
  const [qtyRaw, setQtyRaw] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const quantity = useMemo(() => {
    const n = parseInt(qtyRaw.replace(/[^\d]/g, ''), 10);
    return Number.isFinite(n) ? n : 0;
  }, [qtyRaw]);

  const totalPts =
    slabPts != null && quantity > 0 ? slabPts * quantity : 0;

  const goDashboard = () => {
    navigation.getParent()?.navigate('AdminHome');
  };

  const onGenerateBatch = async () => {
    setError(null);
    if (slabPts == null) {
      setError('Select a coupon slab value.');
      return;
    }
    if (quantity < 1) {
      setError('Enter a valid number of coupons.');
      return;
    }
    setGenerating(true);
    try {
      const result = await generateCouponBatch({ points: slabPts, quantity });
      const previewCodes = result.slice(0, 80).map(c => c.code);
      const firstCouponId = result[0]?.id ?? '';
      const createdAtIso = result[0]?.createdAt ?? new Date().toISOString();
      navigation.navigate('AdminCouponPreview', {
        slabPts,
        quantity,
        totalPts,
        batchNumber: randomBatchDisplayNumber(),
        previewCodes,
        firstCouponId,
        createdAtIso,
      });
    } catch (e) {
      if (isApiError(e)) setError(userFacingApiMessage(e.message));
      else setError('Could not generate batch. Check server.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader title="Generate Coupons" onBack={goDashboard} />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 24 + insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Define the parameters for your new industrial coupon batch. Values
          are calculated instantly.
        </Text>

        <Text style={styles.fieldLabel}>COUPON SLAB VALUE</Text>
        <Pressable
          style={({ pressed }) => [
            styles.selectField,
            pressed && styles.selectFieldPressed,
          ]}
          onPress={() => setSlabOpen(true)}>
          <Text
            style={
              slabPts != null ? styles.selectValue : styles.selectPlaceholder
            }>
            {slabPts != null
              ? `${formatInt(slabPts)} pts`
              : 'Select Value (e.g., 1000, 2000)'}
          </Text>
          <Text style={styles.chevron}>{'\u2304'}</Text>
        </Pressable>

        <Text style={styles.fieldLabel}>NUMBER OF COUPONS</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter Quantity"
          placeholderTextColor={adminUi.labelMuted}
          value={qtyRaw}
          onChangeText={t => {
            setQtyRaw(t);
            setError(null);
          }}
          keyboardType="number-pad"
          returnKeyType="done"
        />

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>TOTAL VALUE OF THE BATCH</Text>
          <Text style={styles.summaryValue}>
            {formatInt(totalPts)} PTS
          </Text>
          <View style={styles.infoCallout}>
            <Text style={styles.infoIcon}>{'\u2139'}</Text>
            <Text style={styles.infoText}>
              Generating this batch will authorize{' '}
              <Text style={styles.infoBold}>
                {quantity > 0 ? formatInt(quantity) : '\u2014'} unique codes
              </Text>{' '}
              to be distributed via the partner portal.
            </Text>
          </View>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            generating && styles.primaryBtnDisabled,
            pressed && !generating && styles.primaryBtnPressed,
          ]}
          disabled={generating}
          onPress={() => { onGenerateBatch().catch(() => {}); }}>
          {generating ? (
            <ActivityIndicator color={adminUi.white} />
          ) : (
            <>
              <Text style={styles.primaryIcon}>{'\u26A1'}</Text>
              <Text style={styles.primaryBtnText}>Generate Batch</Text>
            </>
          )}
        </Pressable>
      </ScrollView>

      <Modal
        visible={slabOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSlabOpen(false)}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setSlabOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={e => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Coupon slab</Text>
            {SLAB_OPTIONS.map(opt => (
              <Pressable
                key={opt}
                style={({ pressed }) => [
                  styles.modalRow,
                  pressed && styles.modalRowPressed,
                  slabPts === opt && styles.modalRowSelected,
                ]}
                onPress={() => {
                  setSlabPts(opt);
                  setSlabOpen(false);
                  setError(null);
                }}>
                <Text style={styles.modalRowText}>{formatInt(opt)} pts</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: adminUi.screenBg },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  intro: {
    fontSize: 15,
    lineHeight: 22,
    color: adminUi.labelMuted,
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: adminUi.labelMuted,
    marginBottom: 8,
  },
  selectField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: adminUi.white,
    borderWidth: 1,
    borderColor: adminUi.borderInput,
    borderRadius: adminUi.radiusMd,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 20,
  },
  selectFieldPressed: { opacity: 0.92 },
  selectValue: {
    fontSize: 16,
    fontWeight: '600',
    color: adminUi.navyAlt,
  },
  selectPlaceholder: {
    fontSize: 16,
    color: adminUi.lightGray,
  },
  chevron: {
    fontSize: 18,
    color: adminUi.labelMuted,
    marginTop: -6,
  },
  input: {
    backgroundColor: adminUi.white,
    borderWidth: 1,
    borderColor: adminUi.borderInput,
    borderRadius: adminUi.radiusMd,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: adminUi.navyAlt,
    marginBottom: 20,
  },
  summaryCard: {
    borderRadius: adminUi.radiusLg,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#F8FAFC',
    padding: 18,
    marginBottom: 20,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: adminUi.navyAlt,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    color: adminUi.navyAlt,
    marginBottom: 14,
  },
  infoCallout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  infoIcon: {
    fontSize: 16,
    color: '#2563EB',
    fontWeight: '700',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#1E40AF',
  },
  infoBold: { fontWeight: '800' },
  error: {
    color: '#B45309',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: adminUi.accentOrange,
    borderRadius: adminUi.radiusLg,
    paddingVertical: 16,
    marginTop: 8,
  },
  primaryBtnPressed: { opacity: 0.92 },
  primaryBtnDisabled: { opacity: 0.6 },
  primaryIcon: { fontSize: 18 },
  primaryBtnText: {
    color: adminUi.white,
    fontSize: 17,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: adminUi.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: adminUi.navyAlt,
    marginBottom: 12,
  },
  modalRow: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: adminUi.borderGray,
  },
  modalRowPressed: { backgroundColor: adminUi.offWhite },
  modalRowSelected: { backgroundColor: '#FFF7ED' },
  modalRowText: {
    fontSize: 16,
    fontWeight: '600',
    color: adminUi.navyAlt,
  },
});
