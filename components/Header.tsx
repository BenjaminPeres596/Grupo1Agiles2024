import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Usaremos iconos de Expo

interface HeaderProps {
  title: string;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onProfilePress, onSearchPress }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Botón de perfil */}
      <TouchableOpacity onPress={onProfilePress} style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* Título centrado */}
      <Text style={styles.title}>{title}</Text>

      {/* Botón de búsqueda */}
      <TouchableOpacity onPress={onSearchPress} style={styles.iconContainer}>
        <Ionicons name="search-outline" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EF4423', // Color rojo del header
    height: 60,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  iconContainer: {
    padding: 8,
  },
});

export default Header;
