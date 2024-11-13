import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

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
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={ onProfilePress } style={styles.iconContainer}>
        <Ionicons name="person-circle-outline" size={32} color="white" />
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
});

export default Header;
