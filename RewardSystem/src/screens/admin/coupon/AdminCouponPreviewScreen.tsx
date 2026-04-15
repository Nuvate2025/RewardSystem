import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminHeader } from '../components/AdminHeader';
import type { AdminCouponStackParamList } from '../../../navigation/types';
import { adminUi } from '../../../theme/adminUi';
import {
  formatBatchCreatedLabel,
  randomExportBatchId,
} from './couponGenerationUtils';

type Nav = NativeStackNavigationProp<
  AdminCouponStackParamList,
  'AdminCouponPreview'
>;
type R = RouteProp<AdminCouponStackParamList, 'AdminCouponPreview'>;

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    n,
  );
}

export function AdminCouponPreviewScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { slabPts, quantity, totalPts, batchNumber, previewCodes, firstCouponId, createdAtIso } = params;

  const visibleCodes = previewCodes;
  const moreCount = Math.max(0, quantity - visibleCodes.length);

  const onConfirm = () => {
    // Use the first coupon ID as the batch anchor; generate a display ID for the export screen
    const batchId = firstCouponId
      ? `GN-${firstCouponId.replace(/-/g, '').slice(0, 5).toUpperCase()}`
      : randomExportBatchId();
    navigation.navigate('AdminCouponExport', {
      batchId,
      createdAtLabel: formatBatchCreatedLabel(new Date(createdAtIso)),
      totalCoupons: quantity,
      totalPts,
      slabPts,
    });
  };

  const onDiscard = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader title="Coupon Batch Preview" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroAccent} />
          <View style={styles.heroBody}>
            <Text style={styles.heroLabel}>NO OF COUPONS</Text>
            <Text style={styles.heroCount}>{formatInt(quantity)}</Text>
            <Text style={styles.heroSub}>Coupons Generated</Text>
            <View style={styles.valueBadge}>
              <Text style={styles.valueBadgeIcon}>{'\u2728'}</Text>
              <Text style={styles.valueBadgeText}>
                Value: {formatInt(slabPts)} Pts each
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Live Preview</Text>
        <View style={styles.listCard}>
          {visibleCodes.map((item, index) => (
            <React.Fragment key={`${item}-${index}`}>
              {index > 0 ? <View style={styles.rowSep} /> : null}
              <Pressable
                style={({ pressed }) => [
                  styles.row,
                  pressed && styles.rowPressed,
                ]}>
                <Text style={styles.qrGlyph}>{'\u25A6'}</Text>
                <View style={styles.rowMid}>
                  <Text style={styles.code}>{item}</Text>
                  <Text style={styles.batchSub}>
                    Active Batch #{batchNumber}
                  </Text>
                </View>
                <Text style={styles.chevron}>{'\u203A'}</Text>
              </Pressable>
            </React.Fragment>
          ))}
        </View>
        {moreCount > 0 ? (
          <Text style={styles.moreHint}>
            + {formatInt(moreCount)} more in this batch (shown in export)
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={onConfirm}>
          <Text style={styles.primaryBtnText}>Confirm</Text>
        </Pressable>
        <Pressable onPress={onDiscard} style={styles.discardWrap}>
          <Text style={styles.discard}>Cancel/Discard</Text>
          <Text style={styles.discardArrow}>{'\u2192'}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: adminUi.screenBg },
  scroll: { paddingHorizontal: 20, paddingTop: 8 },
  heroCard: {
    flexDirection: 'row',
    borderRadius: adminUi.radiusLg,
    backgroundColor: adminUi.creamCard,
    borderWidth: 1,
    borderColor: adminUi.creamCardBorder,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroAccent: {
    width: 5,
    backgroundColor: adminUi.accentOrange,
  },
  heroBody: { flex: 1, padding: 18 },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: adminUi.sectionTitle,
    marginBottom: 6,
  },
  heroCount: {
    fontSize: 36,
    fontWeight: '800',
    color: adminUi.navyAlt,
    lineHeight: 40,
  },
  heroSub: {
    fontSize: 15,
    color: adminUi.labelMuted,
    marginBottom: 14,
  },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: adminUi.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: adminUi.radiusPill,
    borderWidth: 1,
    borderColor: adminUi.borderGray,
  },
  valueBadgeIcon: { fontSize: 14 },
  valueBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: adminUi.navyAlt,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: adminUi.sectionTitle,
    marginBottom: 12,
  },
  listCard: {
    borderRadius: adminUi.radiusLg,
    backgroundColor: adminUi.cardBg,
    ...adminUi.shadowCard,
    marginBottom: 20,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: adminUi.cardBg,
  },
  rowPressed: { backgroundColor: adminUi.offWhite },
  rowSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: adminUi.borderGray,
    marginLeft: 52,
  },
  qrGlyph: {
    fontSize: 22,
    color: adminUi.labelMuted,
    marginRight: 12,
    width: 28,
    textAlign: 'center',
  },
  rowMid: { flex: 1 },
  code: {
    fontSize: 16,
    fontWeight: '800',
    color: adminUi.navyAlt,
  },
  batchSub: {
    fontSize: 13,
    color: adminUi.labelMuted,
    marginTop: 2,
  },
  chevron: {
    fontSize: 22,
    color: adminUi.lightGray,
    fontWeight: '300',
  },
  primaryBtn: {
    backgroundColor: adminUi.accentOrange,
    borderRadius: adminUi.radiusLg,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnPressed: { opacity: 0.92 },
  primaryBtnText: {
    color: adminUi.white,
    fontSize: 17,
    fontWeight: '800',
  },
  discardWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingBottom: 8,
  },
  discard: {
    fontSize: 15,
    fontWeight: '700',
    color: adminUi.labelMuted,
  },
  discardArrow: {
    fontSize: 16,
    color: adminUi.labelMuted,
  },
  moreHint: {
    fontSize: 13,
    color: adminUi.labelMuted,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: -8,
  },
});
