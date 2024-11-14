import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import HomeScreen from './(tabs)';
import LoginScreen from '../components/LoginScreen';

const DrawerLayout = () => {
  const { user } = useAuth();

  return user ? <HomeScreen /> : <LoginScreen />;
};

const App = () => {
  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <DrawerLayout />
      </GestureHandlerRootView>
    </AuthProvider>
  );
};

export default App;