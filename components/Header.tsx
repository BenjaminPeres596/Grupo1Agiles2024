import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons"; // Usaremos iconos de Expo

interface HeaderProps {
  title: string;
  onProfilePress?: () => void;
  onSearchPress?: () => void;
  onSearchChange?: (text: string) => void;
  searchText?: string;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onProfilePress,
  onSearchPress,
  onSearchChange,
  searchText,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false); // Estado para mostrar/ocultar el input de búsqueda

  return (
    <View style={styles.headerContainer}>
      {/* Botón de perfil */}
      <TouchableOpacity onPress={onProfilePress} style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
      </TouchableOpacity>

      {/* Título centrado */}
      <View style={styles.titleContainer}>
        {isSearchVisible ? (
          <TextInput
            value={searchText}
            style={styles.searchInput}
            placeholder="Buscar restaurante"
            placeholderTextColor="#ccc"
            onChangeText={onSearchChange} // Maneja el cambio de texto
          />
        ) : (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subText}>Comer seguro, sin gluten</Text>
          </>
        )}
      </View>

      {/* Botón de búsqueda */}
      <TouchableOpacity
        onPress={() => setIsSearchVisible(!isSearchVisible)} // Alterna la visibilidad del input de búsqueda
        style={styles.iconContainer}
      >
        <Ionicons
          name={isSearchVisible ? "close-outline" : "search-outline"}
          size={28}
          color="white"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EF4423", // Color rojo del header
    height: 90,
    paddingHorizontal: 16,
    marginTop: 0,
    paddingTop: 25,
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  subText: {
    fontSize: 12, // Texto más pequeño
    color: "white", // Color blanco igual que el título
    marginTop: 4, // Separación del título
  },
  iconContainer: {
    padding: 8,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    width: 200,
    color: "#000",
  },
});

export default Header;
