import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  HomeActive,
  HomeInactive,
  ProfileActive,
  ProfileInactive,
  ScannerWhite,
} from '../assets/svgs';
import type { AdminTabParamList } from './types';
import { adminUi } from '../theme/adminUi';

const activeColor = adminUi.navyAlt;
const inactiveColor = adminUi.mutedGray;
const iconSize = 24;

function UsersCardGlyph({ focused }: { focused: boolean }) {
  const c = focused ? activeColor : inactiveColor;
  return (
    <View style={styles.usersCard}>
      <View style={[styles.usersRectBack, { borderColor: c }]} />
      <View style={[styles.usersRectFront, { borderColor: c }]} />
    </View>
  );
}

function CheckApprovalsGlyph({ focused }: { focused: boolean }) {
  const c = focused ? activeColor : inactiveColor;
  return (
    <Text style={[styles.checkMark, { color: c }]}>{'\u2713'}</Text>
  );
}

function ScanCenterGlyph({ focused }: { focused: boolean }) {
  return (
    <View
      style={[
        styles.scanOuter,
        focused && styles.scanOuterActive,
      ]}>
      <View style={styles.scanInner}>
        <ScannerWhite width={26} height={26} />
        <View style={styles.plusBadge}>
          <Text style={styles.plusTxt}>+</Text>
        </View>
      </View>
    </View>
  );
}

function TabIcon({
  name,
  focused,
}: {
  name: 'home' | 'users' | 'scan' | 'approvals' | 'profile';
  focused: boolean;
}) {
  switch (name) {
    case 'home':
      return focused ? (
        <HomeActive width={iconSize} height={iconSize} />
      ) : (
        <HomeInactive width={iconSize} height={iconSize} />
      );
    case 'users':
      return <UsersCardGlyph focused={focused} />;
    case 'scan':
      return <ScanCenterGlyph focused={focused} />;
    case 'approvals':
      return <CheckApprovalsGlyph focused={focused} />;
    case 'profile':
      return focused ? (
        <ProfileActive width={iconSize} height={iconSize} />
      ) : (
        <ProfileInactive width={iconSize} height={iconSize} />
      );
  }
}

export function AdminTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  const go = (name: keyof AdminTabParamList) => {
    navigation.navigate(name);
  };

  const tab = (
    routeName: keyof AdminTabParamList,
    label: string,
    icon: 'home' | 'users' | 'scan' | 'approvals' | 'profile',
    isScan?: boolean,
  ) => {
    const focused = activeRoute === routeName;
    return (
      <Pressable
        key={routeName}
        style={[styles.tabItem, isScan && styles.tabItemScan]}
        onPress={() => go(routeName)}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        accessibilityLabel={label}>
        <TabIcon name={icon} focused={focused} />
        {!isScan ? (
          <Text
            style={[
              styles.tabLabel,
              { color: focused ? activeColor : inactiveColor },
              focused && styles.tabLabelActive,
            ]}>
            {label}
          </Text>
        ) : null}
      </Pressable>
    );
  };

  return (
    <View
      style={[
        styles.bar,
        styles.barShadow,
        { paddingBottom: Math.max(insets.bottom, 10) },
      ]}>
      <View style={styles.row}>
        {tab('AdminHome', 'Home', 'home')}
        {tab('AdminUsers', 'Users', 'users')}
        {tab('AdminScan', 'Scan', 'scan', true)}
        {tab('AdminApprovals', 'Approvals', 'approvals')}
        {tab('AdminProfile', 'Profile', 'profile')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: adminUi.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: adminUi.borderGray,
    paddingTop: 6,
  },
  barShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabItemScan: {
    marginTop: -18,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  tabLabelActive: {
    fontWeight: '800',
  },
  usersCard: {
    width: iconSize,
    height: iconSize,
    justifyContent: 'center',
  },
  usersRectBack: {
    position: 'absolute',
    left: 0,
    top: 4,
    width: 16,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    opacity: 0.45,
  },
  usersRectFront: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 16,
    height: 12,
    borderRadius: 3,
    borderWidth: 2,
    backgroundColor: adminUi.white,
  },
  checkMark: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 24,
  },
  scanOuter: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: adminUi.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
    ...adminUi.shadowCta,
  },
  scanOuterActive: {
    transform: [{ scale: 1.02 }],
  },
  scanInner: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusBadge: {
    position: 'absolute',
    right: -4,
    bottom: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: adminUi.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: adminUi.accentOrange,
  },
  plusTxt: {
    fontSize: 14,
    fontWeight: '900',
    color: adminUi.accentOrange,
    marginTop: -1,
  },
});
