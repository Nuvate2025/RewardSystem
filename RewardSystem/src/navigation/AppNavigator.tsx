import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { rootNavigationRef } from './rootNavigation';
import { MainTabNavigator } from './MainTabNavigator';
import { AdminTabNavigator } from './AdminTabNavigator';
import { LoginScreen } from '../screens/LoginScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { SetPinScreen } from '../screens/SetPinScreen';
import { SignUpScreen } from '../screens/SignUpScreen';
import { SplashScreen } from '../screens/SplashScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#FFFFFF',
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer ref={rootNavigationRef} theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#FFFFFF' },
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="SetPin" component={SetPinScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="AdminMain" component={AdminTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
