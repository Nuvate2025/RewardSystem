import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CartActive,
  CartInactive,
  HomeActive,
  HomeInactive,
  ProfileActive,
  ProfileInactive,
  RewardsActive,
  RewardsInactive,
  ScannerWhite,
} from '../assets/svgs';
import type { MainTabParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { figma } from '../theme/figmaTokens';

const activeColor = colors.navyAlt;
const inactiveColor = colors.mutedGray;
const iconSize = 24;

function TabIcon({
  name,
  focused,
}: {
  name: 'home' | 'cart' | 'scan' | 'rewards' | 'profile';
  focused: boolean;
}) {
  switch (name) {
    case 'home':
      return focused ? (
        <HomeActive width={iconSize} height={iconSize} />
      ) : (
        <HomeInactive width={iconSize} height={iconSize} />
      );
    case 'cart':
      return focused ? (
        <CartActive width={iconSize} height={iconSize} />
      ) : (
        <CartInactive width={iconSize} height={iconSize} />
      );
    case 'scan':
      return (
        <View
          style={[
            styles.scanOuter,
            focused && styles.scanOuterActive,
          ]}>
          <ScannerWhite width={28} height={28} />
        </View>
      );
    case 'rewards':
      return focused ? (
        <RewardsActive width={iconSize} height={iconSize} />
      ) : (
        <RewardsInactive width={iconSize} height={iconSize} />
      );
    case 'profile':
      return focused ? (
        <ProfileActive width={iconSize} height={iconSize} />
      ) : (
        <ProfileInactive width={iconSize} height={iconSize} />
      );
  }
}

export function MainTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const activeRoute = state.routes[state.index]?.name;

  const go = (name: keyof MainTabParamList) => {
    navigation.navigate(name);
  };

  const tab = (
    routeName: keyof MainTabParamList,
    label: string,
    icon: 'home' | 'cart' | 'scan' | 'rewards' | 'profile',
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
        {tab('Home', 'Home', 'home')}
        {tab('Cart', 'Cart', 'cart')}
        {tab('Scan', 'Scan', 'scan', true)}
        {tab('Rewards', 'Rewards', 'rewards')}
        {tab('Profile', 'Profile', 'profile')}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderGray,
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
    paddingHorizontal: 8,
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
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  scanOuter: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: colors.primaryOrange,
    alignItems: 'center',
    justifyContent: 'center',
    ...figma.shadowCta,
  },
  scanOuterActive: {
    transform: [{ scale: 1.02 }],
  },
});
