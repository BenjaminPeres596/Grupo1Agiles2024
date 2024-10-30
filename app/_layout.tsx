import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';

const DraweLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <Drawer
        screenOptions={{
          headerShown: false, // Oculta el header adicional de Drawer
        }}
      >
        <Drawer.Screen name='(tabs)/index' options={{
          drawerLabel: 'Inicio',
          drawerIcon: ({ size, color }) => (
            <Ionicons name='home-outline' size={size} color={color} />
          ),
        }}/>
        <Drawer.Screen name='(tabs)/favorites' options={{
          drawerLabel: 'Favoritos',
          drawerIcon: ({ size, color }) => (
            <Ionicons name='heart-outline' size={size} color={color} />
          ),
        }}/>
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default DraweLayout;
