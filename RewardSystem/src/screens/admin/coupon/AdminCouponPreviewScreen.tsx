import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React from 'react';
import {
  FlatList,
  Pressable,
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
import { ChevronRight, Scanner, TxTicketOrange } from '../../../assets/svgs';

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
      <View style={[styles.content, { paddingBottom: insets.bottom }]}>
        <View style={styles.heroCard}>
          <View style={styles.heroAccent} />
          <View style={styles.heroBody}>
            <Text style={styles.heroLabel}>NO OF COUPONS</Text>
            <Text style={styles.heroCount}>{formatInt(quantity)}</Text>
            <Text style={styles.heroSub}>Coupons Generated</Text>
            <View style={styles.valueBadge}>
              {/* If you want a different icon, share the SVG and I’ll swap it. */}
              <TxTicketOrange width={18} height={18} />
              <Text style={styles.valueBadgeText}>
                Value: {formatInt(slabPts)} Pts each
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Live Preview</Text>

        <View style={styles.listWrap}>
          <View style={styles.listCard}>
            <FlatList
              data={visibleCodes}
              keyExtractor={(item, index) => `${item}-${index}`}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.rowSep} />}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}>
                  <View style={styles.qrCircle}>
                    <Scanner width={22} height={22} />
                  </View>
                  <View style={styles.rowMid}>
                    <Text style={styles.code}>{item}</Text>
                    <Text style={styles.batchSub}>
                      Active Batch #{batchNumber}
                    </Text>
                  </View>
                  <ChevronRight strokeColor={adminUi.lightGray} />
                </Pressable>
              )}
              ListFooterComponent={
                moreCount > 0 ? (
                  <Text style={styles.moreHint}>
                    + {formatInt(moreCount)} more in this batch (shown in export)
                  </Text>
                ) : (
                  <View style={{ height: 8 }} />
                )
              }
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              pressed && styles.primaryBtnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Confirm coupon batch preview"
            onPress={onConfirm}>
            <Text style={styles.primaryBtnText}>Confirm</Text>
          </Pressable>
          <Pressable
            onPress={onDiscard}
            style={styles.discardWrap}
            accessibilityRole="button"
            accessibilityLabel="Discard coupon batch preview">
            <Text style={styles.discard}>Cancel/Discard</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: adminUi.screenBg },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 8 },
  heroCard: {
    flexDirection: 'row',
    borderRadius: 26,
    backgroundColor: adminUi.creamCard,
    borderWidth: 1,
    borderColor: adminUi.creamCardBorder,
    overflow: 'hidden',
    marginBottom: 22,
  },
  heroAccent: {
    width: 6,
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
    fontSize: 44,
    fontWeight: '900',
    color: adminUi.navyAlt,
    lineHeight: 48,
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
    gap: 8,
    backgroundColor: adminUi.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: adminUi.radiusPill,
    borderWidth: 1,
    borderColor: adminUi.borderGray,
  },
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
  listWrap: { flex: 1, minHeight: 140 },
  listCard: {
    borderRadius: 26,
    backgroundColor: adminUi.cardBg,
    ...adminUi.shadowCard,
    flex: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: adminUi.cardBg,
  },
  rowPressed: { backgroundColor: adminUi.offWhite },
  rowSep: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: adminUi.borderGray,
    marginLeft: 74,
  },
  qrCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
  footer: { paddingTop: 14, },
  primaryBtn: {
    backgroundColor: adminUi.accentOrange,
    borderRadius: adminUi.radiusPill,
    paddingVertical: 16,
    alignItems: 'center',
    ...adminUi.shadowCta,
  },
  primaryBtnPressed: { opacity: 0.92 },
  primaryBtnText: {
    color: adminUi.white,
    fontSize: 17,
    fontWeight: '800',
  },
  discardWrap: {
    marginTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  discard: {
    fontSize: 15,
    fontWeight: '700',
    color: adminUi.labelMuted,
  },
  moreHint: {
    fontSize: 13,
    color: adminUi.labelMuted,
    textAlign: 'center',
    marginVertical: 12,
  },
});
