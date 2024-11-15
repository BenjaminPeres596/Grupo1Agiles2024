import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as Linking from "expo-linking";

type RestaurantLocationProps = {
  address: string; // Dirección del restaurante o coordenadas.
};

const RestaurantLocation: React.FC<RestaurantLocationProps> = ({ address }) => {
  const handleOpenMap = () => {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    Linking.openURL(url).catch((err) =>
      console.error("Error al abrir Google Maps:", err)
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleOpenMap}>
      <Icon name="map-marker" size={16} color="#FFFFFF" />
      <Text style={styles.text}>Ir</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b5998",
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  text: {
    color: "#FFFFFF",
    marginLeft: 8,
    fontSize: 16,
  },
});

export default RestaurantLocation;
