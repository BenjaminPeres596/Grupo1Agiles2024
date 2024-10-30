import 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './(tabs)';

const DraweLayout = () => {
  return (
    <HomeScreen/>
  );
};

export default DraweLayout;
