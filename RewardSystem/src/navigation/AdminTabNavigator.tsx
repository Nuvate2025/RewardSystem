import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { AdminTabBar } from './AdminTabBar';
import { AdminUsersStack } from './AdminUsersStack';
import { AdminApprovalsStack } from './AdminApprovalsStack';
import { AdminProfileStack } from './AdminProfileStack';
import { SuperAdminDashboardScreen } from '../screens/admin/SuperAdminDashboardScreen';
import { AdminCouponStack } from './AdminCouponStack';
import type { AdminTabParamList } from './types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

function AdminTabBarOuter(props: BottomTabBarProps) {
  return <AdminTabBar {...props} />;
}

export function AdminTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={AdminTabBarOuter}
      screenOptions={{
        headerShown: false,
        lazy: false,
        tabBarHideOnKeyboard: true,
      }}
      initialRouteName="AdminHome">
      <Tab.Screen name="AdminHome" component={SuperAdminDashboardScreen} />
      <Tab.Screen name="AdminUsers" component={AdminUsersStack} />
      <Tab.Screen name="AdminScan" component={AdminCouponStack} />
      <Tab.Screen name="AdminApprovals" component={AdminApprovalsStack} />
      <Tab.Screen name="AdminProfile" component={AdminProfileStack} />
    </Tab.Navigator>
  );
}
