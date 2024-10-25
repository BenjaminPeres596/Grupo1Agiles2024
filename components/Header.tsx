import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HeaderProps {
  title: string;
  onProfilePress?: () => void;
  onSearchPress?: () => void; // Cambiado para solo abrir el campo de búsqueda
  searchText?: string;
  onSearchChange?: (text: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onProfilePress,
  onSearchPress,
  searchText = "",
  onSearchChange,
}) => {
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleSearchPress = () => {
    setIsSearchVisible(!isSearchVisible); // Alterna visibilidad del campo de búsqueda
    onSearchPress?.(); // Llama a la función para abrir el campo de búsqueda
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={onProfilePress} style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
      </TouchableOpacity>

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

      <TouchableOpacity
        onPress={handleSearchPress}
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
    backgroundColor: "#EF4423",
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
    fontSize: 12,
    color: "white",
    marginTop: 4,
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
