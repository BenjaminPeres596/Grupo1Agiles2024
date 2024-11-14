import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const LoadingScreen = () => {
  return (
    <LinearGradient colors={['#EF4423', '#FFA726']} style={styles.container}>
      <FontAwesome6 name="plate-wheat" size={100} color="#FFFFFF" style={styles.icon} />
      <Text style={styles.appName}>Donde Como</Text>
      <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginBottom: 20,
    letterSpacing: 2,
  },
  loader: {
    marginTop: 20,
  },
});

export default LoadingScreen;
