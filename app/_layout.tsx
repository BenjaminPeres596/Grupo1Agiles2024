// App.tsx
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../context/AuthContext';
import { DataProvider } from '../context/DataContext';
import HomeScreen from './(tabs)';
import LoginScreen from '../components/LoginScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack.Navigator initialRouteName="Home">
              <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </GestureHandlerRootView>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;