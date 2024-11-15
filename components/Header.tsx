import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface HeaderProps {
  title: string;
  onProfilePress?: () => void; // Para manejar el click en el perfil
  onSearchPress?: () => void; // Propiedad para manejar el evento de la búsqueda
}

const Header: React.FC<HeaderProps> = ({
  title,
  onProfilePress,
  onSearchPress,
}) => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={onProfilePress} style={styles.iconContainer}>
          <Ionicons name="star-outline" size={32} color="white" />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subText}>Comer seguro, sin gluten</Text>
        </View>

        <TouchableOpacity
          onPress={onSearchPress} // Abre el modal al presionar la lupa
          style={styles.iconContainer}
        >
          <Ionicons name="search-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#EF4423",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EF4423",
    height: 75,
    paddingHorizontal: 16,
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
});

export default Header;