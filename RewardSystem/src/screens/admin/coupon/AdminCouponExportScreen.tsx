import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
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

type Nav = NativeStackNavigationProp<
  AdminCouponStackParamList,
  'AdminCouponExport'
>;
type R = RouteProp<AdminCouponStackParamList, 'AdminCouponExport'>;

type ExportFormat = 'pdf' | 'csv';

function formatInt(n: number): string {
  return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(
    n,
  );
}

export function AdminCouponExportScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<R>();
  const { batchId, createdAtLabel, totalCoupons, totalPts, slabPts } = params;
  const [format, setFormat] = useState<ExportFormat>('pdf');

  const onDownload = () => {
    Alert.alert(
      'Export',
      `Demo: would download ${format.toUpperCase()} for batch ${batchId} (${formatInt(totalCoupons)} coupons).`,
      [{ text: 'OK' }],
    );
  };

  const onDiscard = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'AdminCouponGenerate' }],
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <AdminHeader title="Export Batch" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Export Coupon Batch</Text>

        <View style={styles.detailCard}>
          <Text style={styles.watermark}>{'\u{1F39F}'}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>BATCH ID</Text>
            <Text style={styles.detailVal}>#{batchId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>CREATION DATE</Text>
            <Text style={styles.detailVal}>{createdAtLabel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>TOTAL COUPONS</Text>
            <Text style={styles.detailVal}>{formatInt(totalCoupons)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLbl}>TOTAL VALUE</Text>
            <Text style={styles.detailValOrange}>
              {formatInt(totalPts)} Pts
            </Text>
          </View>
          <Text style={styles.slabHint}>
            Slab: {formatInt(slabPts)} pts per coupon
          </Text>
        </View>

        <Text style={styles.formatSectionLbl}>SELECT EXPORT FORMAT</Text>

        <Pressable
          style={({ pressed }) => [
            styles.formatRow,
            format === 'pdf' && styles.formatRowSelected,
            pressed && styles.formatRowPressed,
          ]}
          onPress={() => setFormat('pdf')}>
          <Text style={styles.formatIcon}>{'\u{1F4C4}'}</Text>
          <Text style={styles.formatTitle}>PDF (Print Ready)</Text>
          {format === 'pdf' ? (
            <Text style={styles.check}>{'\u2713'}</Text>
          ) : (
            <View style={styles.checkPlaceholder} />
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.formatRow,
            format === 'csv' && styles.formatRowSelected,
            pressed && styles.formatRowPressed,
            { marginTop: 12 },
          ]}
          onPress={() => setFormat('csv')}>
          <Text style={styles.formatIcon}>{'\u{1F4CA}'}</Text>
          <Text style={styles.formatTitle}>Transaction History</Text>
          {format === 'csv' ? (
            <Text style={styles.check}>{'\u2713'}</Text>
          ) : (
            <View style={styles.checkPlaceholder} />
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.primaryBtn,
            pressed && styles.primaryBtnPressed,
          ]}
          onPress={onDownload}>
          <Text style={styles.downloadIcon}>{'\u2B07'}</Text>
          <Text style={styles.primaryBtnText}>Download</Text>
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
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: adminUi.navyAlt,
    marginBottom: 18,
  },
  detailCard: {
    borderRadius: adminUi.radiusLg,
    backgroundColor: adminUi.cardBg,
    padding: 18,
    marginBottom: 28,
    ...adminUi.shadowCard,
    position: 'relative',
    overflow: 'hidden',
  },
  watermark: {
    position: 'absolute',
    right: 8,
    top: 8,
    fontSize: 44,
    opacity: 0.12,
  },
  detailRow: { marginBottom: 14 },
  detailLbl: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: adminUi.labelMuted,
    marginBottom: 4,
  },
  detailVal: {
    fontSize: 17,
    fontWeight: '800',
    color: adminUi.navyAlt,
  },
  detailValOrange: {
    fontSize: 20,
    fontWeight: '800',
    color: adminUi.accentOrange,
  },
  slabHint: {
    fontSize: 13,
    color: adminUi.labelMuted,
    marginTop: 4,
  },
  formatSectionLbl: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: adminUi.labelMuted,
    marginBottom: 12,
  },
  formatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: adminUi.radiusMd,
    backgroundColor: adminUi.offWhite,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  formatRowSelected: {
    borderColor: adminUi.accentOrange,
    backgroundColor: '#FFF7ED',
  },
  formatRowPressed: { opacity: 0.92 },
  formatIcon: { fontSize: 26, marginRight: 12 },
  formatTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: adminUi.navyAlt,
  },
  check: {
    fontSize: 18,
    fontWeight: '900',
    color: adminUi.accentOrange,
  },
  checkPlaceholder: { width: 18 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: adminUi.accentOrange,
    borderRadius: adminUi.radiusLg,
    paddingVertical: 16,
    marginTop: 28,
  },
  primaryBtnPressed: { opacity: 0.92 },
  downloadIcon: {
    fontSize: 18,
    color: adminUi.white,
    fontWeight: '800',
  },
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
  },
  discard: {
    fontSize: 15,
    fontWeight: '700',
    color: adminUi.accentOrange,
  },
  discardArrow: {
    fontSize: 16,
    color: adminUi.accentOrange,
  },
});
